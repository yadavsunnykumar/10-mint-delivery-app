export interface CategoryConfig {
  slug: string;
  name: string;
  backendCategory: string | null;
  description: string;
}

export const CATEGORY_TABS: CategoryConfig[] = [
  {
    slug: "all",
    name: "All",
    backendCategory: null,
    description: "All Products",
  },
  {
    slug: "cafe",
    name: "Cafe",
    backendCategory: "Snacks & Munchies",
    description: "Snacks, chips, biscuits & more",
  },
  {
    slug: "home",
    name: "Home",
    backendCategory: "Home & Cleaning",
    description: "Home essentials & cleaning supplies",
  },
  {
    slug: "toys",
    name: "Toys",
    backendCategory: "Toys & Games",
    description: "Toys & games for all ages",
  },
  {
    slug: "fresh",
    name: "Fresh",
    backendCategory: "Fruits & Vegetables",
    description: "Fresh fruits & vegetables",
  },
  {
    slug: "electronics",
    name: "Electronics",
    backendCategory: "Electronics",
    description: "Phones, gadgets & accessories",
  },
  {
    slug: "beauty",
    name: "Beauty",
    backendCategory: "Beauty & Personal Care",
    description: "Skincare, makeup & grooming",
  },
  {
    slug: "fashion",
    name: "Fashion",
    backendCategory: "Fashion",
    description: "Clothing, shoes & accessories",
  },
  {
    slug: "kitchen",
    name: "Kitchen",
    backendCategory: "Dairy, Bread & Eggs",
    description: "Dairy, bread, eggs & kitchen essentials",
  },
];

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORY_TABS.find((c) => c.slug === slug);
}

// ── Grid categories (CategoryGrid → /shop/:gridSlug) ────────────────────────

export interface GridCategoryConfig {
  slug: string;
  name: string;
  backendCategory: string | null;
  description: string;
}

export const GRID_CATEGORIES: GridCategoryConfig[] = [
  {
    slug: "fruits-vegetables",
    name: "Fruits & Vegetables",
    backendCategory: "Fruits & Vegetables",
    description: "Fresh fruits & vegetables",
  },
  {
    slug: "dairy-bread-eggs",
    name: "Dairy, Bread & Eggs",
    backendCategory: "Dairy, Bread & Eggs",
    description: "Milk, bread, eggs & more",
  },
  {
    slug: "atta-rice-dals",
    name: "Atta, Rice & Dals",
    backendCategory: "Atta, Rice & Dals",
    description: "Staples, grains & pulses",
  },
  {
    slug: "masala-dry-fruits",
    name: "Masala & Dry Fruits",
    backendCategory: "Masala & Dry Fruits",
    description: "Spices, masalas & dry fruits",
  },
  {
    slug: "breakfast-sauces",
    name: "Breakfast & Sauces",
    backendCategory: "Breakfast & Sauces",
    description: "Jams, spreads, cereals & sauces",
  },
  {
    slug: "packaged-food",
    name: "Packaged Food",
    backendCategory: "Instant Food",
    description: "Ready-to-eat & packaged items",
  },
  {
    slug: "tea-coffee",
    name: "Tea & Coffee",
    backendCategory: "Beverages",
    description: "Tea, coffee & hot beverages",
  },
  {
    slug: "ice-creams",
    name: "Ice Creams",
    backendCategory: "Ice Creams",
    description: "Ice creams & frozen desserts",
  },
  {
    slug: "frozen-food",
    name: "Frozen Food",
    backendCategory: "Frozen Food",
    description: "Frozen meals & snacks",
  },
  {
    slug: "biscuits-snacks",
    name: "Biscuits & Snacks",
    backendCategory: "Snacks & Munchies",
    description: "Biscuits, chips & namkeen",
  },
];

export function getGridCategoryBySlug(
  slug: string,
): GridCategoryConfig | undefined {
  return GRID_CATEGORIES.find((c) => c.slug === slug);
}
