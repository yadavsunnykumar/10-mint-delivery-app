// ─────────────────────────────────────────────────────────────────────────────
// App-wide constants — single source of truth
// ─────────────────────────────────────────────────────────────────────────────

export { API_BASE_URL, SOCKET_URL } from "./config";

export const APP_NAME = "DaakDelivery";
export const APP_TAGLINE = "Kathmandu ko sab kuch, 10 minutema!";
export const APP_VERSION = "1.0.0";
export const APP_CITY = "Kathmandu";
export const APP_COUNTRY = "Nepal";
export const DELIVERY_PROMISE_MINUTES = 10;

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

export const DELIVERY_FEE = 49;
export const DELIVERY_FREE_ABOVE = 599;
export const PACKAGING_FEE = 5;
export const SURGE_FEE = 30;

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
  key: string;  // maps to backend category
  slug?: string; // maps to ShopScreen slug
}[] = [
  { title: "Fresh Vegetables & Fruits", key: "Fruits & Vegetables",  slug: "fruits-vegetables" },
  { title: "Dairy, Curd & Eggs",        key: "Dairy",                slug: "dairy-bread-eggs" },
  { title: "Wai Wai & Instant Food",    key: "Grocery",              slug: "packaged-food" },
  { title: "Snacks & Namkeen",          key: "Snacks",               slug: "biscuits-snacks" },
  { title: "Beverages & Drinks",        key: "Beverages",            slug: "tea-coffee" },
  { title: "Fresh Meat & Seafood",      key: "Meat & Seafood",       slug: "meat-seafood" },
  { title: "Puja & Festival Items",     key: "Puja & Festival",      slug: "puja-festival" },
  { title: "Home & Cleaning",           key: "Household",            slug: "home-cleaning" },
  { title: "Personal Care",             key: "Personal Care",        slug: "beauty-personal-care" },
  { title: "Baby Care",                 key: "Baby & Kids",          slug: "baby-kids" },
  { title: "Health & Wellness",         key: "Health & Wellness",    slug: "health-wellness" },
  { title: "Bakery & Bread",            key: "Bakery",               slug: "bakery" },
  { title: "Frozen Food",               key: "Frozen Food",          slug: "frozen-food" },
];

export const ALL_CATEGORIES: {
  name: string;
  slug: string;
  emoji: string;
  desc: string;
  count: string;
}[] = [
  { name: "Fruits & Vegetables",   slug: "fruits-vegetables",   emoji: "🥦", desc: "Farm-fresh produce from local Nepali farms",         count: "50+" },
  { name: "Dairy & Eggs",          slug: "dairy-bread-eggs",    emoji: "🥛", desc: "Sujal, DDC milk, curd, paneer and fresh eggs",       count: "40+" },
  { name: "Meat & Seafood",        slug: "meat-seafood",        emoji: "🍗", desc: "Fresh chicken, khasi, buff and fish",                count: "15+" },
  { name: "Grocery & Staples",     slug: "atta-rice-dals",      emoji: "🌾", desc: "Rice, daal, atta, oils and cooking essentials",      count: "60+" },
  { name: "Instant & Packaged",    slug: "packaged-food",       emoji: "🍜", desc: "Wai Wai, Rara, chiura and ready-to-cook items",     count: "30+" },
  { name: "Beverages",             slug: "tea-coffee",          emoji: "☕", desc: "Ilam tea, Gorkha beer, Coke and energy drinks",     count: "35+" },
  { name: "Snacks & Namkeen",      slug: "biscuits-snacks",     emoji: "🍿", desc: "Kurkure, Lays, bhuja and Nepali namkeen",           count: "30+" },
  { name: "Puja & Festival",       slug: "puja-festival",       emoji: "🪔", desc: "Agarbatti, diyo, tika and sayapatri maala",         count: "15+" },
  { name: "Home & Cleaning",       slug: "home-cleaning",       emoji: "🧹", desc: "Surf Excel, Vim, Harpic and Dettol",                count: "25+" },
  { name: "Beauty & Personal Care",slug: "beauty-personal-care",emoji: "🧴", desc: "Sunsilk, Nivea, Colgate and Patanjali",             count: "30+" },
  { name: "Baby Care",             slug: "baby-kids",           emoji: "👶", desc: "Pampers, Huggies, Cerelac and Johnson's",           count: "15+" },
  { name: "Health & Wellness",     slug: "health-wellness",     emoji: "💊", desc: "ORS, honey, Chyawanprash and Vitamin C",            count: "20+" },
  { name: "Bakery & Bread",        slug: "bakery",              emoji: "🍞", desc: "Fresh bread, sel roti mix and samosa",              count: "10+" },
  { name: "Electronics",           slug: "electronics",         emoji: "🔌", desc: "Type-C cables, chargers and earphones",             count: "10+" },
  { name: "Stationery & Office",   slug: "stationery",          emoji: "✏️", desc: "Pens, notebooks and batteries",                    count: "10+" },
  { name: "Frozen Food",           slug: "frozen-food",         emoji: "❄️", desc: "Frozen buff momos and ready-to-heat meals",        count: "10+" },
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
  promoCode?: string;
}[] = [
  {
    id: "new-user",
    title: "New User Offer",
    subtitle: "20% off (up to रू200) on 1st order",
    gradient: ["#1E3A8A", "#3B82F6"],
    emoji: "🎉",
    promoCode: "NEWKTM",
  },
  {
    id: "fresh-veggies",
    title: "Fresh from the Farm",
    subtitle: "Vegetables & fruits in 10 min",
    gradient: ["#16A34A", "#22C55E"],
    emoji: "🥦",
    slug: "fruits-vegetables",
  },
  {
    id: "dairy-deals",
    title: "Dairy Combo Saver",
    subtitle: "रू50 off on 3+ dairy products",
    gradient: ["#D97706", "#F59E0B"],
    emoji: "🥛",
    slug: "dairy-bread-eggs",
    promoCode: "DAIRY50",
  },
  {
    id: "digital-pay",
    title: "eSewa / Khalti Cashback",
    subtitle: "10% back (up to रू150) on digital pay",
    gradient: ["#7C3AED", "#A855F7"],
    emoji: "📱",
    promoCode: "DIGITALPAY",
  },
  {
    id: "puja-items",
    title: "Puja & Festival Items",
    subtitle: "Diyo, agarbatti & tika — delivered fast",
    gradient: ["#BE185D", "#EC4899"],
    emoji: "🪔",
    slug: "puja-festival",
  },
];

