import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, ADMIN_KEY } from "./constants";

const BASE = `${API_BASE_URL}/api`;

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: string;
  weight: string;
  unit: string;
  rating?: number;
  ratingCount?: number;
  tag?: string;
  category: string;
  brand?: string;
  description?: string;
  stock?: number;
  tags?: string[];
}

export interface CartItem {
  product_id: string;
  qty: number;
  product: Product | null;
}

export interface CartResponse {
  success: boolean;
  items: CartItem[];
  total: number;
}

export type OrderStatus =
  | "created"
  | "accepted"
  | "packed"
  | "assigned"
  | "en_route"
  | "delivered"
  | "cancelled";

export interface Order {
  _id: string;
  order_id: string;
  user_id: string;
  warehouse_id: string;
  items: Array<{ product_id: string; qty: number; price?: number }>;
  total_amount: number;
  promo_code?: string | null;
  promo_discount?: number;
  payment_status: "pending" | "paid" | "failed";
  payment_method?: "upi" | "card" | "cod" | "wallet";
  order_status: OrderStatus;
  eta_minutes?: number;
  delivery_instructions?: string;
  cancellation_reason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product_id: string;
  qty: number;
  price: number;
}

export interface PlaceOrderResponse {
  success: boolean;
  order: {
    order_id: string;
    eta_minutes: number;
    total_amount: number;
    status: string;
  };
}

export interface OrderTracking {
  order_id: string;
  order_status: OrderStatus;
  eta_minutes: number;
  total_amount?: number;
  payment_status?: string;
  payment_method?: string;
  created_at?: string;
  warehouse_id?: string;
  warehouse_name?: string;
  cancellation_reason?: string | null;
  delivery_instructions?: string;
  items?: Array<{
    product_id: string;
    qty: number;
    name?: string;
    image?: string;
    price?: number | null;
    weight?: string;
  }>;
  user_location: { lat: number; lng: number };
  warehouse_location?: { lat: number; lng: number } | null;
  rider?: {
    name: string;
    phone?: string;
    vehicle_number?: string;
    rider_id?: string;
    current_location?: { lat: number; lng: number };
  } | null;
}

export interface Warehouse {
  warehouse_id: string;
  name: string;
  location: { lat: number; lng: number };
  address?: string;
  city?: string;
}

export interface Recommendations {
  trending: Product[];
  personalized: Product[];
  frequently_bought_together: Product[];
}

export interface EtaEstimate {
  eta_minutes: number;
  distance_km: number;
  warehouse_name: string;
  warehouse_city: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function authHeaders(): Promise<HeadersInit> {
  const token = await AsyncStorage.getItem("everest_token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

async function adminHeaders(): Promise<HeadersInit> {
  const base = await authHeaders();
  return { ...base, "X-Admin-Key": ADMIN_KEY };
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

function normalizeProduct(p: Record<string, unknown>): Product {
  return {
    ...(p as unknown as Product),
    id: (p.id ?? p._id ?? "") as string,
    ratingCount: typeof p.ratingCount === "string" ? Number(p.ratingCount) || 0 : (p.ratingCount as number ?? 0),
  };
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: "popular" | "price_asc" | "price_desc" | "rating" | "name";
}): Promise<{ products: Product[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.search) qs.set("search", params.search);
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  if (params?.sort) qs.set("sort", params.sort);
  const queryStr = qs.toString();
  const url = `${BASE}/products${queryStr ? `?${queryStr}` : ""}`;
  const data = await json<{ success: boolean; products: Product[]; total: number }>(
    await fetch(url),
  );
  return { products: data.products, total: data.total ?? data.products.length };
}

export async function fetchProductById(id: string): Promise<Product> {
  const data = await json<{ success: boolean; product: Product }>(
    await fetch(`${BASE}/products/${encodeURIComponent(id)}`),
  );
  return normalizeProduct(data.product as unknown as Record<string, unknown>);
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function sendOtp(
  phone: string,
): Promise<{ success: boolean; is_new_user: boolean; otp?: string }> {
  return json(
    await fetch(`${BASE}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    }),
  );
}

export async function verifyOtp(
  phone: string,
  otp: string,
  name?: string,
): Promise<{
  success: boolean;
  token: string;
  user: { user_id: string; name: string; phone: string };
}> {
  return json(
    await fetch(`${BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp, name }),
    }),
  );
}

export async function updateProfile(data: {
  name?: string;
  alt_phone?: string | null;
  avatar?: string | null;
}): Promise<{
  success: boolean;
  user: {
    user_id: string;
    name: string;
    phone: string;
    alt_phone?: string | null;
    avatar?: string | null;
  };
}> {
  return json(
    await fetch(`${BASE}/auth/profile`, {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    }),
  );
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export async function getCart(): Promise<CartResponse> {
  return json(await fetch(`${BASE}/cart`, { headers: await authHeaders() }));
}

export async function addToCart(
  product_id: string,
  qty = 1,
): Promise<{ success: boolean }> {
  return json(
    await fetch(`${BASE}/cart/add`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ product_id, qty }),
    }),
  );
}

export async function updateCartItem(
  product_id: string,
  qty: number,
): Promise<{ success: boolean }> {
  return json(
    await fetch(`${BASE}/cart/item/${product_id}`, {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify({ qty }),
    }),
  );
}

