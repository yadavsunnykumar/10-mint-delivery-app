import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ALL_CATEGORIES } from "@/lib/constants";

const CategoriesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="mb-10">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-3">
            All Categories
          </h1>
          <p className="text-muted-foreground text-lg">
            Everything you need, delivered in 10 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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
