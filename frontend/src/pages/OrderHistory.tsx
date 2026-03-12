import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ShoppingBag,
  ChefHat,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders } from "@/lib/api";
import type { Order } from "@/lib/api";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  created: {
    label: "Order Placed",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: <Package className="w-3 h-3" />,
  },
  accepted: {
    label: "Accepted",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: <Clock className="w-3 h-3" />,
  },
  packed: {
    label: "Packed",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    icon: <Package className="w-3 h-3" />,
  },
  assigned: {
    label: "Rider Assigned",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: <Truck className="w-3 h-3" />,
  },
  en_route: {
    label: "On the Way",
    color: "bg-primary/10 text-primary",
    icon: <Truck className="w-3 h-3" />,
  },
  delivered: {
    label: "Delivered",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: <XCircle className="w-3 h-3" />,
  },
};

// ── Delivery progress bar ──────────────────────────────────────────────────
const STEPS: { key: string; label: string; icon: React.ReactNode }[] = [
  {
    key: "created",
    label: "Placed",
    icon: <Package className="w-3.5 h-3.5" />,
  },
  {
    key: "accepted",
    label: "Accepted",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  { key: "packed", label: "Packed", icon: <ChefHat className="w-3.5 h-3.5" /> },
  {
    key: "assigned",
    label: "Rider",
    icon: <UserCheck className="w-3.5 h-3.5" />,
  },
  {
    key: "en_route",
    label: "On the Way",
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
];

const STEP_INDEX: Record<string, number> = {
  created: 0,
  accepted: 1,
  packed: 2,
  assigned: 3,
  en_route: 4,
  delivered: 5,
};

function DeliveryProgress({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 py-2">
        <XCircle className="w-4 h-4 text-red-500" />
        <span className="text-xs text-red-500 font-medium">
          Order Cancelled
        </span>
      </div>
    );
  }

  const current = STEP_INDEX[status] ?? 0;

  return (
    <div className="pt-1">
      {/* connector + dots row */}
      <div className="relative flex items-center justify-between">
        {/* full background track */}
        <div className="absolute left-0 right-0 h-1 bg-border rounded-full" />
        {/* filled track */}
        <div
          className="absolute left-0 h-1 bg-primary rounded-full transition-all duration-700"
          style={{ width: `${(current / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((step, i) => {
          const done = i <= current;
          const active = i === current;
          return (
            <div
              key={step.key}
              className="relative flex flex-col items-center gap-1 z-10"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                  done
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-border text-muted-foreground"
                } ${active ? "ring-2 ring-primary/30 ring-offset-1 ring-offset-background" : ""}`}
              >
                {step.icon}
              </div>
              <span
                className={`text-[9px] font-semibold text-center leading-tight max-w-[40px] ${
                  done ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const status = STATUS_CONFIG[order.order_status] ?? STATUS_CONFIG.created;
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{date}</p>
          <p className="text-sm font-bold text-foreground mt-0.5">
            {order.order_id}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}
        >
          {status.icon}
          {status.label}
        </span>
      </div>

      {/* Progress bar */}
      <DeliveryProgress status={order.order_status} />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground border-t border-border pt-3">
        <span>
          {order.items.length} {order.items.length === 1 ? "item" : "items"}
        </span>
        {order.eta_minutes && (
          <>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ETA: {order.eta_minutes} min
            </span>
          </>
        )}
        <span>·</span>
        <span className="capitalize">{order.payment_status}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Order Total</span>
        <span className="text-base font-bold text-foreground">
          ₹{order.total_amount}
        </span>
      </div>
    </div>
  );
}

function hasActiveOrder(): boolean {
  try {
    const raw = localStorage.getItem("zepto_active_orders");
    if (!raw) return false;
    const orders = JSON.parse(raw) as unknown[];
    return Array.isArray(orders) && orders.length > 0;
  } catch {
    return false;
  }
}

const TERMINAL = new Set(["delivered", "cancelled"]);

function allTerminal(orders?: import("@/lib/api").Order[]): boolean {
  if (!orders?.length) return true;
  return orders.every((o) => TERMINAL.has(o.order_status));
}

const OrderHistory = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, openLoginModal } = useAuth();

  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-orders", user?.user_id],
    queryFn: () => getUserOrders(user!.user_id),
    enabled: !!user?.user_id && isLoggedIn,
    staleTime: 0,
    // Poll every 3 s while there's an active order; stop once all are terminal
    refetchInterval: (query) => {
      const data = query.state.data as import("@/lib/api").Order[] | undefined;
      return hasActiveOrder() && !allTerminal(data) ? 3_000 : false;
    },
  });

  if (!isLoggedIn || !user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 flex flex-col items-center gap-6 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/40" />
        <h2 className="text-xl font-bold text-foreground">View your orders</h2>
        <p className="text-muted-foreground text-sm">
          Login to see your order history
        </p>
        <button
          onClick={openLoginModal}
          className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-center gap-3">
        <Package className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">My Orders</h1>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-secondary rounded-2xl animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-12 text-muted-foreground">
          Failed to load orders. Please try again.
        </div>
      )}

      {orders && orders.length === 0 && (
        <div className="flex flex-col items-center gap-5 py-20 text-center">
          <Package className="w-16 h-16 text-muted-foreground/30" />
          <h2 className="text-lg font-semibold text-foreground">
            No orders yet
          </h2>
          <p className="text-muted-foreground text-sm">
            When you place an order, it will appear here
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Start Shopping
          </button>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
