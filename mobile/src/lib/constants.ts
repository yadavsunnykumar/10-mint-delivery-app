// ─────────────────────────────────────────────────────────────────────────────
// App-wide constants — single source of truth
// ─────────────────────────────────────────────────────────────────────────────

export { API_BASE_URL, SOCKET_URL } from "./config";

export const APP_NAME = "Everest Dash";
export const APP_TAGLINE = "10-Minute Delivery";
export const APP_VERSION = "1.0.0";

// Admin key is read from secure env, never committed in source
export const ADMIN_KEY =
  process.env.EXPO_PUBLIC_ADMIN_KEY ?? "everest-admin-2024";

export const CURRENCY_SYMBOL = "रू";

export const DEFAULT_LOCATION = { lat: 27.7172, lng: 85.324 } as const;
export const DEFAULT_AREA = "Thamel";
export const DEFAULT_CITY = "Kathmandu";

export const DEFAULT_STOCK = 50;

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

export const DELIVERY_FEE = 25;
export const DELIVERY_FREE_ABOVE = 299;

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
  created: "#1D4ED8",
  accepted: "#D97706",
  packed: "#EA580C",
  assigned: "#7C3AED",
  en_route: "#1E3A8A",
  delivered: "#16A34A",
  cancelled: "#DC2626",
};

