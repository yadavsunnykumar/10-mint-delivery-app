export interface CategoryConfig {
  slug: string;
  name: string;
  backendCategory: string | null;
  description: string;
}

export const CATEGORY_TABS: CategoryConfig[] = [
  { slug: "all",        name: "All",       backendCategory: null,                  description: "All Products" },
  { slug: "fresh",      name: "Fresh",     backendCategory: "Fruits & Vegetables", description: "Fresh fruits & vegetables" },
  { slug: "dairy",      name: "Dairy",     backendCategory: "Dairy",               description: "Milk, curd, eggs & paneer" },
  { slug: "grocery",    name: "Grocery",   backendCategory: "Grocery",             description: "Staples, oils, spices & grains" },
  { slug: "snacks",     name: "Snacks",    backendCategory: "Snacks",              description: "Chips, biscuits & namkeen" },
  { slug: "beverages",  name: "Drinks",    backendCategory: "Beverages",           description: "Tea, coffee, soda & beer" },
  { slug: "meat",       name: "Meat",      backendCategory: "Meat & Seafood",      description: "Chicken, mutton & fish" },
  { slug: "home",       name: "Home",      backendCategory: "Household",           description: "Cleaning & household essentials" },
  { slug: "beauty",     name: "Beauty",    backendCategory: "Personal Care",       description: "Skincare, haircare & grooming" },
  { slug: "baby",       name: "Baby",      backendCategory: "Baby & Kids",         description: "Diapers, baby food & care" },
  { slug: "health",     name: "Health",    backendCategory: "Health & Wellness",   description: "Vitamins, first aid & wellness" },
  { slug: "puja",       name: "Puja",      backendCategory: "Puja & Festival",     description: "Incense, diyo & festival items" },
  { slug: "electronics",name: "Electronics",backendCategory: "Electronics",        description: "Cables, chargers & accessories" },
  { slug: "bakery",     name: "Bakery",    backendCategory: "Bakery",              description: "Bread, snacks & baked goods" },
  { slug: "stationery", name: "Stationery",backendCategory: "Stationery",          description: "Pens, notebooks & batteries" },
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
  { slug: "fruits-vegetables",  name: "Fruits & Veg",    backendCategory: "Fruits & Vegetables", description: "Fresh fruits & vegetables", emoji: "🥦" },
  { slug: "dairy-bread-eggs",   name: "Dairy & Eggs",    backendCategory: "Dairy",               description: "Milk, curd, eggs & paneer", emoji: "🥛" },
  { slug: "atta-rice-dals",     name: "Atta & Rice",     backendCategory: "Grocery",             description: "Staples, grains & pulses", emoji: "🌾" },
  { slug: "meat-seafood",       name: "Meat & Fish",     backendCategory: "Meat & Seafood",      description: "Chicken, mutton & fresh fish", emoji: "🍗" },
  { slug: "biscuits-snacks",    name: "Snacks",          backendCategory: "Snacks",              description: "Chips, chocolates & namkeen", emoji: "🍿" },
  { slug: "tea-coffee",         name: "Tea & Coffee",    backendCategory: "Beverages",           description: "Ilam tea, coffee & drinks", emoji: "☕" },
  { slug: "packaged-food",      name: "Instant Food",    backendCategory: "Grocery",             description: "Noodles, chiura & ready-to-eat", emoji: "🍜" },
  { slug: "puja-festival",      name: "Puja Items",      backendCategory: "Puja & Festival",     description: "Agarbatti, diyo & tika", emoji: "🪔" },
  { slug: "frozen-food",        name: "Frozen",          backendCategory: "Frozen Food",         description: "Frozen momos & ready-to-cook", emoji: "❄️" },
  { slug: "health-wellness",    name: "Health",          backendCategory: "Health & Wellness",   description: "Vitamins, ORS & first aid", emoji: "💊" },
];

export function getGridCategoryBySlug(slug: string): GridCategoryConfig | undefined {
  return GRID_CATEGORIES.find((c) => c.slug === slug);
}

// Additional categories accessible from CategoriesScreen and ShopScreen
const EXTRA_SHOP_CATEGORIES: GridCategoryConfig[] = [
  { slug: "home-cleaning",       name: "Home & Cleaning",     backendCategory: "Household",       description: "Detergents, cleaners & pest control", emoji: "🧹" },
  { slug: "beauty-personal-care",name: "Beauty & Personal Care",backendCategory: "Personal Care", description: "Skincare, haircare & grooming", emoji: "🧴" },
  { slug: "bakery",              name: "Bakery & Bread",      backendCategory: "Bakery",          description: "Fresh bread, snacks & baked goods", emoji: "🍞" },
  { slug: "baby-kids",           name: "Baby Care",           backendCategory: "Baby & Kids",     description: "Diapers, baby food & care", emoji: "👶" },
  { slug: "electronics",         name: "Electronics",         backendCategory: "Electronics",      description: "Cables, chargers & accessories", emoji: "🔌" },
  { slug: "stationery",          name: "Stationery & Office", backendCategory: "Stationery",       description: "Pens, notebooks & batteries", emoji: "✏️" },
  { slug: "masala-dry-fruits",   name: "Masala & Spices",     backendCategory: "Grocery",         description: "Turmeric, cumin, timur & spice mixes", emoji: "🌶️" },
];

// Universal slug lookup covering all navigable category pages
export function getShopCategoryBySlug(slug: string): GridCategoryConfig | undefined {
  return (
    GRID_CATEGORIES.find((c) => c.slug === slug) ??
    EXTRA_SHOP_CATEGORIES.find((c) => c.slug === slug)
  );
}
