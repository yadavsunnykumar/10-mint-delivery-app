import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X, ArrowLeft } from "lucide-react";
import { aiSearch, fetchProducts } from "@/lib/api";
import type { Product } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { CURRENCY_SYMBOL } from "@/lib/constants";

const CATEGORIES = [
  "All",
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Beverages",
  "Snacks",
  "Staples & Oils",
  "Bakery",
  "Frozen",
  "Toys & Games",
  "Personal Care",
  "Health",
  "Cleaning",
  "Baby Care",
  "Pet Care",
  "Ready to Cook",
];

type SortKey = "default" | "price_asc" | "price_desc" | "rating" | "discount";

interface FilterPanelProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  maxPrice: number;
  onMaxPriceChange: (p: number) => void;
  sortBy: SortKey;
  onSortChange: (s: SortKey) => void;
}

function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  maxPrice,
  onMaxPriceChange,
  sortBy,
  onSortChange,
}: FilterPanelProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-foreground mb-2">Categories</h3>
        <div className="space-y-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`w-full text-left text-sm px-2.5 py-1.5 rounded-md transition-colors ${
                selectedCategory === cat
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-foreground mb-2">
          Max Price: {CURRENCY_SYMBOL}
          {maxPrice}
        </h3>
        <input
          type="range"
          min={50}
          max={1000}
          step={50}
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{CURRENCY_SYMBOL}50</span>
          <span>{CURRENCY_SYMBOL}1000</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-foreground mb-2">Sort By</h3>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className="w-full text-sm bg-secondary text-foreground border border-border rounded-lg px-2 py-1.5 focus:outline-none"
        >
          <option value="default">Relevance</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="discount">Biggest Discount</option>
        </select>
      </div>
    </div>
  );
}

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [localQ, setLocalQ] = useState(q);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState<SortKey>("default");
  const [showFilters, setShowFilters] = useState(false);

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: async () => {
      if (!q) return fetchProducts();
      try {
        return await aiSearch(q);
      } catch {
        return fetchProducts({ search: q });
      }
    },
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    if (!results) return [] as Product[];
    let arr = [...results];
    if (selectedCategory !== "All") {
      arr = arr.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }
    arr = arr.filter((p) => p.price <= maxPrice);
    if (sortBy === "price_asc") arr.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") arr.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating")
      arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sortBy === "discount")
      arr.sort(
        (a, b) => b.originalPrice - b.price - (a.originalPrice - a.price),
      );
    return arr;
  }, [results, selectedCategory, maxPrice, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQ.trim()) {
      setSearchParams({ q: localQ.trim() });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {q ? `Results for "${q}"` : "All Products"}
        </h1>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          placeholder="Search for products..."
          className="w-full pl-10 pr-24 py-2.5 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-md hover:opacity-90"
        >
          Search
        </button>
      </form>

      <div className="flex gap-6">
        {/* Filter sidebar – desktop */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <div className="bg-card border border-border rounded-xl p-4 sticky top-20">
            <FilterPanel
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter toggle + count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Searching…"
                : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} found`}
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-1.5 text-sm font-medium text-primary border border-primary/30 px-3 py-1.5 rounded-lg"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Mobile filter panel */}
          {showFilters && (
            <div className="md:hidden mb-4 bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm text-foreground">
                  Filters
                </span>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <FilterPanel
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                maxPrice={maxPrice}
                onMaxPriceChange={setMaxPrice}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 bg-secondary rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <Search className="w-14 h-14 text-muted-foreground/30" />
              <p className="text-lg font-semibold text-foreground">
                No results found
              </p>
              <p className="text-muted-foreground text-sm">
                Try different keywords or adjust filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  image={product.image}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discount={product.discount}
                  weight={product.weight}
                  rating={product.rating}
                  ratingCount={product.ratingCount}
                  tag={product.tag}
                  stock={product.stock}
                  category={product.category}
                  brand={product.brand}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
