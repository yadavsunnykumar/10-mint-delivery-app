import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext, Link } from "react-router-dom";
import CategoryGrid from "@/components/CategoryGrid";
import PromoBanners from "@/components/PromoBanners";
import ProductSection from "@/components/ProductSection";
import { fetchProducts, aiSearch, getRecommendations } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { LayoutContext } from "@/components/AppLayout";

// Real categories that exist in the seeded products.json
const SECTION_CATEGORIES = [
  { title: "Snacks & Munchies", key: "Snacks & Munchies" },
  { title: "Dairy, Bread & Eggs", key: "Dairy, Bread & Eggs" },
  { title: "Beverages", key: "Beverages" },
  { title: "Instant Food", key: "Instant Food" },
  { title: "Fruits & Vegetables", key: "Fruits & Vegetables" },
  { title: "Atta, Rice & Dals", key: "Atta, Rice & Dals" },
  { title: "Masala & Dry Fruits", key: "Masala & Dry Fruits" },
  { title: "Breakfast & Sauces", key: "Breakfast & Sauces" },
  { title: "Ice Creams", key: "Ice Creams" },
  { title: "Frozen Food", key: "Frozen Food" },
  { title: "Home & Cleaning", key: "Home & Cleaning" },
  { title: "Beauty & Personal Care", key: "Beauty & Personal Care" },
  { title: "Electronics", key: "Electronics" },
  { title: "Toys & Games", key: "Toys & Games" },
  { title: "Fashion", key: "Fashion" },
];

const Index = () => {
  const { searchQuery } = useOutletContext<LayoutContext>();
  const { user } = useAuth();

  const isSearching = !!searchQuery.trim();

  // ── All products (for category sections) ──────────────────────────────────
  const { data: apiProducts } = useQuery({
    queryKey: ["products", {}],
    queryFn: () => fetchProducts({}),
    staleTime: 60_000,
    enabled: !isSearching,
  });

  // ── AI semantic search ─────────────────────────────────────────────────────
  const { data: aiResults, isLoading: aiSearchLoading } = useQuery({
    queryKey: ["ai-search", searchQuery],
    queryFn: () => aiSearch(searchQuery.trim()),
    staleTime: 30_000,
    enabled: isSearching,
    retry: false,
  });

  // ── AI recommendations ─────────────────────────────────────────────────────
  const { data: recommendations } = useQuery({
    queryKey: ["recommendations", user?.user_id ?? "guest"],
    queryFn: () => getRecommendations(user?.user_id ?? "guest"),
    staleTime: 120_000,
    retry: false,
  });

  const grouped = useMemo(() => {
    if (!apiProducts) return null;
    const map: Record<string, typeof apiProducts> = {};
    for (const p of apiProducts) {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    }
    return map;
  }, [apiProducts]);

  return (
    <>
      <CategoryGrid />
      <PromoBanners />

      {isSearching ? (
        /* ── AI search results ─────────────────────── */
        aiSearchLoading ? (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-muted-foreground">
            Searching...
          </div>
        ) : aiResults && aiResults.length > 0 ? (
          <ProductSection
            title={`Results for "${searchQuery}"`}
            products={aiResults}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-muted-foreground">
            No products found. Try a different search.
          </div>
        )
      ) : (
        <>
          {/* ── Trending products (AI) ─────────────── */}
          {recommendations?.trending && recommendations.trending.length > 0 && (
            <ProductSection
              title="🔥 Trending Now"
              products={recommendations.trending}
            />
          )}

          {/* ── Personalized (logged-in only) ─────────────── */}
          {user &&
            recommendations?.personalized &&
            recommendations.personalized.length > 0 && (
              <>
                <div className="border-t border-border" />
                <ProductSection
                  title="⭐ Recommended for You"
                  products={recommendations.personalized}
                />
              </>
            )}

          {/* ── Category sections ─────────────────────────── */}
          {SECTION_CATEGORIES.map(({ title, key }, i) => {
            const products = grouped?.[key] ?? [];
            if (products.length === 0) return null;
            return (
              <div key={key}>
                {i > 0 && <div className="border-t border-border" />}
                <ProductSection title={title} products={products} />
              </div>
            );
          })}
        </>
      )}

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-foreground mb-3">Useful Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="hover:text-foreground transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/press"
                    className="hover:text-foreground transition-colors"
                  >
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-3">Categories</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/shop/fruits-vegetables"
                    className="hover:text-foreground transition-colors"
                  >
                    Fruits &amp; Vegetables
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop/dairy-bread-eggs"
                    className="hover:text-foreground transition-colors"
                  >
                    Dairy &amp; Bread
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop/biscuits-snacks"
                    className="hover:text-foreground transition-colors"
                  >
                    Snacks
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop/tea-coffee"
                    className="hover:text-foreground transition-colors"
                  >
                    Beverages
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categories"
                    className="hover:text-foreground transition-colors font-medium text-primary"
                  >
                    View all →
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-3">Help</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/help/faqs"
                    className="hover:text-foreground transition-colors"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help/terms"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help/privacy"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-3">Download App</h3>
              <p className="text-sm text-muted-foreground">
                Get the best grocery delivery experience on your phone.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

export default Index;