export const STATUS_BG_COLORS: Record<string, string> = {
  created: "#DBEAFE",
  accepted: "#FEF3C7",
  packed: "#FFEDD5",
  assigned: "#EDE9FE",
  en_route: "#DBEAFE",
  delivered: "#DCFCE7",
  cancelled: "#FEE2E2",
};

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
  { title: "Home & Cleaning", key: "Home & Cleaning", slug: "home-cleaning" },
  { title: "Beauty & Personal Care", key: "Beauty & Personal Care", slug: "beauty-personal-care" },
];

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
      { label: "Thamel",         area: "Thamel, Kathmandu",         pincode: "44600", coords: { lat: 27.7149, lng: 85.3130 } },
      { label: "New Road",       area: "New Road, Kathmandu",       pincode: "44600", coords: { lat: 27.7042, lng: 85.3138 } },
      { label: "Asan",           area: "Asan, Kathmandu",           pincode: "44600", coords: { lat: 27.7065, lng: 85.3125 } },
      { label: "Indrachowk",     area: "Indrachowk, Kathmandu",     pincode: "44600", coords: { lat: 27.7072, lng: 85.3101 } },
      { label: "Durbarmarg",     area: "Durbarmarg, Kathmandu",     pincode: "44600", coords: { lat: 27.7103, lng: 85.3185 } },
      { label: "Kamaladi",       area: "Kamaladi, Kathmandu",       pincode: "44600", coords: { lat: 27.7083, lng: 85.3211 } },
      { label: "Putalisadak",    area: "Putalisadak, Kathmandu",    pincode: "44600", coords: { lat: 27.7034, lng: 85.3225 } },
      { label: "Bagbazar",       area: "Bagbazar, Kathmandu",       pincode: "44600", coords: { lat: 27.7086, lng: 85.3218 } },
      { label: "Lazimpat",       area: "Lazimpat, Kathmandu",       pincode: "44600", coords: { lat: 27.7313, lng: 85.3237 } },
      { label: "Baluwatar",      area: "Baluwatar, Kathmandu",      pincode: "44600", coords: { lat: 27.7275, lng: 85.3248 } },
      { label: "Panipokhari",    area: "Panipokhari, Kathmandu",    pincode: "44600", coords: { lat: 27.7283, lng: 85.3362 } },
      { label: "Hattisar",       area: "Hattisar, Kathmandu",       pincode: "44600", coords: { lat: 27.7250, lng: 85.3282 } },
      { label: "Naxal",          area: "Naxal, Kathmandu",          pincode: "44600", coords: { lat: 27.7181, lng: 85.3278 } },
      { label: "Maharajgunj",    area: "Maharajgunj, Kathmandu",    pincode: "44600", coords: { lat: 27.7394, lng: 85.3315 } },
      { label: "Samakhusi",      area: "Samakhusi, Kathmandu",      pincode: "44600", coords: { lat: 27.7438, lng: 85.3167 } },
      { label: "Gongabu",        area: "Gongabu, Kathmandu",        pincode: "44600", coords: { lat: 27.7326, lng: 85.3027 } },
      { label: "Balaju",         area: "Balaju, Kathmandu",         pincode: "44600", coords: { lat: 27.7357, lng: 85.2989 } },
      { label: "Swayambhu",      area: "Swayambhu, Kathmandu",      pincode: "44600", coords: { lat: 27.7149, lng: 85.2904 } },
      { label: "Sitapaila",      area: "Sitapaila, Kathmandu",      pincode: "44600", coords: { lat: 27.7189, lng: 85.2823 } },
      { label: "Kalanki",        area: "Kalanki, Kathmandu",        pincode: "44600", coords: { lat: 27.6938, lng: 85.2868 } },
      { label: "Kalimati",       area: "Kalimati, Kathmandu",       pincode: "44600", coords: { lat: 27.6976, lng: 85.3003 } },
      { label: "Baneshwor",      area: "Baneshwor, Kathmandu",      pincode: "44614", coords: { lat: 27.6966, lng: 85.3393 } },
      { label: "New Baneshwor",  area: "New Baneshwor, Kathmandu",  pincode: "44614", coords: { lat: 27.6921, lng: 85.3411 } },
      { label: "Minbhawan",      area: "Minbhawan, Kathmandu",      pincode: "44614", coords: { lat: 27.6904, lng: 85.3399 } },
      { label: "Chabahil",       area: "Chabahil, Kathmandu",       pincode: "44600", coords: { lat: 27.7189, lng: 85.3516 } },
      { label: "Boudha",         area: "Boudha, Kathmandu",         pincode: "44600", coords: { lat: 27.7215, lng: 85.3619 } },
      { label: "Mahankal",       area: "Mahankal, Kathmandu",       pincode: "44600", coords: { lat: 27.7246, lng: 85.3558 } },
      { label: "Koteshwor",      area: "Koteshwor, Kathmandu",      pincode: "44621", coords: { lat: 27.6847, lng: 85.3507 } },
      { label: "Tinkune",        area: "Tinkune, Kathmandu",        pincode: "44621", coords: { lat: 27.6889, lng: 85.3485 } },
      { label: "Sinamangal",     area: "Sinamangal, Kathmandu",     pincode: "44600", coords: { lat: 27.6975, lng: 85.3538 } },
      { label: "Gaushala",       area: "Gaushala, Kathmandu",       pincode: "44600", coords: { lat: 27.7083, lng: 85.3452 } },
      { label: "Kirtipur",       area: "Kirtipur, Kathmandu",       pincode: "44618", coords: { lat: 27.6767, lng: 85.2786 } },
      { label: "Thankot",        area: "Thankot, Kathmandu",        pincode: "44600", coords: { lat: 27.6889, lng: 85.2432 } },
    ],
  },
  {
    city: "Lalitpur",
    areas: [
      { label: "Patan Durbar",   area: "Patan Durbar Square, Lalitpur", pincode: "44700", coords: { lat: 27.6727, lng: 85.3248 } },
      { label: "Kupondole",      area: "Kupondole, Lalitpur",       pincode: "44700", coords: { lat: 27.6857, lng: 85.3166 } },
      { label: "Pulchowk",       area: "Pulchowk, Lalitpur",        pincode: "44700", coords: { lat: 27.6826, lng: 85.3210 } },
      { label: "Jawalakhel",     area: "Jawalakhel, Lalitpur",      pincode: "44700", coords: { lat: 27.6714, lng: 85.3146 } },
      { label: "Lagankhel",      area: "Lagankhel, Lalitpur",       pincode: "44700", coords: { lat: 27.6737, lng: 85.3262 } },
      { label: "Sanepa",         area: "Sanepa, Lalitpur",          pincode: "44700", coords: { lat: 27.6872, lng: 85.3087 } },
      { label: "Ekantakuna",     area: "Ekantakuna, Lalitpur",      pincode: "44700", coords: { lat: 27.6611, lng: 85.3114 } },
      { label: "Satdobato",      area: "Satdobato, Lalitpur",       pincode: "44700", coords: { lat: 27.6564, lng: 85.3244 } },
      { label: "Imadol",         area: "Imadol, Lalitpur",          pincode: "44700", coords: { lat: 27.6597, lng: 85.3452 } },
      { label: "Harisiddhi",     area: "Harisiddhi, Lalitpur",      pincode: "44700", coords: { lat: 27.6395, lng: 85.3467 } },
      { label: "Bhaisepati",     area: "Bhaisepati, Lalitpur",      pincode: "44700", coords: { lat: 27.6447, lng: 85.3151 } },
      { label: "Godavari",       area: "Godavari, Lalitpur",        pincode: "44700", coords: { lat: 27.5978, lng: 85.3742 } },
    ],
  },
  {
    city: "Bhaktapur",
    areas: [
      { label: "Durbar Square",  area: "Durbar Square, Bhaktapur",  pincode: "44800", coords: { lat: 27.6722, lng: 85.4272 } },
      { label: "Thimi",          area: "Thimi, Bhaktapur",          pincode: "44800", coords: { lat: 27.6771, lng: 85.3962 } },
      { label: "Suryabinayak",   area: "Suryabinayak, Bhaktapur",   pincode: "44800", coords: { lat: 27.6669, lng: 85.4481 } },
      { label: "Katunje",        area: "Katunje, Bhaktapur",        pincode: "44800", coords: { lat: 27.6582, lng: 85.4164 } },
      { label: "Sallaghari",     area: "Sallaghari, Bhaktapur",     pincode: "44800", coords: { lat: 27.6834, lng: 85.4003 } },
      { label: "Nagarkot",       area: "Nagarkot, Bhaktapur",       pincode: "44800", coords: { lat: 27.7175, lng: 85.5207 } },
    ],
  },
];

