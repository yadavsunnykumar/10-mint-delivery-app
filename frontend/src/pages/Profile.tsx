import {
  User,
  Phone,
  ShoppingCart,
  LogOut,
  Package,
  ChevronRight,
  ArrowLeft,
  Star,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, openLoginModal, logout } = useAuth();
  const { cartCount, cartTotal, cartItems } = useCart();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Not logged in
  if (!isLoggedIn || !user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Welcome to Zepto
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Login to view your profile, orders and more
          </p>
        </div>
        <button
          onClick={openLoginModal}
          className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Login / Sign up
        </button>
      </div>
    );
  }

  // Initials avatar
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const totalSaved = cartItems.reduce((acc, item) => {
    if (!item.product) return acc;
    return acc + (item.product.originalPrice - item.product.price) * item.qty;
  }, 0);

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

      {/* Avatar card */}
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground text-xl font-bold">
            {initials}
          </span>
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-foreground truncate">
            {user.name}
          </h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            <span>+91 {user.phone}</span>
          </div>
          <span className="inline-block mt-2 text-xs bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full">
            Zepto Member
          </span>
        </div>
      </div>

      {/* Cart summary */}
      <div
        className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => navigate("/cart")}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">My Cart</p>
            <p className="text-xs text-muted-foreground">
              {cartCount > 0
                ? `${cartCount} item${cartCount > 1 ? "s" : ""} · ₹${cartTotal}`
                : "Cart is empty"}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Savings card (when items in cart) */}
      {totalSaved > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-center gap-3">
          <Star className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
              You're saving ₹{totalSaved} on your current cart!
            </p>
            <p className="text-xs text-green-600/70 dark:text-green-500/70 mt-0.5">
              Keep adding products for more savings
            </p>
          </div>
        </div>
      )}

      {/* Menu items */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
        <button
          onClick={() => navigate("/orders")}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ClipboardList className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              My Orders
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Browse Products
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        <button
          onClick={() => navigate("/cart")}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">My Cart</span>
          </div>
          <div className="flex items-center gap-2">
            {cartCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </button>
      </div>

      {/* Account info */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-foreground">Account Info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium text-foreground">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium text-foreground">
              +91 {user.phone}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">User ID</span>
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[160px]">
              {user.user_id}
            </span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 border border-destructive text-destructive font-semibold py-3 rounded-xl hover:bg-destructive/10 transition-colors text-sm"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );
};

export default Profile;
