import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Tag,
  Clock,
  MapPin,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import {
  placeOrder,
  getWarehouses,
  estimateEta,
  clearCartApi,
} from "@/lib/api";
import PaymentModal from "@/components/PaymentModal";
import {
  DELIVERY_FEE,
  DELIVERY_FREE_ABOVE,
  CURRENCY_SYMBOL,
  DEFAULT_LOCATION,
} from "@/lib/constants";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartTotal,
    updateItem,
    removeItem,
    cartCount,
    refreshCart,
    clearCart,
  } = useCart();
  const { isLoggedIn, openLoginModal, user } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  // ── Live ETA estimate from backend ─────────────────────────────────────────
  const { location: deliveryLocation, openModal: openLocationModal } =
    useLocation();
  const userCoords = deliveryLocation?.coords;

  const { data: etaEstimate, isLoading: etaLoading } = useQuery({
    queryKey: ["eta-estimate", userCoords?.lat, userCoords?.lng, cartCount],
    queryFn: () =>
      estimateEta(userCoords!.lat, userCoords!.lng, Math.max(cartCount, 1)),
    enabled: !!userCoords,
    staleTime: 60_000,
    retry: false,
  });

  const doPlaceOrder = async () => {
    let warehouseId = "w1";
    try {
      const warehouses = await getWarehouses();
      if (warehouses.length > 0) warehouseId = warehouses[0].warehouse_id;
    } catch {
      // use default
    }

    const items = cartItems.map((item) => ({
      product_id: item.product_id,
      qty: item.qty,
      price: item.product?.price ?? 0,
    }));

    const userLat = userCoords?.lat ?? DEFAULT_LOCATION.lat;
    const userLng = userCoords?.lng ?? DEFAULT_LOCATION.lng;

    const result = await placeOrder({
      warehouse_id: warehouseId,
      user_location: { lat: userLat, lng: userLng },
      items,
      total_amount: grandTotal,
    });

    await clearCartApi().catch(() => {});
    clearCart();
    await refreshCart();

    return {
      orderId: result.order.order_id,
      eta: result.order.eta_minutes,
      warehouseName: etaEstimate?.warehouse_name ?? "Nearest Store",
      distanceKm: etaEstimate?.distance_km ?? 0,
    };
  };

  const handleIncrease = async (product_id: string, qty: number) => {
    setLoadingId(product_id);
    try {
      await updateItem(product_id, qty + 1);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDecrease = async (product_id: string, qty: number) => {
    setLoadingId(product_id);
    try {
      await updateItem(product_id, qty - 1);
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemove = async (product_id: string) => {
    setLoadingId(product_id);
    try {
      await removeItem(product_id);
    } finally {
      setLoadingId(null);
    }
  };

  const deliveryFee = cartTotal >= DELIVERY_FREE_ABOVE ? 0 : DELIVERY_FEE;
  const grandTotal = cartTotal + deliveryFee;
  const amountNeededForFreeDelivery = DELIVERY_FREE_ABOVE - cartTotal;

  // Not logged in
  if (!isLoggedIn) {
    return (
      <>
        <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center gap-6 text-center">
          <ShoppingBag className="w-20 h-20 text-muted-foreground/40" />
          <h2 className="text-2xl font-bold text-foreground">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground">
            Login to see your saved cart items
          </p>
          <button
            onClick={openLoginModal}
            className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Login
          </button>
        </div>
      </>
    );
  }

  // Empty cart
  if (cartCount === 0) {
    return (
      <>
        <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center gap-6 text-center">
          <ShoppingBag className="w-20 h-20 text-muted-foreground/40" />
          <h2 className="text-2xl font-bold text-foreground">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground">Add items to get started</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Shop Now
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left – cart items */}
          <div className="lg:col-span-2 space-y-3">
            <h1 className="text-xl font-bold text-foreground mb-4">
              My Cart ({cartCount} {cartCount === 1 ? "item" : "items"})
            </h1>

            {/* Free delivery progress */}
            {amountNeededForFreeDelivery > 0 && (
              <div className="bg-accent/40 border border-border rounded-xl p-3 flex items-start gap-2 text-sm">
                <Tag className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">
                  Add items worth{" "}
                  <span className="font-bold text-primary">
                    {CURRENCY_SYMBOL}
                    {amountNeededForFreeDelivery}
                  </span>{" "}
                  more for <span className="font-bold">FREE delivery</span>
                </span>
              </div>
            )}
            {amountNeededForFreeDelivery <= 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <Tag className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">
                  Yay! You get FREE delivery on this order
                </span>
              </div>
            )}

            {/* Items list */}
            <div className="space-y-3">
              {cartItems.map((item) => {
                const product = item.product;
                const isLoading = loadingId === item.product_id;

                return (
                  <div
                    key={item.product_id}
                    className="bg-card border border-border rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
                  >
                    {/* Image */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-secondary rounded-lg overflow-hidden">
                      {product?.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No img
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                        {product?.name ?? item.product_id}
                      </p>
                      {product?.weight && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {product.weight}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-foreground">
                          {CURRENCY_SYMBOL}
                          {product ? product.price * item.qty : "\u2014"}
                        </span>
                        {product && (
                          <span className="text-xs text-muted-foreground line-through">
                            {CURRENCY_SYMBOL}
                            {product.originalPrice * item.qty}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Qty stepper */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      <div className="flex items-center gap-0.5 bg-primary rounded-lg overflow-hidden">
                        <button
                          onClick={() =>
                            handleDecrease(item.product_id, item.qty)
                          }
                          disabled={isLoading}
                          className="text-primary-foreground px-2 py-1.5 sm:px-2.5 sm:py-2 text-xs font-bold hover:bg-primary/80 transition-colors disabled:opacity-60"
                        >
                          <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                        <span className="text-primary-foreground text-xs sm:text-sm font-bold px-1 min-w-[20px] sm:min-w-[24px] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() =>
                            handleIncrease(item.product_id, item.qty)
                          }
                          disabled={isLoading}
                          className="text-primary-foreground px-2 py-1.5 sm:px-2.5 sm:py-2 text-xs font-bold hover:bg-primary/80 transition-colors disabled:opacity-60"
                        >
                          <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemove(item.product_id)}
                        disabled={isLoading}
                        className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40 p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right – order summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-4 sm:p-5 lg:sticky lg:top-20 space-y-4">
              {/* ETA & location strip */}
              <div className="rounded-xl border border-border bg-secondary/50 p-3 space-y-2">
                {deliveryLocation ? (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-xs">
                        <p className="font-semibold text-foreground">
                          {deliveryLocation.area}
                        </p>
                        {deliveryLocation.pincode && (
                          <p className="text-muted-foreground">
                            {deliveryLocation.pincode}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={openLocationModal}
                      className="text-xs text-primary font-medium hover:underline flex-shrink-0"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={openLocationModal}
                    className="w-full flex items-center gap-2 text-sm text-primary font-medium hover:opacity-80 transition-opacity"
                  >
                    <MapPin className="w-4 h-4" />
                    Select delivery location
                  </button>
                )}

                <div className="flex items-center gap-2 pt-1 border-t border-border">
                  <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                  {!deliveryLocation ? (
                    <span className="text-xs text-muted-foreground">
                      Set location to see delivery time
                    </span>
                  ) : etaLoading ? (
                    <span className="text-xs text-muted-foreground animate-pulse">
                      Calculating delivery time…
                    </span>
                  ) : etaEstimate ? (
                    <span className="text-xs text-foreground">
                      Delivery in{" "}
                      <span className="font-bold text-primary">
                        {etaEstimate.eta_minutes} min
                      </span>{" "}
                      from{" "}
                      <span className="font-medium">
                        {etaEstimate.warehouse_name}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        ({etaEstimate.distance_km} km away)
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Delivery in ~10–15 min
                    </span>
                  )}
                </div>
              </div>

              <h2 className="text-base font-bold text-foreground">
                Order Summary
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="font-medium text-foreground">
                    {CURRENCY_SYMBOL}
                    {cartTotal}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      FREE
                    </span>
                  ) : (
                    <span className="font-medium text-foreground">
                      {CURRENCY_SYMBOL}
                      {deliveryFee}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-lg text-foreground">
                  {CURRENCY_SYMBOL}
                  {grandTotal}
                </span>
              </div>

              <button
                onClick={() => setPaymentOpen(true)}
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
              >
                Place Order
              </button>

              <p className="text-xs text-muted-foreground text-center">
                {etaEstimate
                  ? `Estimated delivery in ${etaEstimate.eta_minutes} min`
                  : "Delivery in 10–15 minutes"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentOpen && (
        <PaymentModal
          grandTotal={grandTotal}
          itemCount={cartCount}
          deliveryFee={deliveryFee}
          onConfirm={doPlaceOrder}
          onClose={() => {
            setPaymentOpen(false);
            navigate("/");
          }}
          onViewOrders={() => {
            setPaymentOpen(false);
            navigate("/orders");
          }}
        />
      )}
    </>
  );
};

export default Cart;
