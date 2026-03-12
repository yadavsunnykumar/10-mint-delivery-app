const BASE = "/api";

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: string;
  weight: string;
  rating?: number;
  ratingCount?: string;
  tag?: string;
  category: string;
  brand?: string;
  stock?: number;
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

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("zepto_token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

function adminHeaders(): HeadersInit {
  const adminKey = sessionStorage.getItem("zepto_admin") ?? "";
  return { ...authHeaders(), "X-Admin-Key": adminKey };
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json() as Promise<T>;
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
}): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.search) qs.set("search", params.search);
  const url = `${BASE}/products${qs.size ? `?${qs}` : ""}`;
  const data = await json<{ success: boolean; products: Product[] }>(
    await fetch(url),
  );
  return data.products;
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

// ── Cart ──────────────────────────────────────────────────────────────────────

export async function getCart(): Promise<CartResponse> {
  return json(await fetch(`${BASE}/cart`, { headers: authHeaders() }));
}

export async function addToCart(
  product_id: string,
  qty = 1,
): Promise<{ success: boolean }> {
  return json(
    await fetch(`${BASE}/cart/add`, {
      method: "POST",
      headers: authHeaders(),
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
      headers: authHeaders(),
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
      headers: authHeaders(),
    }),
  );
}

export async function clearCartApi(): Promise<{ success: boolean }> {
  return json(
    await fetch(`${BASE}/cart/clear`, {
      method: "DELETE",
      headers: authHeaders(),
    }),
  );
}

// ── AI Search ─────────────────────────────────────────────────────────────────
// AI service returns raw Mongo docs with `_id` instead of `id`.
// Normalise so ProductCard always gets a defined, unique `id` key.
function normalizeProduct(p: Record<string, unknown>): Product {
  return {
    ...(p as unknown as Product),
    id: (p.id ?? p._id ?? "") as string,
  };
}

export async function aiSearch(q: string): Promise<Product[]> {
  const data = await json<{
    results?: Record<string, unknown>[];
    error?: string;
  }>(await fetch(`${BASE}/ai/search?q=${encodeURIComponent(q)}`));
  return (data.results ?? []).map(normalizeProduct);
}

// ── AI Recommendations ────────────────────────────────────────────────────────
export interface Recommendations {
  trending: Product[];
  personalized: Product[];
  frequently_bought_together: Product[];
}

export async function getRecommendations(
  userId: string,
): Promise<Recommendations> {
  const data = await json<Record<string, Record<string, unknown>[]>>(
    await fetch(`${BASE}/ai/recommend/${encodeURIComponent(userId)}`),
  );
  return {
    trending: (data.trending ?? []).map(normalizeProduct),
    personalized: (data.personalized ?? []).map(normalizeProduct),
    frequently_bought_together: (data.frequently_bought_together ?? []).map(
      normalizeProduct,
    ),
  };
}

// ── Warehouses ────────────────────────────────────────────────────────────────
export interface Warehouse {
  warehouse_id: string;
  name: string;
  location: { lat: number; lng: number };
  address?: string;
  city?: string;
}

export async function getWarehouses(): Promise<Warehouse[]> {
  const data = await json<{ success: boolean; warehouses: Warehouse[] }>(
    await fetch(`${BASE}/warehouses`),
  );
  return data.warehouses;
}

// ── Orders ────────────────────────────────────────────────────────────────────
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

export async function placeOrder(data: {
  warehouse_id: string;
  user_location: { lat: number; lng: number };
  items: OrderItem[];
  total_amount: number;
}): Promise<PlaceOrderResponse> {
  return json(
    await fetch(`${BASE}/orders/create`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }),
  );
}

export interface Order {
  _id: string;
  order_id: string;
  user_id: string;
  warehouse_id: string;
  items: Array<{ product_id: string; qty: number; price?: number }>;
  total_amount: number;
  payment_status: "pending" | "paid" | "failed";
  order_status:
    | "created"
    | "accepted"
    | "packed"
    | "assigned"
    | "en_route"
    | "delivered"
    | "cancelled";
  eta_minutes?: number;
  createdAt: string;
  updatedAt: string;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const data = await json<{ success: boolean; orders: Order[] }>(
    await fetch(`${BASE}/orders/user/${encodeURIComponent(userId)}`, {
      headers: authHeaders(),
    }),
  );
  return data.orders;
}

export async function getOrderStatus(
  orderId: string,
): Promise<{ order_id: string; order_status: string; eta_minutes: number }> {
  const data = await json<{
    success: boolean;
    order_id: string;
    order_status: string;
    eta_minutes: number;
  }>(
    await fetch(`${BASE}/orders/status/${encodeURIComponent(orderId)}`, {
      headers: authHeaders(),
    }),
  );
  return data;
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export async function adminGetProducts(): Promise<Product[]> {
  const data = await json<{ success: boolean; products: Product[] }>(
    await fetch(`${BASE}/admin/products`, { headers: adminHeaders() }),
  );
  return data.products;
}

export async function adminCreateProduct(
  data: Omit<Product, "id"> & { stock?: number },
): Promise<Product> {
  const result = await json<{ success: boolean; product: Product }>(
    await fetch(`${BASE}/admin/products`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(data),
    }),
  );
  return result.product;
}

export async function adminUpdateStock(
  productId: string,
  stock: number,
): Promise<Product> {
  const data = await json<{ success: boolean; product: Product }>(
    await fetch(`${BASE}/admin/products/${productId}/stock`, {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify({ stock }),
    }),
  );
  return data.product;
}

export async function adminGetOrders(): Promise<Order[]> {
  const data = await json<{ success: boolean; orders: Order[] }>(
    await fetch(`${BASE}/admin/orders`, { headers: adminHeaders() }),
  );
  return data.orders;
}

export async function adminUpdateOrderStatus(
  orderId: string,
  status: Order["order_status"],
): Promise<Order> {
  const data = await json<{ success: boolean; order: Order }>(
    await fetch(`${BASE}/admin/orders/${orderId}/status`, {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify({ status }),
    }),
  );
  return data.order;
}

// ── ETA estimation ────────────────────────────────────────────────────────────
export interface EtaEstimate {
  eta_minutes: number;
  distance_km: number;
  warehouse_name: string;
  warehouse_city: string;
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