export async function removeFromCart(
  product_id: string,
): Promise<{ success: boolean }> {
  return json(
    await fetch(`${BASE}/cart/item/${product_id}`, {
      method: "DELETE",
      headers: await authHeaders(),
    }),
  );
}

export async function clearCartApi(): Promise<{ success: boolean }> {
  return json(
    await fetch(`${BASE}/cart/clear`, {
      method: "DELETE",
      headers: await authHeaders(),
    }),
  );
}

// ── AI Search ─────────────────────────────────────────────────────────────────

export async function aiSearch(q: string): Promise<Product[]> {
  const data = await json<{
    results?: Record<string, unknown>[];
    error?: string;
  }>(await fetch(`${BASE}/ai/search?q=${encodeURIComponent(q)}`));
  return (data.results ?? []).map(normalizeProduct);
}

// ── AI Recommendations ────────────────────────────────────────────────────────

export async function getRecommendations(userId: string): Promise<Recommendations> {
  const data = await json<Record<string, Record<string, unknown>[]>>(
    await fetch(`${BASE}/ai/recommend/${encodeURIComponent(userId)}`),
  );
  return {
    trending: (data.trending ?? []).map(normalizeProduct),
    personalized: (data.personalized ?? []).map(normalizeProduct),
    frequently_bought_together: (data.frequently_bought_together ?? []).map(normalizeProduct),
  };
}

// ── Warehouses ────────────────────────────────────────────────────────────────

export async function getWarehouses(): Promise<Warehouse[]> {
  const data = await json<{ success: boolean; warehouses: Warehouse[] }>(
    await fetch(`${BASE}/warehouses`),
  );
  return data.warehouses;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function placeOrder(data: {
  warehouse_id: string;
  user_location: { lat: number; lng: number };
  items: OrderItem[];
  total_amount: number;
  payment_method?: "upi" | "card" | "cod" | "wallet";
  promo_code?: string | null;
  promo_discount?: number;
  delivery_instructions?: string;
}): Promise<PlaceOrderResponse> {
  return json(
    await fetch(`${BASE}/orders/create`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    }),
  );
}

export async function cancelOrder(
  orderId: string,
  reason?: string,
): Promise<{ success: boolean; order_id: string; order_status: string }> {
  return json(
    await fetch(`${BASE}/orders/cancel/${encodeURIComponent(orderId)}`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ reason }),
    }),
  );
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const data = await json<{ success: boolean; orders: Order[] }>(
    await fetch(`${BASE}/orders/user/${encodeURIComponent(userId)}`, {
      headers: await authHeaders(),
    }),
  );
  return data.orders;
}

export async function getOrderStatus(orderId: string): Promise<{
  order_id: string;
  order_status: OrderStatus;
  eta_minutes: number;
  rider?: {
    name: string;
    phone?: string;
    vehicle_number?: string;
    rider_id?: string;
    current_location?: { lat: number; lng: number };
  } | null;
}> {
  return json(
    await fetch(`${BASE}/orders/status/${encodeURIComponent(orderId)}`, {
      headers: await authHeaders(),
    }),
  );
}

export async function getOrderTracking(orderId: string): Promise<OrderTracking> {
  const data = await json<{ success: boolean } & OrderTracking>(
    await fetch(`${BASE}/orders/tracking/${encodeURIComponent(orderId)}`, {
      headers: await authHeaders(),
    }),
  );
  return data;
}

export async function estimateEta(
  lat: number,
  lng: number,
  itemCount = 5,
): Promise<EtaEstimate> {
  return json(
    await fetch(`${BASE}/orders/estimate-eta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng, item_count: itemCount }),
    }),
  );
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function adminGetProducts(): Promise<Product[]> {
  const data = await json<{ success: boolean; products: Product[] }>(
    await fetch(`${BASE}/admin/products`, { headers: await adminHeaders() }),
  );
  return data.products;
}

export async function adminCreateProduct(
  data: Omit<Product, "id"> & { stock?: number },
): Promise<Product> {
  const result = await json<{ success: boolean; product: Product }>(
    await fetch(`${BASE}/admin/products`, {
      method: "POST",
      headers: await adminHeaders(),
      body: JSON.stringify(data),
    }),
  );
  return result.product;
}

export async function adminUpdateStock(productId: string, stock: number): Promise<Product> {
  const data = await json<{ success: boolean; product: Product }>(
    await fetch(`${BASE}/admin/products/${productId}/stock`, {
      method: "PUT",
      headers: await adminHeaders(),
      body: JSON.stringify({ stock }),
    }),
  );
  return data.product;
}

export async function adminGetOrders(): Promise<Order[]> {
  const data = await json<{ success: boolean; orders: Order[] }>(
    await fetch(`${BASE}/admin/orders`, { headers: await adminHeaders() }),
  );
  return data.orders;
}

export async function adminUpdateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  const data = await json<{ success: boolean; order: Order }>(
    await fetch(`${BASE}/admin/orders/${orderId}/status`, {
      method: "PUT",
      headers: await adminHeaders(),
      body: JSON.stringify({ status }),
    }),
  );
  return data.order;
}
