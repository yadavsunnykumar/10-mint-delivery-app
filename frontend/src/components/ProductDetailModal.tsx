import { X, Star, ShoppingCart, Package, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProductDetailModalProps {
  product: {
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
    category?: string;
    brand?: string;
    stock?: number;
  };
  onClose: () => void;
}

const ProductDetailModal = ({ product, onClose }: ProductDetailModalProps) => {
  const { getQty, addToCart, updateItem } = useCart();
  const { isLoggedIn, openLoginModal } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const productId = String(product.id);
  const qty = getQty(productId);
  const stock = product.stock ?? 50;
  const savings = product.originalPrice - product.price;

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
        description: (err as Error)?.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIncrease = async () => {
    setLoading(true);
    try {
      await updateItem(productId, qty + 1);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const handleDecrease = async () => {
    setLoading(true);
    try {
      await updateItem(productId, qty - 1);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Product Details
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        <div className="relative bg-secondary/50 flex items-center justify-center px-6 pt-6 pb-4 h-52">
          {product.tag && stock > 0 && (
            <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-semibold px-2 py-0.5 rounded-md">
              {product.tag}
            </span>
          )}
          {stock === 0 && (
            <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-[10px] font-semibold px-2 py-0.5 rounded-md">
              Out of Stock
            </span>
          )}
          {stock > 0 && stock <= 5 && (
            <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
              Only {stock} left
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="h-40 object-contain"
          />
        </div>

        {/* Details */}
        <div className="p-5 space-y-3">
          {product.brand && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              {product.brand}
            </p>
          )}
          <h3 className="text-lg font-bold text-foreground leading-tight">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">{product.weight}</p>

          {product.rating && (
            <div className="flex items-center gap-1.5 text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-foreground">
                {product.rating}
              </span>
              {product.ratingCount && (
                <span className="text-muted-foreground">
                  ({product.ratingCount} ratings)
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-2xl font-bold text-foreground">
              ₹{product.price}
            </span>
            <span className="text-base text-muted-foreground line-through">
              ₹{product.originalPrice}
            </span>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              {product.discount}
            </span>
          </div>

          {savings > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
              You save ₹{savings}
            </p>
          )}

          {product.category && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Package className="w-3.5 h-3.5" />
              <span className="capitalize">{product.category}</span>
            </div>
          )}

          {/* Cart action */}
          <div className="pt-2">
            {stock === 0 ? (
              <div className="w-full bg-muted text-muted-foreground font-semibold py-3 rounded-xl text-center text-sm cursor-not-allowed">
                Out of Stock
              </div>
            ) : qty === 0 ? (
              <button
                onClick={handleAdd}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            ) : (
              <div className="flex items-center justify-between bg-secondary rounded-xl p-3">
                <button
                  onClick={handleDecrease}
                  disabled={loading}
                  className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-80 disabled:opacity-60"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-lg text-foreground">
                  {qty} in cart
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={loading}
                  className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-80 disabled:opacity-60"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