// ── Valid promo codes (ideally fetched from server; static fallback) ──────────
export const PROMO_CODES: Record<string, {
  discount: number;
  type: "flat" | "percent" | "free_delivery";
  minOrder?: number;
  maxDiscount?: number;
  description: string;
}> = {
  NEWKTM:      { discount: 20, type: "percent", minOrder: 300, maxDiscount: 200, description: "20% off (up to रू200) on your first order" },
  WEEKENDFREE: { discount: 0,  type: "free_delivery", minOrder: 499, description: "Free delivery on orders above रू499 (weekends)" },
  DASHAIN15:   { discount: 15, type: "percent", minOrder: 500, maxDiscount: 300, description: "15% off on orders above रू500 (Dashain special)" },
  DAIRY50:     { discount: 50, type: "flat", minOrder: 250, description: "रू50 off when you buy 3+ dairy products" },
  DIGITALPAY:  { discount: 10, type: "percent", minOrder: 400, maxDiscount: 150, description: "10% cashback (up to रू150) on eSewa/Khalti payment" },
  WELCOME50:   { discount: 50, type: "flat", minOrder: 200, description: "रू50 off on your first order" },
  SAVE10:      { discount: 10, type: "percent", minOrder: 300, description: "10% off on orders above रू300" },
};

// ── Payment methods available in Nepal ────────────────────────────────────────
export const PAYMENT_METHODS = [
  { id: "esewa",    label: "eSewa",         icon: "phone-portrait-outline", popular: true },
  { id: "khalti",   label: "Khalti",        icon: "phone-portrait-outline", popular: true },
  { id: "fonepay",  label: "FonePay QR",    icon: "qr-code-outline",        popular: true },
  { id: "cod",      label: "Cash on Delivery", icon: "cash-outline",         popular: true },
  { id: "card",     label: "Debit / Credit Card", icon: "card-outline",      popular: false },
  { id: "imepay",   label: "IME Pay",       icon: "phone-portrait-outline", popular: false },
] as const;

export type PaymentMethodId = typeof PAYMENT_METHODS[number]["id"];

// ── Delivery config ───────────────────────────────────────────────────────────
export const DELIVERY_FEE_CONFIG = {
  fee: DELIVERY_FEE,
  freeAbove: DELIVERY_FREE_ABOVE,
  packagingFee: PACKAGING_FEE,
  surgeFee: SURGE_FEE,
  estimatedMinutes: DELIVERY_PROMISE_MINUTES,
  maxDistanceKm: 3,
} as const;
