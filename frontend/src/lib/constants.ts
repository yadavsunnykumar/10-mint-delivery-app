// ─────────────────────────────────────────────────────────────────────────────
// App-wide constants — single source of truth
// Import from here instead of defining inline in components.
// ─────────────────────────────────────────────────────────────────────────────

// ── Brand ────────────────────────────────────────────────────────────────────
export const APP_NAME = "Everest Dash";
export const APP_TAGLINE = "10-Minute Delivery";
export const ADMIN_KEY = "everest-admin-2024";

// ── Currency & Locale ─────────────────────────────────────────────────────────
export const CURRENCY_SYMBOL = "रू";

// ── Default location (Kathmandu) ──────────────────────────────────────────────
export const DEFAULT_LOCATION = { lat: 27.7172, lng: 85.324 } as const;

// ── Socket / API ──────────────────────────────────────────────────────────────
export const SOCKET_URL =
  (import.meta.env.VITE_SOCKET_URL as string | undefined) ??
  "http://localhost:5001";

// ── Product defaults ──────────────────────────────────────────────────────────
export const DEFAULT_STOCK = 50;

// ── Brand colours (JS mirror of tailwind.config.ts `everest.*` + index.css) ─
export const BRAND_COLORS = {
  blue: "#1E3A8A",
  blueLight: "#3B82F6",
  blueDark: "#0F172A",
  red: "#DC2626",
  redLight: "#EF4444",
  redSoft: "#FEE2E2",
  snow: "#F8FAFC",
  snowSoft: "#F1F5F9",
  sun: "#F59E0B",
  sunLight: "#FCD34D",
  slate: "#475569",
  slateLight: "#94A3B8",
  success: "#16A34A",
  warning: "#F59E0B",
  error: "#DC2626",
} as const;

// ── Delivery ──────────────────────────────────────────────────────────────────
export const DELIVERY_FEE = 25;
export const DELIVERY_FREE_ABOVE = 299;

// ── Order ─────────────────────────────────────────────────────────────────────
export const ORDER_STATUSES = [
  "created",
  "accepted",
  "packed",
  "assigned",
  "en_route",
  "delivered",
  "cancelled",
] as const;

