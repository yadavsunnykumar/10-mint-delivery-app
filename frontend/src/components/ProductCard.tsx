import { Plus, Minus, Star } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ProductDetailModal from "./ProductDetailModal";
import { CURRENCY_SYMBOL } from "@/lib/constants";

interface ProductCardProps {
  id: string | number;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: string;
  weight: string;
  rating?: number;
  ratingCount?: string;
  tag?: string;
  stock?: number;
  category?: string;
  brand?: string;
}

const ProductCard = ({
  id,
  name,
  image,
  price,
  originalPrice,
  discount,
  weight,
  rating,
  ratingCount,
  tag,
  stock = 50,
  category,
  brand,
}: ProductCardProps) => {
  const { getQty, addToCart, updateItem } = useCart();
  const { isLoggedIn, openLoginModal } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const productId = String(id);
  const qty = getQty(productId);

  const handleAdd = async () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    setLoading(true);
    try {
      await addToCart(productId);
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Couldn't add to cart",
        description:
          (err as Error)?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIncrease = async () => {
    setLoading(true);
    try {
      await updateItem(productId, qty + 1);
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Couldn't update cart",
        description:
          (err as Error)?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecrease = async () => {
    setLoading(true);
    try {
      await updateItem(productId, qty - 1);
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Couldn't update cart",
        description:
          (err as Error)?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`bg-card rounded-xl border overflow-hidden group transition-all animate-slide-in ${
          stock === 0
            ? "border-border opacity-75"
            : "border-border hover:shadow-md"
        }`}
      >
        {/* Image */}
        <div className="relative p-3 pb-0">
          {tag && stock > 0 && (
            <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-semibold px-2 py-0.5 rounded-md z-10">
              {tag}
            </span>
          )}
          {stock === 0 && (
            <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-semibold px-2 py-0.5 rounded-md z-10">
              Out of Stock
            </span>
          )}
          {stock > 0 && stock <= 5 && (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md z-10">
              Only {stock} left
            </span>
          )}
          <img
            src={image}
            alt={name}
            onClick={() => setDetailOpen(true)}
            className="w-full h-28 object-contain group-hover:scale-105 transition-transform cursor-pointer"
          />
        </div>

        {/* Details */}
        <div className="p-3 pt-2 flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="bg-everest-success text-white text-xs font-bold px-1.5 py-0.5 rounded">
                {CURRENCY_SYMBOL}
                {price}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {CURRENCY_SYMBOL}
                {originalPrice}
              </span>
            </div>
            <p className="text-xs font-semibold text-primary">{discount}</p>

            {/* Name */}
            <h3
              onClick={() => setDetailOpen(true)}
              className="text-sm font-medium text-foreground leading-tight line-clamp-2 cursor-pointer hover:text-primary transition-colors"
            >
              {name}
            </h3>

            {/* Weight */}
            <p className="text-xs text-muted-foreground">{weight}</p>

            {/* Rating */}
            {rating && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-everest-sun text-everest-sun" />
                <span>{rating}</span>
                {ratingCount && <span>({ratingCount})</span>}
              </div>
            )}
          </div>

          {/* ADD / Qty controls */}
          <div className="flex-shrink-0 mt-5">
            {stock === 0 ? (
              <div className="bg-muted text-muted-foreground text-xs font-semibold px-2 py-1.5 rounded-lg cursor-not-allowed whitespace-nowrap">
                Out of Stock
              </div>
            ) : qty === 0 ? (
              <button
                onClick={handleAdd}
                disabled={loading}
                className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-60"
              >
                ADD
                <Plus className="w-3 h-3" />
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-primary rounded-lg overflow-hidden">
                <button
                  onClick={handleDecrease}
                  disabled={loading}
                  className="text-primary-foreground px-2 py-1.5 text-xs font-bold hover:bg-primary/80 transition-colors disabled:opacity-60"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-primary-foreground text-xs font-bold px-1">
                  {qty}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={loading}
                  className="text-primary-foreground px-2 py-1.5 text-xs font-bold hover:bg-primary/80 transition-colors disabled:opacity-60"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {detailOpen && (
        <ProductDetailModal
          product={{
            id,
            name,
            image,
            price,
            originalPrice,
            discount,
            weight,
            rating,
            ratingCount,
            tag,
            stock,
            category,
            brand,
          }}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
