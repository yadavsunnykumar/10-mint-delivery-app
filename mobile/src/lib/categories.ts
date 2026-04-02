export interface CategoryConfig {
  slug: string;
  name: string;
  backendCategory: string | null;
  description: string;
}

export const CATEGORY_TABS: CategoryConfig[] = [
  { slug: "all", name: "All", backendCategory: null, description: "All Products" },
  { slug: "cafe", name: "Cafe", backendCategory: "Snacks & Munchies", description: "Snacks, chips, biscuits & more" },
  { slug: "home", name: "Home", backendCategory: "Home & Cleaning", description: "Home essentials & cleaning supplies" },
  { slug: "toys", name: "Toys", backendCategory: "Toys & Games", description: "Toys & games for all ages" },
  { slug: "fresh", name: "Fresh", backendCategory: "Fruits & Vegetables", description: "Fresh fruits & vegetables" },
  { slug: "electronics", name: "Electronics", backendCategory: "Electronics", description: "Phones, gadgets & accessories" },
  { slug: "beauty", name: "Beauty", backendCategory: "Beauty & Personal Care", description: "Skincare, makeup & grooming" },
  { slug: "fashion", name: "Fashion", backendCategory: "Fashion", description: "Clothing, shoes & accessories" },
  { slug: "kitchen", name: "Dairy", backendCategory: "Dairy, Bread & Eggs", description: "Dairy, bread, eggs & kitchen essentials" },
];

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORY_TABS.find((c) => c.slug === slug);
}

export interface GridCategoryConfig {
  slug: string;
  name: string;
  backendCategory: string | null;
  description: string;
  emoji: string;
}

export const GRID_CATEGORIES: GridCategoryConfig[] = [
  { slug: "fruits-vegetables", name: "Fruits & Veg", backendCategory: "Fruits & Vegetables", description: "Fresh fruits & vegetables", emoji: "🥦" },
  { slug: "dairy-bread-eggs", name: "Dairy & Eggs", backendCategory: "Dairy, Bread & Eggs", description: "Milk, bread, eggs & more", emoji: "🥛" },
  { slug: "atta-rice-dals", name: "Atta & Rice", backendCategory: "Atta, Rice & Dals", description: "Staples, grains & pulses", emoji: "🌾" },
  { slug: "masala-dry-fruits", name: "Masala", backendCategory: "Masala & Dry Fruits", description: "Spices, masalas & dry fruits", emoji: "🌶️" },
  { slug: "breakfast-sauces", name: "Breakfast", backendCategory: "Breakfast & Sauces", description: "Jams, spreads, cereals & sauces", emoji: "🍳" },
  { slug: "packaged-food", name: "Packaged", backendCategory: "Instant Food", description: "Ready-to-eat & packaged items", emoji: "🍜" },
  { slug: "tea-coffee", name: "Tea & Coffee", backendCategory: "Beverages", description: "Tea, coffee & hot beverages", emoji: "☕" },
  { slug: "ice-creams", name: "Ice Creams", backendCategory: "Ice Creams", description: "Ice creams & frozen desserts", emoji: "🍦" },
  { slug: "frozen-food", name: "Frozen", backendCategory: "Frozen Food", description: "Frozen meals & snacks", emoji: "❄️" },
  { slug: "biscuits-snacks", name: "Snacks", backendCategory: "Snacks & Munchies", description: "Biscuits, chips & namkeen", emoji: "🍿" },
];

export function getGridCategoryBySlug(slug: string): GridCategoryConfig | undefined {
  return GRID_CATEGORIES.find((c) => c.slug === slug);
}

// Additional categories not shown in the home grid but accessible from CategoriesScreen
const EXTRA_SHOP_CATEGORIES: GridCategoryConfig[] = [
  { slug: "home-cleaning", name: "Home & Cleaning", backendCategory: "Home & Cleaning", description: "Cleaners, detergents & household essentials", emoji: "🧹" },
  { slug: "beauty-personal-care", name: "Beauty & Personal Care", backendCategory: "Beauty & Personal Care", description: "Skincare, haircare & grooming", emoji: "💄" },
  { slug: "electronics", name: "Electronics", backendCategory: "Electronics", description: "Cables, accessories, bulbs & gadgets", emoji: "📱" },
  { slug: "toys-games", name: "Toys & Games", backendCategory: "Toys & Games", description: "Toys, board games & activity kits", emoji: "🧸" },
  { slug: "fashion", name: "Fashion", backendCategory: "Fashion", description: "Clothing, footwear & accessories", emoji: "👗" },
];

// Universal slug lookup covering all navigable category pages
export function getShopCategoryBySlug(slug: string): GridCategoryConfig | undefined {
  return GRID_CATEGORIES.find((c) => c.slug === slug) ?? EXTRA_SHOP_CATEGORIES.find((c) => c.slug === slug);
}
