import { useEffect, useRef, useState, useCallback } from "react";
import {
  X,
  Bike,
  Clock,
  Phone,
  MapPin,
  CheckCircle,
  Package,
  Maximize2,
  Minimize2,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { io, type Socket } from "socket.io-client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getOrderTracking, type OrderTracking } from "@/lib/api";
import { SOCKET_URL, DEFAULT_LOCATION as KTM } from "@/lib/constants";

// ── Custom map markers ─────────────────────────────────────────────────────
function riderDivIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="font-size:26px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,.5));transition:all .4s ease">🛵</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
}

function destDivIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,.5))">📍</div>`,
    iconSize: [28, 32],
    iconAnchor: [14, 32],
    popupAnchor: [0, -34],
  });
}

function warehouseDivIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="font-size:22px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4))">🏪</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });
}

// ── Status helpers ─────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  created: "Order Placed",
  accepted: "Accepted by Store",
  packed: "Packing Your Order",
  assigned: "Rider Assigned",
  en_route: "Out for Delivery",
  delivered: "Delivered!",
  cancelled: "Cancelled",
};

const STATUS_COLOR: Record<string, string> = {
  created: "bg-blue-500",
  accepted: "bg-yellow-500",
  packed: "bg-orange-500",
  assigned: "bg-purple-500",
  en_route: "bg-primary",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

// ── Kathmandu default fallback coords (from constants) ───────────────────
// KTM is imported above as DEFAULT_LOCATION alias

interface Props {
  orderId: string;
  onClose: () => void;
}

export default function TrackingModal({ orderId, onClose }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const warehouseMarkerRef = useRef<L.Marker | null>(null);
  const lineRef = useRef<L.Polyline | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [riderPos, setRiderPos] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [etaLeft, setEtaLeft] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [mapExpanded, setMapExpanded] = useState(false);
  const [itemsExpanded, setItemsExpanded] = useState(false);

  // ── Fetch tracking data ──────────────────────────────────────────────────
  const fetchTracking = useCallback(async () => {
    try {
      const data = await getOrderTracking(orderId);
      setTracking(data);
      if (data.rider?.current_location) {
        setRiderPos(data.rider.current_location);
      }
      if (data.eta_minutes != null) setEtaLeft(data.eta_minutes);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      // silently retry
    }
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
    pollRef.current = setInterval(fetchTracking, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchTracking]);

  // ── Socket.io for real-time rider movement ───────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on(`order-${orderId}`, (data: { lat: number; lng: number }) => {
      if (data.lat && data.lng) {
        setRiderPos({ lat: data.lat, lng: data.lng });
        setLastUpdated(new Date().toLocaleTimeString());
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  // ── Initialize Leaflet map ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const center = tracking?.user_location ?? KTM;

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    L.control
      .attribution({ position: "bottomleft", prefix: "© OSM" })
      .addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!mapContainerRef.current]);

  // ── Invalidate map size when expand/collapse changes ──────────────────────
  useEffect(() => {
    const t = setTimeout(() => mapRef.current?.invalidateSize(), 320);
    return () => clearTimeout(t);
  }, [mapExpanded]);

  // ── Update map markers whenever data changes ─────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tracking) return;

    const userLoc = tracking.user_location ?? KTM;

    if (!destMarkerRef.current) {
      destMarkerRef.current = L.marker([userLoc.lat, userLoc.lng], {
        icon: destDivIcon(),
      })
        .addTo(map)
        .bindPopup("Your location");
    } else {
      destMarkerRef.current.setLatLng([userLoc.lat, userLoc.lng]);
    }

    if (tracking.warehouse_location) {
      const wl = tracking.warehouse_location;
      if (!warehouseMarkerRef.current) {
        warehouseMarkerRef.current = L.marker([wl.lat, wl.lng], {
          icon: warehouseDivIcon(),
        })
          .addTo(map)
          .bindPopup("Store / Warehouse");
      }
    }

    const pos = riderPos ?? tracking.rider?.current_location;
    if (pos) {
      if (!riderMarkerRef.current) {
        riderMarkerRef.current = L.marker([pos.lat, pos.lng], {
          icon: riderDivIcon(),
        })
          .addTo(map)
          .bindPopup(tracking.rider?.name ?? "Delivery Rider");
      } else {
        riderMarkerRef.current.setLatLng([pos.lat, pos.lng]);
      }

      const riderLatlng: L.LatLngTuple = [pos.lat, pos.lng];
      const destLatlng: L.LatLngTuple = [userLoc.lat, userLoc.lng];

      if (!lineRef.current) {
        lineRef.current = L.polyline([riderLatlng, destLatlng], {
          color: "#6d28d9",
          weight: 3,
          dashArray: "8 6",
          opacity: 0.75,
        }).addTo(map);
      } else {
        lineRef.current.setLatLngs([riderLatlng, destLatlng]);
      }

      map.fitBounds(L.latLngBounds([riderLatlng, destLatlng]).pad(0.25), {
        animate: true,
        duration: 0.8,
      });
    } else {
      map.setView([userLoc.lat, userLoc.lng], 15, { animate: true });
    }
  }, [tracking, riderPos]);

  // ── ETA countdown ────────────────────────────────────────────────────────
  useEffect(() => {
    if (etaLeft == null || etaLeft <= 0) return;
    const t = setTimeout(
      () => setEtaLeft((e) => (e != null ? Math.max(0, e - 1) : e)),
      60_000,
    );
    return () => clearTimeout(t);
  }, [etaLeft]);

  const status = tracking?.order_status ?? "created";
  const rider = tracking?.rider;
  const isDelivered = status === "delivered";
  const isCancelled = status === "cancelled";
  const hasRider = !!rider && !isCancelled;
  const items = tracking?.items ?? [];
  const itemCount = items.length;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-background">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div>
          <p className="text-xs text-muted-foreground">Tracking Order</p>
          <p className="text-sm font-bold text-foreground">{orderId}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold text-white px-2.5 py-1 rounded-full ${STATUS_COLOR[status] ?? "bg-muted"}`}
          >
            {STATUS_LABEL[status] ?? status}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Map (compact by default, expands on button) ─────────────────── */}
      <div
        className={`flex-shrink-0 relative w-full transition-all duration-300 ${
          mapExpanded ? "flex-1 min-h-0" : "h-44 sm:h-52"
        }`}
      >
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Expand / Collapse button (floating above map) */}
        <button
          onClick={() => setMapExpanded((v) => !v)}
          className="absolute top-2 right-2 z-[400] bg-white dark:bg-gray-800 rounded-lg shadow-md p-1.5 hover:scale-105 transition-transform"
          aria-label={mapExpanded ? "Collapse map" : "Expand map"}
        >
          {mapExpanded ? (
            <Minimize2 className="w-4 h-4 text-gray-700 dark:text-gray-200" />
          ) : (
            <Maximize2 className="w-4 h-4 text-gray-700 dark:text-gray-200" />
          )}
        </button>

        {/* Mini legend overlay (only in compact mode) */}
        {!mapExpanded && (
          <div className="absolute bottom-2 left-2 z-[400] flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg px-2 py-1 text-[9px] text-gray-600 dark:text-gray-300 shadow">
            <span>🛵 Rider</span>
            <span>📍 You</span>
            <span>🏪 Store</span>
          </div>
        )}
      </div>

      {/* ── Info panel (hidden when map expanded) ──────────────────────── */}
      {!mapExpanded && (
        <div className="flex-1 overflow-y-auto border-t border-border bg-card px-4 py-3 space-y-3">
          {/* ETA row */}
          {!isDelivered && !isCancelled && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
                <Clock className="w-4 h-4 text-primary" />
                {etaLeft != null && etaLeft > 0
                  ? `Arriving in ~${etaLeft} min`
                  : "Arriving soon"}
              </div>
              {lastUpdated && (
                <p className="text-[10px] text-muted-foreground">
                  Updated {lastUpdated}
                </p>
              )}
            </div>
          )}

          {isDelivered && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-sm">
              <CheckCircle className="w-4 h-4" />
              Order delivered! Enjoy your items.
            </div>
          )}

          {/* Rider card */}
          {hasRider ? (
            <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-xl">
              <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">
                  {(rider.name ?? "R")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {rider.name}
                </p>
                <p className="text-xs text-muted-foreground">Delivery Rider</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {rider.vehicle_number && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Bike className="w-3 h-3" />
                      {rider.vehicle_number}
                    </span>
                  )}
                  {rider.phone && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {rider.phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3")}
                    </span>
                  )}
                </div>
              </div>
              {rider.phone && (
                <a
                  href={`tel:${rider.phone}`}
                  className="flex-shrink-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity"
                  aria-label={`Call ${rider.name}`}
                >
                  <Phone className="w-4 h-4 text-white" />
                </a>
              )}
            </div>
          ) : (
            !isDelivered &&
            !isCancelled && (
              <div className="flex items-center gap-2 p-3 bg-accent/40 rounded-xl text-sm text-muted-foreground">
                <Package className="w-4 h-4 flex-shrink-0" />
                {(
                  {
                    created: "Your order is being prepared at the store…",
                    accepted: "Your order is being prepared at the store…",
                    packed: "Packing your order, assigning a rider…",
                    assigned: "Rider picked up your order, heading your way…",
                  } as Record<string, string>
                )[status] ?? "Processing your order…"}
              </div>
            )
          )}

          {/* Order details section */}
          <div className="rounded-xl border border-border overflow-hidden">
            {/* Header row — always visible */}
            <button
              onClick={() => setItemsExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-secondary/50 hover:bg-secondary/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {itemCount > 0
                    ? `${itemCount} ${itemCount === 1 ? "item" : "items"} in this order`
                    : "Order items"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {tracking?.total_amount != null && (
                  <span className="text-sm font-bold text-foreground">
                    रू{tracking.total_amount}
                  </span>
                )}
                {itemsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Expanded items list */}
            {itemsExpanded && itemCount > 0 && (
              <div className="divide-y divide-border">
                {items.map((item, i) => (
                  <div
                    key={`${item.product_id}-${i}`}
                    className="flex items-center justify-between px-3 py-2 bg-card"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Package className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-xs text-foreground font-medium truncate max-w-[160px]">
                        {item.name ?? item.product_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {item.price != null && (
                        <span className="text-xs text-muted-foreground">
                          रू{item.price}
                        </span>
                      )}
                      <span className="text-xs font-bold bg-primary/10 text-primary rounded-full px-2 py-0.5">
                        ×{item.qty}
                      </span>
                    </div>
                  </div>
                ))}
                {/* Totals row */}
                {tracking?.total_amount != null && (
                  <div className="flex items-center justify-between px-3 py-2.5 bg-secondary/30">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Order Total
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      रू{tracking.total_amount}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Location row */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground pb-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>Map powered by OpenStreetMap</span>
          </div>
        </div>
      )}

      {/* ── Mini strip shown when map is expanded ──────────────────────── */}
      {mapExpanded && (
        <div className="flex-shrink-0 border-t border-border bg-card px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock className="w-4 h-4 text-primary" />
            {isDelivered
              ? "Delivered!"
              : etaLeft != null && etaLeft > 0
                ? `~${etaLeft} min away`
                : "Arriving soon"}
          </div>
          {hasRider && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-[10px]">
                  {(rider.name ?? "R")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
              </div>
              <span className="text-xs font-semibold text-foreground">
                {rider.name}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{itemCount} items</span>
          </div>
        </div>
      )}
    </div>
  );
}
