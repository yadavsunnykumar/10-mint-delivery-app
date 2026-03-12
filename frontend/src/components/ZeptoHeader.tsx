import {
  Search,
  ShoppingCart,
  User,
  MapPin,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import zeptoLogo from "@/assets/zepto-logo.png";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";
import { useTheme } from "@/context/ThemeContext";

interface ZeptoHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const ZeptoHeader = ({ searchQuery, onSearchChange }: ZeptoHeaderProps) => {
  const navigate = useNavigate();
  const { user, isLoggedIn, openLoginModal } = useAuth();
  const { cartCount } = useCart();
  const { location: deliveryLocation, openModal: openLocationModal } =
    useLocation();
  const { isDark, toggle: toggleTheme } = useTheme();

  return (
    <header className="bg-card shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <div
          className="flex-shrink-0 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={zeptoLogo} alt="Zepto" className="h-8 w-auto" />
        </div>

        {/* Location */}
        <button
          onClick={openLocationModal}
          className="hidden md:flex items-center gap-1.5 text-sm text-foreground hover:text-primary transition-colors max-w-[180px] group"
        >
          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="flex flex-col items-start leading-tight">
            {deliveryLocation ? (
              <>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Deliver to
                </span>
                <span className="font-semibold truncate max-w-[130px]">
                  {deliveryLocation.label}
                </span>
              </>
            ) : (
              <span className="font-semibold">Select Location</span>
            )}
          </span>
          <ChevronDown className="w-3 h-3 flex-shrink-0" />
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder='Search for "apple juice"'
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  navigate(
                    `/search?q=${encodeURIComponent(searchQuery.trim())}`,
                  );
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        {/* Login / User */}
        {isLoggedIn ? (
          <button
            onClick={() => navigate("/profile")}
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">
                {user?.name
                  ?.split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            </div>
            <span className="max-w-[80px] truncate">{user?.name}</span>
          </button>
        ) : (
          <button
            onClick={openLoginModal}
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <User className="w-5 h-5" />
            <span>Login</span>
          </button>
        )}

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Cart */}
        <button
          onClick={() => navigate("/cart")}
          className="relative flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="hidden sm:inline">Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default ZeptoHeader;
