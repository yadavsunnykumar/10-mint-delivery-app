import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const ALL_CATEGORIES = [
  {
    name: "Fruits & Vegetables",
    slug: "fruits-vegetables",
    emoji: "🥦",
    desc: "Farm-fresh produce delivered in minutes",
    count: "200+",
  },
  {
    name: "Dairy, Bread & Eggs",
    slug: "dairy-bread-eggs",
    emoji: "🥛",
    desc: "Milk, butter, curd, bread and eggs",
    count: "150+",
  },
  {
    name: "Snacks & Munchies",
    slug: "biscuits-snacks",
    emoji: "🍿",
    desc: "Chips, biscuits, namkeen and more",
    count: "300+",
  },
  {
    name: "Beverages",
    slug: "tea-coffee",
    emoji: "☕",
    desc: "Juices, sodas, tea, coffee and energy drinks",
    count: "120+",
  },
  {
    name: "Instant Food",
    slug: "packaged-food",
    emoji: "🍜",
    desc: "Ready-to-eat meals, noodles & soups",
    count: "180+",
  },
  {
    name: "Atta, Rice & Dals",
    slug: "atta-rice-dals",
    emoji: "🌾",
    desc: "Staples, grains, pulses and flours",
    count: "100+",
  },
  {
    name: "Masala & Dry Fruits",
    slug: "masala-dry-fruits",
    emoji: "🌶️",
    desc: "Spices, masalas, nuts and dry fruits",
    count: "90+",
  },
  {
    name: "Breakfast & Sauces",
    slug: "breakfast-sauces",
    emoji: "🍳",
    desc: "Cereals, oats, jams, spreads and sauces",
    count: "110+",
  },
  {
    name: "Ice Creams",
    slug: "ice-creams",
    emoji: "🍦",
    desc: "Ice creams, kulfi and frozen desserts",
    count: "60+",
  },
  {
    name: "Frozen Food",
    slug: "frozen-food",
    emoji: "❄️",
    desc: "Frozen veggies, momos, nuggets and more",
    count: "80+",
  },
  {
    name: "Home & Cleaning",
    slug: "home-cleaning",
    emoji: "🧹",
    desc: "Cleaners, detergents and household essentials",
    count: "200+",
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    emoji: "💄",
    desc: "Skincare, haircare, grooming and makeup",
    count: "250+",
  },
  {
    name: "Electronics",
    slug: "electronics",
    emoji: "📱",
    desc: "Cables, accessories, bulbs and gadgets",
    count: "70+",
  },
  {
    name: "Toys & Games",
    slug: "toys-games",
    emoji: "🧸",
    desc: "Toys, board games and activity kits",
    count: "90+",
  },
  {
    name: "Fashion",
    slug: "fashion",
    emoji: "👗",
    desc: "Clothing, footwear and accessories",
    count: "400+",
  },
];

const CategoriesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-foreground mb-3">
            All Categories
          </h1>
          <p className="text-muted-foreground text-lg">
            Everything you need, delivered in 10 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ALL_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/shop/${cat.slug}`}
              className="group bg-card border border-border rounded-xl p-5 hover:border-primary hover:shadow-sm transition-all flex items-start gap-4"
            >
              <span className="text-4xl shrink-0">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {cat.desc}
                </p>
                <p className="text-xs font-medium text-primary mt-1.5">
                  {cat.count} products
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
