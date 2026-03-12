import { Zap, Clock, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { estimateEta } from "@/lib/api";

const DELIVERY_FEE = 25;
const DELIVERY_FREE_ABOVE = 299;

const DeliveryBanner = () => {
  const { location: deliveryLocation } = useLocation();
  const { cartTotal } = useCart();
  const userCoords = deliveryLocation?.coords;

  const { data: etaEstimate } = useQuery({
    queryKey: ["banner-eta", userCoords?.lat, userCoords?.lng],
    queryFn: () => estimateEta(userCoords!.lat, userCoords!.lng, 5),
    enabled: !!userCoords,
    staleTime: 120_000,
    retry: false,
  });

  const etaLabel = etaEstimate
    ? `${etaEstimate.eta_minutes}-min delivery`
    : "10-min delivery";

  const deliveryFee = cartTotal >= DELIVERY_FREE_ABOVE ? 0 : DELIVERY_FEE;
  const feeLabel =
    deliveryFee === 0 ? "Free Delivery" : `₹${deliveryFee} Delivery Fee`;

  return (
    <div className="bg-primary">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-6 text-primary-foreground text-sm">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4" />
          <span className="font-medium">{etaLabel}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{feeLabel}</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          <Shield className="w-4 h-4" />
          <span className="font-medium">Best Prices</span>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBanner;
