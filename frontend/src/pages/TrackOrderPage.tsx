/**
 * TrackOrderPage — full-screen order tracker
 *
 * Features:
 *  • Google Maps  (Rider 🛵 + Customer 📍 + Store 🏪 OverlayView markers)
 *  • Smooth animated rider movement  (eased lerp via rAF, 2.5s)
 *  • Rider rotation based on travel bearing
 *  • Pulsing ring around active rider marker
 *  • Dashed route polyline
 *  • Real-time updates via Socket.io  (3-s interval)
 *  • Live ETA countdown  (distance-based, from server)
 *  • "Rider is nearby" alert banner  (< 300 m)
 *  • Confetti burst when delivered
 *  • Browser Push Notifications on status change
 *  • Status stepper  (6 steps)
 *  • Rider card with call button
 *  • Collapsible items list w/ prices
 *  • Order details, delivery info, notifications timeline
 *  • Cancel button (only when cancellable)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
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
  XCircle,
  Truck,
  ChefHat,
  UserCheck,
  CreditCard,
  Store,
  MessageCircle,
  AlertTriangle,
  RefreshCw,
  Bell,
  Navigation,
  Zap,
  PartyPopper,
} from "lucide-react";
import { io, type Socket } from "socket.io-client";
import {
  GoogleMap,
  useJsApiLoader,
  OverlayView,
  Polyline as GPolyline,
} from "@react-google-maps/api";
import confetti from "canvas-confetti";
import { getOrderTracking, type OrderTracking } from "@/lib/api";
import { SOCKET_URL, DEFAULT_LOCATION as KTM } from "@/lib/constants";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const NEARBY_METERS = 300;
const GMAPS_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined) ?? "";

// ─────────────────────────────────────────────────────────────────────────────
// Geo helpers
// ─────────────────────────────────────────────────────────────────────────────
function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// ─────────────────────────────────────────────────────────────────────────────
// Push notification helper
// ─────────────────────────────────────────────────────────────────────────────
async function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
}

function sendPush(title: string, body: string, icon = "/favicon.ico") {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon, badge: icon });
  } catch {
    /* silently ignore if blocked */
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Confetti burst
// ─────────────────────────────────────────────────────────────────────────────
function fireConfetti() {
  const opts = { particleCount: 80, spread: 70, origin: { y: 0.5 } };
  confetti({ ...opts, angle: 60, origin: { x: 0, y: 0.6 } });
  confetti({ ...opts, angle: 120, origin: { x: 1, y: 0.6 } });
  setTimeout(
    () => confetti({ particleCount: 120, spread: 90, origin: { y: 0.4 } }),
    400,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  created: "Order Placed",
  accepted: "Accepted by Store",
  packed: "Packing Your Order",
  assigned: "Rider Assigned",
  en_route: "Out for Delivery",
  delivered: "Delivered!",
  cancelled: "Cancelled",
};

const STATUS_BG: Record<string, string> = {
  created: "bg-blue-500",
  accepted: "bg-yellow-500",
  packed: "bg-orange-500",
  assigned: "bg-purple-500",
  en_route: "bg-primary",
  delivered: "bg-green-600",
  cancelled: "bg-red-500",
};

// ─────────────────────────────────────────────────────────────────────────────
// Progress stepper
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { key: "created", label: "Placed", Icon: Package },
  { key: "accepted", label: "Accepted", Icon: CheckCircle },
  { key: "packed", label: "Packed", Icon: ChefHat },
  { key: "assigned", label: "Rider", Icon: UserCheck },
  { key: "en_route", label: "On Way", Icon: Truck },
  { key: "delivered", label: "Delivered", Icon: PartyPopper },
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
        <span className="text-sm text-red-500 font-medium">
          Order Cancelled
        </span>
      </div>
    );
  }
  const current = STEP_INDEX[status] ?? 0;
  return (
    <div className="relative flex items-center justify-between py-2">
      {/* background track */}
      <div className="absolute left-0 right-0 top-[18px] h-1 bg-border rounded-full" />
      {/* filled track */}
      <div
        className="absolute left-0 top-[18px] h-1 bg-primary rounded-full transition-all duration-700"
        style={{ width: `${(current / (STEPS.length - 1)) * 100}%` }}
      />
      {STEPS.map(({ key, label, Icon }, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <div
            key={key}
            className="relative flex flex-col items-center gap-1.5 z-10"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                done
                  ? "bg-primary border-primary text-primary-foreground shadow-md"
                  : "bg-card border-border text-muted-foreground"
              } ${active ? "ring-4 ring-primary/20 ring-offset-1 ring-offset-background scale-110" : ""}`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span
              className={`text-[9px] font-bold text-center leading-tight max-w-[38px] ${done ? "text-primary" : "text-muted-foreground"}`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification timeline
// ─────────────────────────────────────────────────────────────────────────────
const NOTIF_MSGS: Record<string, string> = {
  created: "Your order has been placed successfully!",
  accepted: "The store has accepted your order.",
  packed: "Your items are being packed.",
  assigned: "A rider has been assigned to your order.",
  en_route: "Your order is out for delivery! 🛵",
  delivered: "Order delivered! Enjoy your items 🎉",
};

function NotificationsTimeline({ status }: { status: string }) {
  const currentIdx = STEP_INDEX[status] ?? 0;
  const steps = STEPS.slice(0, currentIdx + 1).reverse();
  return (
    <div className="space-y-3">
      {steps.map(({ key }, i) => (
        <div key={key} className="flex items-start gap-3">
          <div
            className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${i === 0 ? "bg-primary" : "bg-border"}`}
          />
          <p
            className={`text-xs leading-snug ${i === 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}
          >
            {NOTIF_MSGS[key] ?? key}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ETA display — shows server-calculated minutes only (distance-based, no tick)
// ─────────────────────────────────────────────────────────────────────────────
function useCountdown(etaMinutes: number | null) {
  // Simply return the latest server value formatted as a human string.
  // The backend recalculates from real distance on every poll, so we never
  // need a client-side timer — just format whatever the server sends.
  if (etaMinutes == null) return null;
  if (etaMinutes <= 0) return "Arriving now";
  if (etaMinutes === 1) return "~1 min";
  return `~${etaMinutes} min`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function TrackOrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  // Google Maps + animation refs
  const gmapRef = useRef<google.maps.Map | null>(null);
  const animRiderRef = useRef<{ lat: number; lng: number } | null>(null);
  const cancelAnimRef = useRef<number | null>(null);

  // Socket + poll
  const socketRef = useRef<Socket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // State
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [riderPos, setRiderPos] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [animatedRiderPos, setAnimatedRiderPos] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [riderBearing, setRiderBearing] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nearby, setNearby] = useState(false);
  const [nearbyDismissed, setNearbyDismissed] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [mapSize, setMapSize] = useState<"sm" | "lg">("sm");
  const [itemsOpen, setItemsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Refs for side-effect comparisons
  const prevStatusRef = useRef("");
  const prevRiderPosRef = useRef<{ lat: number; lng: number } | null>(null);

  const countdown = useCountdown(etaMinutes);

  // ── Google Maps API loader ─────────────────────────────────────────────
  const { isLoaded: gmapsLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GMAPS_KEY,
  });

  // ── Request push permission on mount ──────────────────────────────────
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // ── Fetch tracking data ────────────────────────────────────────────────
  const fetchTracking = useCallback(async () => {
    if (!orderId) return;
    try {
      const data = await getOrderTracking(orderId);
      setTracking(data);

      const newRiderPos = data.rider?.current_location ?? null;

      // bearing from prev → new position
      if (newRiderPos && prevRiderPosRef.current) {
        const bearing = getBearing(
          prevRiderPosRef.current.lat,
          prevRiderPosRef.current.lng,
          newRiderPos.lat,
          newRiderPos.lng,
        );
        setRiderBearing(bearing);
      }
      if (newRiderPos) prevRiderPosRef.current = newRiderPos;
      setRiderPos(newRiderPos);

      if (data.eta_minutes != null) setEtaMinutes(data.eta_minutes);
      setLastUpdated(new Date().toLocaleTimeString());
      setError("");

      // ── Status change side-effects ───────────────────────────────────
      const newStatus = data.order_status ?? "";
      if (newStatus !== prevStatusRef.current) {
        // Push notification
        if (newStatus === "delivered") {
          sendPush(
            "Order Delivered! 🎉",
            "Your order has arrived. Enjoy!",
            "/favicon.ico",
          );
          setDelivered(true);
          fireConfetti();
        } else if (prevStatusRef.current !== "") {
          sendPush(
            "Order Update — Everest Dash",
            STATUS_LABEL[newStatus] ?? newStatus,
          );
        }
        prevStatusRef.current = newStatus;
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load tracking data");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
    pollRef.current = setInterval(fetchTracking, 3_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchTracking]);

  // ── Socket.io — live rider location ───────────────────────────────────
  useEffect(() => {
    if (!orderId) return;
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on(`order-${orderId}`, (data: { lat: number; lng: number }) => {
      if (!data.lat || !data.lng) return;
      const newPos = { lat: data.lat, lng: data.lng };

      setRiderPos((prev) => {
        if (prev) {
          const bearing = getBearing(
            prev.lat,
            prev.lng,
            newPos.lat,
            newPos.lng,
          );
          setRiderBearing(bearing);
        }
        return newPos;
      });
      setLastUpdated(new Date().toLocaleTimeString());
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  // ── Smooth lerp animation for rider marker ────────────────────────────
  useEffect(() => {
    if (!riderPos) return;
    const from = animRiderRef.current ?? riderPos;
    const to = riderPos;
    const start = performance.now();
    const duration = 2_500;

    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      const pos = {
        lat: from.lat + (to.lat - from.lat) * eased,
        lng: from.lng + (to.lng - from.lng) * eased,
      };
      setAnimatedRiderPos(pos);
      animRiderRef.current = pos;
      if (t < 1) cancelAnimRef.current = requestAnimationFrame(step);
    };
    if (cancelAnimRef.current) cancelAnimationFrame(cancelAnimRef.current);
    cancelAnimRef.current = requestAnimationFrame(step);
    return () => {
      if (cancelAnimRef.current) cancelAnimationFrame(cancelAnimRef.current);
    };
  }, [riderPos]);

  // ── Auto-fit map bounds when rider or tracking changes ─────────────────
  useEffect(() => {
    if (!gmapsLoaded || !gmapRef.current || !tracking) return;
    const map = gmapRef.current;
    const userLoc = tracking.user_location ?? KTM;
    if (animatedRiderPos && window.google?.maps) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(animatedRiderPos);
      bounds.extend(userLoc);
      if (tracking.warehouse_location)
        bounds.extend(tracking.warehouse_location);
      map.fitBounds(bounds, 60);
    } else {
      map.setCenter(userLoc);
      map.setZoom(15);
    }
  }, [animatedRiderPos, tracking, gmapsLoaded]);

  // ── Nearby alert (React-driven) ───────────────────────────────────────
  useEffect(() => {
    if (!animatedRiderPos || !tracking?.user_location || nearby) return;
    const { lat: uLat, lng: uLng } = tracking.user_location;
    if (
      haversineMeters(animatedRiderPos.lat, animatedRiderPos.lng, uLat, uLng) <
      NEARBY_METERS
    ) {
      setNearby(true);
      sendPush(
        "Rider is nearby! 🛵",
        "Your delivery partner is less than 300 m away.",
      );
    }
  }, [animatedRiderPos, tracking, nearby]);

  // ── Re-fire confetti if already delivered when page opens ─────────────
  useEffect(() => {
    if (tracking?.order_status === "delivered" && !delivered) {
      setDelivered(true);
      fireConfetti();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking?.order_status]);

  // ─────────────────────────────────────────────────────────────────────
  // Render: loading / error
  // ─────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Loading order tracking…</p>
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-xs">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <h2 className="text-lg font-bold text-foreground">
            Tracking Unavailable
          </h2>
          <p className="text-sm text-muted-foreground">
            {error || "Order not found."}
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // Derived values
  // ─────────────────────────────────────────────────────────────────────
  const status = tracking.order_status ?? "created";
  const rider = tracking.rider;
  const isDelivered = status === "delivered";
  const isCancelled = status === "cancelled";
  const hasRider = !!rider && !isCancelled;
  const items = tracking.items ?? [];
  const canCancel = ![
    "packed",
    "assigned",
    "en_route",
    "delivered",
    "cancelled",
  ].includes(status);

  const mapHeightClass =
    mapSize === "lg" ? "h-[56vw] max-h-[440px]" : "h-[30vw] max-h-[230px]";

  const formattedDate = tracking.created_at
    ? new Date(tracking.created_at).toLocaleString("en-NP", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // ─────────────────────────────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground leading-none">
            Tracking
          </p>
          <p className="text-sm font-bold text-foreground">
            {tracking.order_id}
          </p>
        </div>
        <span
          className={`text-xs font-bold text-white px-2.5 py-1 rounded-full ${STATUS_BG[status] ?? "bg-muted"}`}
        >
          {STATUS_LABEL[status] ?? status}
        </span>
      </header>

      <div className="max-w-3xl mx-auto px-4 pb-8 space-y-4 pt-4">
        {/* ── "Rider is nearby" alert ───────────────────────────────────── */}
        {nearby && !nearbyDismissed && !isDelivered && (
          <div className="bg-orange-500 text-white rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-lg animate-bounce-once">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold leading-tight">
                  Rider is nearby! 🛵
                </p>
                <p className="text-xs opacity-90">
                  Less than 300 m from your location
                </p>
              </div>
            </div>
            <button
              onClick={() => setNearbyDismissed(true)}
              className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ── Delivered celebration ─────────────────────────────────────── */}
        {isDelivered && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-4 py-4 flex items-center gap-3 shadow-sm">
            <PartyPopper className="w-7 h-7 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-700 dark:text-green-300">
                Order Delivered!
              </p>
              <p className="text-xs text-green-600/70 dark:text-green-500">
                We hope you enjoy every item 🎉
              </p>
            </div>
            <button
              onClick={fireConfetti}
              className="ml-auto text-xs font-semibold text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700 rounded-lg px-2 py-1 hover:bg-green-100 dark:hover:bg-green-800/40 transition-colors"
            >
              🎊 Celebrate
            </button>
          </div>
        )}

        {/* ── Map card ─────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Map header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              Live Map
              {riderPos && (
                <span className="hidden sm:inline text-[10px] text-green-500 font-semibold animate-pulse">
                  ● LIVE
                </span>
              )}
              {rider?.name && hasRider && (
                <span className="hidden sm:inline text-[10px] text-primary bg-primary/10 rounded-full px-2 py-0.5 font-semibold">
                  🛵 {rider.name}
                </span>
              )}
              {lastUpdated && (
                <span className="text-[10px] text-muted-foreground font-normal">
                  · {lastUpdated}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>🛵 Rider</span>
                <span>📍 You</span>
                <span>🏪 Store</span>
              </div>
              <button
                onClick={() => setMapSize((s) => (s === "sm" ? "lg" : "sm"))}
                className="flex items-center gap-1 text-xs text-primary font-medium hover:opacity-80 transition-opacity border border-primary/30 rounded-lg px-2 py-1"
                aria-label={mapSize === "sm" ? "Expand map" : "Collapse map"}
              >
                {mapSize === "sm" ? (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" /> Expand
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" /> Collapse
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Google Map */}
          {!gmapsLoaded ? (
            <div
              className={`w-full flex items-center justify-center bg-secondary ${mapHeightClass} min-h-[140px]`}
            >
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <GoogleMap
              mapContainerClassName={`w-full transition-all duration-300 ${mapHeightClass} min-h-[140px]`}
              center={animatedRiderPos ?? tracking.user_location ?? KTM}
              zoom={animatedRiderPos ? 15 : 14}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                gestureHandling: "cooperative",
                styles: [
                  {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }],
                  },
                ],
              }}
              onLoad={(map) => {
                gmapRef.current = map;
              }}
              onUnmount={() => {
                gmapRef.current = null;
              }}
            >
              {/* Customer marker */}
              {tracking.user_location && (
                <OverlayView
                  position={tracking.user_location}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div className="-translate-x-1/2 -translate-y-full text-[28px] leading-none drop-shadow-md select-none cursor-default">
                    📍
                  </div>
                </OverlayView>
              )}
              {/* Warehouse marker */}
              {tracking.warehouse_location && (
                <OverlayView
                  position={tracking.warehouse_location}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div className="-translate-x-1/2 -translate-y-full text-[22px] leading-none drop-shadow-md select-none cursor-default">
                    🏪
                  </div>
                </OverlayView>
              )}
              {/* Rider marker with pulsing ring */}
              {animatedRiderPos && (
                <OverlayView
                  position={animatedRiderPos}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div className="relative w-11 h-11 -translate-x-1/2 -translate-y-1/2 select-none">
                    <span
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{
                        border: `2px solid ${nearby ? "#dc2626" : "#6d28d9"}99`,
                      }}
                    />
                    <span
                      className="absolute inset-[3px] rounded-full animate-ping"
                      style={{
                        border: `1.5px solid ${nearby ? "#dc2626" : "#6d28d9"}55`,
                        animationDelay: "0.55s",
                      }}
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center text-[26px] drop-shadow-lg"
                      style={{
                        transform: `rotate(${riderBearing}deg)`,
                        transition: "transform 0.4s ease",
                      }}
                    >
                      🛵
                    </div>
                  </div>
                </OverlayView>
              )}
              {/* Dashed route polyline */}
              {animatedRiderPos && tracking.user_location && (
                <GPolyline
                  path={[animatedRiderPos, tracking.user_location]}
                  options={{
                    strokeColor: "#6d28d9",
                    strokeWeight: 3,
                    strokeOpacity: 0,
                    icons: [
                      {
                        icon: {
                          path: "M 0,-1 0,1",
                          strokeOpacity: 0.85,
                          strokeWeight: 3,
                          scale: 4,
                        },
                        offset: "0",
                        repeat: "20px",
                      },
                    ],
                  }}
                />
              )}
            </GoogleMap>
          )}

          {/* Mobile legend */}
          <div className="flex sm:hidden items-center justify-center gap-4 px-4 py-1.5 text-[10px] text-muted-foreground border-t border-border">
            <span>🛵 Rider</span>
            <span>📍 You</span>
            <span>🏪 Store</span>
          </div>
        </div>

        {/* ── ETA / live countdown ──────────────────────────────────────── */}
        {!isDelivered && !isCancelled && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Clock className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {countdown ?? "Calculating…"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {STATUS_LABEL[status]} · updates every 3s
                </p>
                {rider?.name &&
                  (status === "assigned" || status === "en_route") && (
                    <p className="text-xs text-primary font-semibold mt-0.5">
                      🛵 {rider.name} is on the way
                    </p>
                  )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                Live
              </span>
            </div>
          </div>
        )}

        {/* ── Progress stepper ─────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl px-4 py-4 space-y-3 shadow-sm">
          <p className="text-sm font-bold text-foreground">Order Progress</p>
          <DeliveryProgress status={status} />
        </div>

        {/* ── Rider card ───────────────────────────────────────────────── */}
        {hasRider ? (
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-3">
              Delivery Partner
            </p>
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-lg">
                  {(rider.name ?? "R")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                {/* online dot */}
                <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 border-2 border-card rounded-full" />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-foreground">
                  {rider.name}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {rider.vehicle_number && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                      <Bike className="w-3 h-3" />
                      {rider.vehicle_number}
                    </span>
                  )}
                  {rider.phone && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                      <Phone className="w-3 h-3" />
                      {rider.phone}
                    </span>
                  )}
                </div>
              </div>
              {/* Call */}
              {rider.phone && (
                <a
                  href={`tel:${rider.phone}`}
                  className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg"
                  aria-label={`Call ${rider.name}`}
                >
                  <Phone className="w-5 h-5 text-white" />
                </a>
              )}
            </div>
          </div>
        ) : (
          !isDelivered &&
          !isCancelled && (
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {{
                    created: "Waiting for store to accept…",
                    accepted: "Preparing your order…",
                    packed: "Packing your order…",
                    assigned: "Rider picked up, heading your way…",
                  }[status] ?? "Processing your order…"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {status === "packed"
                    ? "Rider will be assigned soon"
                    : "We'll notify you when a rider is assigned"}
                </p>
              </div>
            </div>
          )
        )}

        {/* ── Items list ───────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setItemsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">
                Items Ordered ({items.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                रू{tracking.total_amount}
              </span>
              {itemsOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </button>

          {itemsOpen && (
            <div className="divide-y divide-border border-t border-border">
              {items.map((item, i) => (
                <div
                  key={`${item.product_id}-${i}`}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 object-contain rounded-lg bg-secondary flex-shrink-0 p-0.5"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.name || "Product"}
                    </p>
                    {item.weight && (
                      <p className="text-xs text-muted-foreground">
                        {item.weight}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    {item.price != null && (
                      <span className="text-sm font-bold text-foreground">
                        रू{(item.price * item.qty).toFixed(0)}
                      </span>
                    )}
                    <span className="text-xs bg-primary/10 text-primary font-bold rounded-full px-2 py-0.5">
                      ×{item.qty}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3 bg-secondary/30">
                <span className="text-sm font-semibold text-muted-foreground">
                  Order Total
                </span>
                <span className="text-base font-bold text-foreground">
                  रू{tracking.total_amount}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Order details grid ────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            Order Details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground">Order ID</p>
              <p className="text-sm font-bold text-foreground">
                {tracking.order_id}
              </p>
            </div>
            {formattedDate && (
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground">Placed At</p>
                <p className="text-xs font-medium text-foreground">
                  {formattedDate}
                </p>
              </div>
            )}
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <CreditCard className="w-2.5 h-2.5" />
                Payment
              </p>
              <p className="text-sm font-medium text-foreground capitalize">
                {tracking.payment_status ?? "—"}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <ShoppingBag className="w-2.5 h-2.5" />
                Items
              </p>
              <p className="text-sm font-medium text-foreground">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Delivery info ─────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            Delivery Info
          </p>
          <div className="space-y-2.5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">
                  Delivery Location
                </p>
                <p className="text-sm text-foreground font-medium">
                  {tracking.user_location
                    ? `${tracking.user_location.lat.toFixed(4)}, ${tracking.user_location.lng.toFixed(4)}`
                    : "Kathmandu Valley"}
                </p>
              </div>
            </div>
            {tracking.warehouse_name && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Store className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Dispatched from
                  </p>
                  <p className="text-sm text-foreground font-medium">
                    {tracking.warehouse_name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Notifications timeline ────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">
                Order Updates
              </span>
            </div>
            {notifOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {notifOpen && (
            <div className="px-4 pb-4 border-t border-border pt-3">
              <NotificationsTimeline status={status} />
            </div>
          )}
        </div>

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/help/contact")}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:bg-secondary/50 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-primary" />
            Help / Support
          </button>

          {canCancel && !isCancelled && (
            <button
              onClick={() => alert("Cancel order functionality coming soon.")}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