export const STATUS_COLORS: Record<string, string> = {
  created: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  accepted:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  packed:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  assigned:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  en_route: "bg-primary/10 text-primary",
  delivered:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

// ── Product categories (used in admin panel form & filtering) ─────────────────
export const PRODUCT_CATEGORIES = [
  "Fruits & Vegetables",
  "Dairy & Breakfast",
  "Snacks & Munchies",
  "Cold Drinks & Juices",
  "Instant & Frozen Food",
  "Tea, Coffee & Health Drink",
  "Bakery & Biscuits",
  "Sweet Tooth",
  "Atta, Rice & Dal",
  "Masala, Oil & More",
  "Sauces & Spreads",
  "Chicken, Meat & Fish",
  "Paan Corner",
  "Pharma & Wellness",
  "Home & Office",
] as const;

// ── Home-page product sections ────────────────────────────────────────────────
export const SECTION_CATEGORIES: {
  title: string;
  key: string;
  slug?: string;
}[] = [
  {
    title: "Snacks & Munchies",
    key: "Snacks & Munchies",
    slug: "biscuits-snacks",
  },
  {
    title: "Dairy, Bread & Eggs",
    key: "Dairy, Bread & Eggs",
    slug: "dairy-bread-eggs",
  },
  { title: "Beverages", key: "Beverages", slug: "tea-coffee" },
  { title: "Instant Food", key: "Instant Food", slug: "packaged-food" },
  {
    title: "Fruits & Vegetables",
    key: "Fruits & Vegetables",
    slug: "fruits-vegetables",
  },
  {
    title: "Atta, Rice & Dals",
    key: "Atta, Rice & Dals",
    slug: "atta-rice-dals",
  },
  {
    title: "Masala & Dry Fruits",
    key: "Masala & Dry Fruits",
    slug: "masala-dry-fruits",
  },
  {
    title: "Breakfast & Sauces",
    key: "Breakfast & Sauces",
    slug: "breakfast-sauces",
  },
  { title: "Ice Creams", key: "Ice Creams", slug: "ice-creams" },
  { title: "Frozen Food", key: "Frozen Food", slug: "frozen-food" },
  { title: "Home & Cleaning", key: "Home & Cleaning" },
  { title: "Beauty & Personal Care", key: "Beauty & Personal Care" },
  { title: "Electronics", key: "Electronics" },
  { title: "Toys & Games", key: "Toys & Games" },
  { title: "Fashion", key: "Fashion" },
];

// ── Categories browse page ────────────────────────────────────────────────────
export const ALL_CATEGORIES: {
  name: string;
  slug: string;
  emoji: string;
  desc: string;
  count: string;
}[] = [
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

// ── Delivery cities & areas (Kathmandu Valley) ───────────────────────────────
export const CITIES: {
  city: string;
  areas: {
    label: string;
    area: string;
    pincode: string;
    coords: { lat: number; lng: number };
  }[];
}[] = [
  {
    city: "Kathmandu",
    areas: [
      {
        label: "Thamel",
        area: "Thamel, Kathmandu",
        pincode: "44600",
        coords: { lat: 27.7149, lng: 85.313 },
      },
      {
        label: "New Road",
        area: "New Road, Kathmandu",
        pincode: "44600",
        coords: { lat: 27.7042, lng: 85.3138 },
      },
      {
        label: "Lazimpat",
        area: "Lazimpat, Kathmandu",
        pincode: "44600",
        coords: { lat: 27.7313, lng: 85.3237 },
      },
      {
        label: "Maharajgunj",
        area: "Maharajgunj, Kathmandu",
        pincode: "44600",
        coords: { lat: 27.7394, lng: 85.3315 },
      },
      {
        label: "Naxal",
        area: "Naxal, Kathmandu",
        pincode: "44600",
        coords: { lat: 27.7181, lng: 85.3278 },
      },
      {
        label: "Baneshwor",
        area: "Baneshwor, Kathmandu",
        pincode: "44614",
        coords: { lat: 27.6966, lng: 85.3393 },
      },
      {
        label: "Koteshwor",
        area: "Koteshwor, Kathmandu",
        pincode: "44621",
        coords: { lat: 27.6847, lng: 85.3507 },
      },
    ],
  },
  {
    city: "Lalitpur",
    areas: [
      {
        label: "Kupondole",
        area: "Kupondole, Lalitpur",
        pincode: "44700",
        coords: { lat: 27.6857, lng: 85.3166 },
      },
      {
        label: "Pulchowk",
        area: "Pulchowk, Lalitpur",
        pincode: "44700",
        coords: { lat: 27.6826, lng: 85.321 },
      },
      {
        label: "Jawalakhel",
        area: "Jawalakhel, Lalitpur",
        pincode: "44700",
        coords: { lat: 27.6714, lng: 85.3146 },
      },
      {
        label: "Ekantakuna",
        area: "Ekantakuna, Lalitpur",
        pincode: "44700",
        coords: { lat: 27.6611, lng: 85.3114 },
      },
      {
        label: "Sanepa",
        area: "Sanepa, Lalitpur",
        pincode: "44700",
        coords: { lat: 27.6872, lng: 85.3087 },
      },
    ],
  },
  {
    city: "Bhaktapur",
    areas: [
      {
        label: "Durbar Square",
        area: "Durbar Square, Bhaktapur",
        pincode: "44800",
        coords: { lat: 27.6722, lng: 85.4272 },
      },
      {
        label: "Suryabinayak",
        area: "Suryabinayak, Bhaktapur",
        pincode: "44800",
        coords: { lat: 27.6669, lng: 85.4481 },
      },
      {
        label: "Thimi",
        area: "Thimi, Bhaktapur",
        pincode: "44800",
        coords: { lat: 27.6771, lng: 85.3962 },
      },
    ],
  },
];
