import {
  Home,
  Coffee,
  Gamepad2,
  Leaf,
  Smartphone,
  Sparkles,
  Shirt,
  UtensilsCrossed,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { CATEGORY_TABS } from "@/lib/categories";

const TAB_ICONS: Record<string, LucideIcon> = {
  All: ShoppingBag,
  Cafe: Coffee,
  Home: Home,
  Toys: Gamepad2,
  Fresh: Leaf,
  Electronics: Smartphone,
  Beauty: Sparkles,
  Fashion: Shirt,
  Kitchen: UtensilsCrossed,
};

const CategoryTabs = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Highlight the matching tab based on current URL
  const match = pathname.match(/^\/category\/([^/]+)/);
  const activeSlug = match ? match[1] : "all";

  const handleClick = (slug: string) => {
    if (slug === "all") navigate("/");
    else navigate(`/category/${slug}`);
  };

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
          {CATEGORY_TABS.map((tab) => {
            const Icon = TAB_ICONS[tab.name] ?? ShoppingBag;
            // "All" is active only on non-category routes
            const isActive =
              tab.slug === "all" ? !match : activeSlug === tab.slug;
            return (
              <button
                key={tab.slug}
                onClick={() => handleClick(tab.slug)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;
