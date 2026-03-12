import { useParams, useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PackageSearch } from "lucide-react";
import ProductSection from "@/components/ProductSection";
import CategoryGrid from "@/components/CategoryGrid";
import { getCategoryBySlug, type CategoryConfig } from "@/lib/categories";
import { fetchProducts } from "@/lib/api";
import type { LayoutContext } from "@/components/AppLayout";

// ——— Inner content (hooks always called, no conditional hook issue) ———————————
const CategoryContent = ({ config }: { config: CategoryConfig }) => {
  const { searchQuery } = useOutletContext<LayoutContext>();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", config.backendCategory, searchQuery],
    queryFn: () =>
      fetchProducts({
        ...(config.backendCategory ? { category: config.backendCategory } : {}),
        ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
      }),
    enabled: !!config.backendCategory,
    staleTime: 60_000,
  });

  const navigate = useNavigate();

  return (
    <>
      {/* Section title */}
      <div className="max-w-7xl mx-auto px-4 pt-5 pb-3 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">{config.name}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {config.description}
        </p>
      </div>

      {/* Category grid — shown on every category page */}
      <CategoryGrid />

      {/* ——— No backend data → Coming Soon ——— */}
      {!config.backendCategory ? (
        <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center gap-4 text-center">
          <PackageSearch className="w-16 h-16 text-muted-foreground/40" />
          <h2 className="text-xl font-bold text-foreground">Coming Soon</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            We're stocking up this section. Check back soon for great deals on{" "}
            <span className="font-semibold">{config.name}</span>!
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Shop Other Categories
          </button>
        </div>
      ) : isLoading ? (
        /* ——— Loading skeleton ——— */
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl h-52 animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : !products || products.length === 0 ? (
        /* ——— Empty state ——— */
        <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center gap-4 text-center">
          <PackageSearch className="w-16 h-16 text-muted-foreground/40" />
          <h2 className="text-xl font-bold text-foreground">
            No products found
          </h2>
          <p className="text-muted-foreground text-sm">
            Try a different search or browse other categories
          </p>
        </div>
      ) : (
        /* ——— Products ——— */
        <ProductSection
          title={
            searchQuery
              ? `Results for "${searchQuery}" in ${config.name}`
              : config.description
          }
          products={products}
        />
      )}
    </>
  );
};

// ——— Route wrapper ——————————————————————————————————————————————————————————
const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const config = getCategoryBySlug(slug ?? "");

  if (!config) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <PackageSearch className="w-14 h-14 text-muted-foreground/40 mx-auto" />
          <p className="text-foreground font-semibold">Category not found</p>
          <button
            onClick={() => navigate("/")}
            className="text-primary underline text-sm"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <CategoryContent config={config} />;
};

export default CategoryPage;