// ── Promo Banners (displayed on HomeScreen carousel) ──────────────────────────
export const PROMO_BANNERS: {
  id: string;
  title: string;
  subtitle: string;
  gradient: [string, string];
  emoji: string;
  slug?: string;
}[] = [
  {
    id: "free-delivery",
    title: "Free Delivery",
    subtitle: `On orders above ${CURRENCY_SYMBOL}299`,
    gradient: ["#1E3A8A", "#3B82F6"],
    emoji: "🚀",
  },
  {
    id: "fresh-veggies",
    title: "Fresh Veggies",
    subtitle: "Farm to door in 10 min",
    gradient: ["#16A34A", "#22C55E"],
    emoji: "🥦",
    slug: "fruits-vegetables",
  },
  {
    id: "dairy-deals",
    title: "Dairy Deals",
    subtitle: "Up to 30% off on milk & eggs",
    gradient: ["#D97706", "#F59E0B"],
    emoji: "🥛",
    slug: "dairy-bread-eggs",
  },
  {
    id: "snack-attack",
    title: "Snack Attack",
    subtitle: "New arrivals every week",
    gradient: ["#7C3AED", "#A855F7"],
    emoji: "🍿",
    slug: "biscuits-snacks",
  },
  {
    id: "instant-deals",
    title: "Instant Meals",
    subtitle: "Ready in minutes, delivered in 10",
    gradient: ["#BE185D", "#EC4899"],
    emoji: "🍜",
    slug: "packaged-food",
  },
];

// ── Valid promo codes (ideally fetched from server; static fallback) ──────────
export const PROMO_CODES: Record<string, { discount: number; type: "flat" | "percent"; minOrder?: number; description: string }> = {
  WELCOME50: { discount: 50, type: "flat", minOrder: 200, description: "रू50 off on your first order" },
  SAVE10:    { discount: 10, type: "percent", minOrder: 300, description: "10% off on orders above रू300" },
  FREESHIP:  { discount: 25, type: "flat", description: "Free delivery on any order" },
};

// ── Delivery config ───────────────────────────────────────────────────────────
export const DELIVERY_FEE_CONFIG = {
  fee: DELIVERY_FEE,
  freeAbove: DELIVERY_FREE_ABOVE,
} as const;
