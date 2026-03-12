import {
  Apple,
  Milk,
  Wheat,
  Egg,
  Package,
  IceCream,
  Coffee,
  Snowflake,
  Cookie,
  Salad,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GRID_CATEGORIES } from "@/lib/categories";

// Icons and colours keyed by slug — defined locally so no icons in categories.ts
const GRID_META: Record<string, { icon: React.ElementType; color: string }> = {
  "fruits-vegetables": { icon: Apple, color: "bg-green-100 text-green-600" },
  "dairy-bread-eggs": { icon: Milk, color: "bg-blue-100 text-blue-600" },
  "atta-rice-dals": { icon: Wheat, color: "bg-amber-100 text-amber-600" },
  "masala-dry-fruits": { icon: Salad, color: "bg-red-100 text-red-600" },
  "breakfast-sauces": { icon: Egg, color: "bg-orange-100 text-orange-600" },
  "packaged-food": { icon: Package, color: "bg-purple-100 text-purple-600" },
  "tea-coffee": { icon: Coffee, color: "bg-yellow-100 text-yellow-700" },
  "ice-creams": { icon: IceCream, color: "bg-pink-100 text-pink-600" },
  "frozen-food": { icon: Snowflake, color: "bg-cyan-100 text-cyan-600" },
  "biscuits-snacks": { icon: Cookie, color: "bg-amber-100 text-amber-700" },
};

const CategoryGrid = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-4">
        {GRID_CATEGORIES.map((cat) => {
          const meta = GRID_META[cat.slug];
          if (!meta) return null;
          const Icon = meta.icon;
          return (
            <button
              key={cat.slug}
              onClick={(e) => {
                e.currentTarget.blur();
                navigate(`/shop/${cat.slug}`);
              }}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div
                className={`w-16 h-16 rounded-2xl ${meta.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}
              >
                <Icon className="w-7 h-7" />
              </div>
              <span className="text-xs font-medium text-foreground text-center leading-tight">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryGrid;
