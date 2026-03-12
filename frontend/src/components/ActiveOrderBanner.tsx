import { useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Package, X, ChevronRight, Truck, CheckCircle } from "lucide-react";
import { getOrderStatus } from "@/lib/api";

interface ActiveOrder {
  orderId: string;
  eta: number;
  placedAt: number;
}

interface OrderState {
  order: ActiveOrder;
  status: string;
}

const TERMINAL = new Set(["delivered", "cancelled"]);

const STATUS_LABEL: Record<string, string> = {
  created: "Order Placed",
  accepted: "Accepted by Store",
  packed: "Packing your order",
  assigned: "Rider Assigned",
  en_route: "Out for Delivery",
  delivered: "Delivered!",
  cancelled: "Cancelled",
};

const STATUS_ICON: Record<string, ReactNode> = {
  created: <Package className="w-4 h-4" />,
  accepted: <Package className="w-4 h-4" />,
  packed: <Package className="w-4 h-4" />,
  assigned: <Truck className="w-4 h-4" />,
  en_route: <Truck className="w-4 h-4" />,
  delivered: <CheckCircle className="w-4 h-4 text-green-400" />,
  cancelled: <X className="w-4 h-4 text-red-400" />,
};

const STORAGE_KEY = "zepto_active_orders";

function readOrders(): ActiveOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ActiveOrder[];
  } catch {
    return [];
  }
}

function saveOrders(orders: ActiveOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export default function ActiveOrderBanner() {
  const navigate = useNavigate();
  const [orderStates, setOrderStates] = useState<OrderState[]>(() =>
    readOrders().map((o) => ({ order: o, status: "created" })),
  );
  const [dismissed, setDismissed] = useState(false);
  const timerRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const isPollingRef = useRef(false);

  const removeOrder = useCallback((orderId: string) => {
    setOrderStates((prev) => {
      const next = prev.filter((s) => s.order.orderId !== orderId);
      saveOrders(next.map((s) => s.order));
      return next;
    });
    setDismissed(false);
  }, []);

  const pollAll = useCallback(
    async (states: OrderState[]) => {
      if (isPollingRef.current) return; // skip if previous poll still in-flight
      isPollingRef.current = true;
      const active = states.filter((s) => !TERMINAL.has(s.status));
      try {
        await Promise.all(
          active.map(async ({ order }) => {
            try {
              const data = await getOrderStatus(order.orderId);
              setOrderStates((prev) =>
                prev.map((s) =>
                  s.order.orderId === order.orderId
                    ? { ...s, status: data.order_status }
                    : s,
                ),
              );
              if (
                TERMINAL.has(data.order_status) &&
                !timerRefs.current[order.orderId]
              ) {
                const delay = data.order_status === "delivered" ? 6_000 : 3_000;
                timerRefs.current[order.orderId] = setTimeout(() => {
                  delete timerRefs.current[order.orderId];
                  removeOrder(order.orderId);
                }, delay);
              }
            } catch {
              // individual order fetch failure — skip silently
            }
          }),
        );
      } finally {
        isPollingRef.current = false;
      }
    },
    [removeOrder],
  );

  // Polling interval — keeps running even when banner is dismissed
  useEffect(() => {
    if (!orderStates.length) return;
    pollAll(orderStates);
    const interval = setInterval(() => {
      setOrderStates((current) => {
        pollAll(current);
        return current;
      });
    }, 3_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderStates.length]);

  // Sync new orders added from same tab (PaymentModal) or cross-tab
  useEffect(() => {
    const sync = () => {
      const fresh = readOrders();
      setOrderStates((prev) => {
        const existingIds = new Set(prev.map((s) => s.order.orderId));
        const newEntries = fresh
          .filter((o) => !existingIds.has(o.orderId))
          .map((o) => ({ order: o, status: "created" as string }));
        if (!newEntries.length) return prev;
        setDismissed(false);
        return [...prev, ...newEntries];
      });
    };
    window.addEventListener("storage", sync);
    window.addEventListener("zepto_order_placed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("zepto_order_placed", sync);
    };
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    const refs = timerRefs.current;
    return () => Object.values(refs).forEach(clearTimeout);
  }, []);

  if (!orderStates.length) return null;

  // Show the most recent non-terminal order; fall back to last terminal if all done
  const activeOrders = orderStates.filter((s) => !TERMINAL.has(s.status));
  const displayState =
    activeOrders.length > 0
      ? activeOrders.reduce((a, b) =>
          a.order.placedAt > b.order.placedAt ? a : b,
        )
      : orderStates[orderStates.length - 1];

  const { order, status } = displayState;
  const pendingCount = activeOrders.length;
  const allTerminal = pendingCount === 0;
  const isDelivered = status === "delivered" && allTerminal;
  const isCancelled = status === "cancelled" && allTerminal;
  const isEnRoute = status === "en_route";

  const minsSincePlaced = Math.floor((Date.now() - order.placedAt) / 60_000);
  const etaLeft = Math.max(0, order.eta - minsSincePlaced);

  // Collapsed pill — shown when banner is dismissed but orders are still active
  if (dismissed) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {/* Floating tooltip message above the icon */}
        <div className="bg-gray-900/95 border border-gray-700 text-white text-xs rounded-xl px-3 py-2 shadow-xl max-w-[180px] text-center leading-snug">
          {pendingCount > 0
            ? `${pendingCount} order${pendingCount > 1 ? "s" : ""} in progress`
            : "Order delivered!"}
        </div>

        <button
          onClick={() => setDismissed(false)}
          className="w-12 h-12 rounded-full bg-gray-900/95 border border-gray-700 shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          aria-label={
            pendingCount > 0
              ? `${pendingCount} order${pendingCount > 1 ? "s" : ""} in progress — tap to expand`
              : "Order delivered — tap to expand"
          }
          title="View order status"
        >
          {pendingCount > 0 ? (
            <span className="relative">
              <span className="animate-ping absolute -inset-1 rounded-full bg-primary opacity-40" />
              <Truck className="w-5 h-5 text-primary relative" />
              {pendingCount > 1 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </span>
          ) : (
            <Package className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div
        className={`rounded-2xl shadow-2xl border px-4 py-3 flex items-center gap-3 backdrop-blur-sm transition-all duration-500 ${
          isDelivered
            ? "bg-green-900/90 border-green-700"
            : isCancelled
              ? "bg-red-900/90 border-red-700"
              : "bg-gray-900/95 border-gray-700"
        }`}
      >
        {/* Pulse dot — only while any orders are active */}
        {pendingCount > 0 && (
          <span className="relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
        )}

        {/* Icon */}
        <span className="flex-shrink-0 text-white">
          {STATUS_ICON[status] ?? <Package className="w-4 h-4" />}
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">
            {pendingCount > 1
              ? `${pendingCount} orders in progress`
              : (STATUS_LABEL[status] ?? "Processing…")}
          </p>
          <p className="text-[11px] text-gray-300 truncate">
            {isCancelled
              ? order.orderId
              : isDelivered
                ? `${order.orderId} · Enjoy your order!`
                : pendingCount > 1
                  ? `Latest: ${order.orderId}`
                  : isEnRoute
                    ? `${order.orderId} · Almost there`
                    : etaLeft > 0
                      ? `${order.orderId} · ~${etaLeft} min left`
                      : order.orderId}
          </p>
        </div>

        {/* Track button */}
        {!isCancelled && (
          <button
            onClick={() => navigate("/orders")}
            className="flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
          >
            Track
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-gray-500 hover:text-white transition-colors ml-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
