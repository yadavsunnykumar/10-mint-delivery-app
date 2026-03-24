import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  Lock,
  ChevronDown,
  Package,
  RefreshCw,
  LogOut,
  Home,
  Plus,
  X,
  ImageIcon,
} from "lucide-react";
import {
  adminGetProducts,
  adminUpdateStock,
  adminCreateProduct,
  adminGetOrders,
  adminUpdateOrderStatus,
} from "@/lib/api";
import type { Product, Order } from "@/lib/api";
import {
  ADMIN_KEY,
  ORDER_STATUSES,
  STATUS_COLORS,
  PRODUCT_CATEGORIES,
  CURRENCY_SYMBOL,
} from "@/lib/constants";

// ──────────────────────────────────────────────────────────────────────────────
// Add-Product form (inline panel)
// ──────────────────────────────────────────────────────────────────────────────

type NewProduct = {
  name: string;
  category: string;
  brand: string;
  price: string;
  originalPrice: string;
  discount: string;
  weight: string;
  image: string;
  stock: string;
  tag: string;
  rating: string;
};

const EMPTY: NewProduct = {
  name: "",
  category: "",
  brand: "",
  price: "",
  originalPrice: "",
  discount: "MRP",
  weight: "",
  image: "",
  stock: "50",
  tag: "",
  rating: "4.0",
};

function AddProductPanel({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<NewProduct>(EMPTY);
  const [preview, setPreview] = useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      adminCreateProduct({
        name: form.name,
        category: form.category,
        brand: form.brand,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        discount: form.discount || "MRP",
        weight: form.weight,
        image: form.image,
        stock: Number(form.stock) || 50,
        tag: form.tag || undefined,
        rating: Number(form.rating) || 4.0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      onClose();
    },
  });

  const set = (k: keyof NewProduct, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const field =
    "w-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50";

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white text-sm">Add New Product</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Name */}
        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs text-gray-400 font-medium">
            Product Name *
          </label>
          <input
            className={field}
            placeholder="e.g. Amul Butter 100g"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 font-medium">
            Category *
          </label>
          <select
            className={field}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">Select category…</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 font-medium">Brand</label>
          <input
            className={field}
            placeholder="e.g. Amul"
            value={form.brand}
            onChange={(e) => set("brand", e.target.value)}
          />
        </div>

        {/* Price */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 font-medium">
            Selling Price ({CURRENCY_SYMBOL}) *
          </label>
          <input
            className={field}
            type="number"
            min={0}
            placeholder="49"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
          />
        </div>

        {/* Original Price */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 font-medium">
            MRP ({CURRENCY_SYMBOL}) *
          </label>
          <input
            className={field}
            type="number"
            min={0}
            placeholder="60"
            value={form.originalPrice}
            onChange={(e) => set("originalPrice", e.target.value)}
          />
        </div>

        {/* Discount label */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 font-medium">
            Discount Label
          </label>
          <input
            className={field}
            placeholder="e.g. 18% off"
            value={form.discount}
            onChange={(e) => set("discount", e.target.value)}
          />
        </div>

        {/* Weight / Unit */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 font-medium">
            Weight / Unit
          </label>
          <input
            className={field}
            placeholder="e.g. 100 g"
            value={form.weight}
            onChange={(e) => set("weight", e.target.value)}
          />
        </div>

        {/* Tag */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 font-medium">Badge Tag</label>
          <input
            className={field}
            placeholder="e.g. New, Hot, Best Seller"
            value={form.tag}
            onChange={(e) => set("tag", e.target.value)}
          />
        </div>

        {/* Rating */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 font-medium">
            Rating (0–5)
          </label>
          <input
            className={field}
            type="number"
            min={0}
            max={5}
            step={0.1}
            placeholder="4.0"
            value={form.rating}
            onChange={(e) => set("rating", e.target.value)}
          />
        </div>

        {/* Stock */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 font-medium">
            Initial Stock
          </label>
          <input
            className={field}
            type="number"
            min={0}
            placeholder="50"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
          />
        </div>

        {/* Image URL */}
        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs text-gray-400 font-medium">Image URL</label>
          <div className="flex gap-2">
            <input
              className={`${field} flex-1`}
              placeholder="https://… or /images/product.png"
              value={form.image}
              onChange={(e) => {
                set("image", e.target.value);
                setPreview(e.target.value);
              }}
            />
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-10 h-10 rounded-lg object-contain bg-gray-800 border border-gray-700 flex-shrink-0"
                onError={() => setPreview("")}
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        </div>
      </div>

      {createMutation.isError && (
        <p className="text-xs text-red-400">
          Failed to create product. Check all required fields.
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => createMutation.mutate()}
          disabled={
            createMutation.isPending ||
            !form.name ||
            !form.category ||
            !form.price ||
            !form.originalPrice
          }
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
        >
          {createMutation.isPending ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          Add Product
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Products sub-tab
// ──────────────────────────────────────────────────────────────────────────────
function ProductsTab() {
  const qc = useQueryClient();
  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-products"],
    queryFn: adminGetProducts,
    staleTime: 10_000,
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) =>
      adminUpdateStock(id, stock),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const [editMap, setEditMap] = useState<Record<string, number>>({});
  const [addOpen, setAddOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 bg-secondary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {addOpen && <AddProductPanel onClose={() => setAddOpen(false)} />}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {products?.length ?? 0} products
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={() => setAddOpen((o) => !o)}
            className="flex items-center gap-1.5 text-xs bg-blue-700 hover:bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[420px]">
            <div className="grid grid-cols-[1fr_80px_90px_70px] gap-3 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/50 border-b border-border">
              <span>Product</span>
              <span className="text-center">Price</span>
              <span className="text-center">Stock</span>
              <span className="text-center">Save</span>
            </div>
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {products?.map((product: Product & { _id?: string }) => {
                const pid =
                  (product as Product & { _id?: string })._id ?? product.id;
                const editStock = editMap[pid] ?? product.stock ?? 50;
                return (
                  <div
                    key={pid}
                    className="grid grid-cols-[1fr_80px_90px_70px] gap-3 px-4 py-3 items-center"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-9 h-9 object-contain rounded bg-secondary flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {product.category}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground text-center">
                      {CURRENCY_SYMBOL}
                      {product.price}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={999}
                      value={editStock}
                      onChange={(e) =>
                        setEditMap((m) => ({
                          ...m,
                          [pid]: Number(e.target.value),
                        }))
                      }
                      className="w-full text-center bg-secondary border border-border rounded px-1 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={() =>
                        stockMutation.mutate({ id: pid, stock: editStock })
                      }
                      disabled={stockMutation.isPending}
                      className="text-xs bg-primary text-primary-foreground font-semibold px-2 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-60 w-full"
                    >
                      Save
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Orders sub-tab
// ──────────────────────────────────────────────────────────────────────────────
function OrdersTab() {
  const qc = useQueryClient();
  const {
    data: orders,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: adminGetOrders,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

  const statusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: Order["order_status"];
    }) => adminUpdateOrderStatus(orderId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-secondary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {orders?.length ?? 0} recent orders
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {orders?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No orders yet
        </div>
      )}

      <div className="space-y-3">
        {orders?.map((order: Order) => (
          <div
            key={order._id}
            className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">
                {order.order_id}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleString("en-IN")} ·{" "}
                {order.items.length} items · {CURRENCY_SYMBOL}
                {order.total_amount}
              </p>
              <span
                className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.order_status] ?? ""}`}
              >
                {order.order_status.replace("_", " ")}
              </span>
            </div>

            <div className="relative">
              <select
                defaultValue={order.order_status}
                onChange={(e) =>
                  statusMutation.mutate({
                    orderId: order.order_id,
                    status: e.target.value as Order["order_status"],
                  })
                }
                className="appearance-none bg-secondary text-foreground border border-border text-sm px-3 py-1.5 pr-7 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Admin Panel (password gate + standalone layout)
// ──────────────────────────────────────────────────────────────────────────────
const AdminPanel = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("everest_admin") === ADMIN_KEY,
  );
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"orders" | "products">("orders");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_KEY) {
      sessionStorage.setItem("everest_admin", ADMIN_KEY);
      setAuthed(true);
      setError("");
    } else {
      setError("Invalid admin key");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("everest_admin");
    setAuthed(false);
    setPassword("");
  };

  // ── Full-page shell ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-everest-blueLight" />
          <span className="font-bold text-white text-lg tracking-tight">
            Everest <span className="text-everest-blueLight">Admin</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {authed && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors border border-red-800 px-2.5 py-1 rounded-lg"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1">
        {!authed ? (
          /* ── Login screen ── */
          <div className="flex items-center justify-center min-h-[80vh] px-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-sm w-full space-y-5 shadow-2xl">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-everest-blueLight" />
                </div>
                <h1 className="text-xl font-bold text-white">Admin Access</h1>
                <p className="text-sm text-gray-400 text-center">
                  Enter the admin key to access the dashboard
                </p>
              </div>
              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin Key"
                  className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-gray-500"
                />
                {error && (
                  <p className="text-xs text-red-400 font-medium">{error}</p>
                )}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  <Lock className="w-4 h-4" />
                  Enter Admin Panel
                </button>
              </form>
              <p className="text-xs text-gray-600 text-center">
                Hint: everest-admin-2024
              </p>
            </div>
          </div>
        ) : (
          /* ── Dashboard ── */
          <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-everest-blueLight" />
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
              <span className="text-xs bg-blue-500/20 text-blue-400 font-semibold px-2.5 py-0.5 rounded-full border border-blue-500/30">
                Admin
              </span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              {(["orders", "products"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2.5 text-sm font-semibold capitalize transition-colors ${
                    tab === t
                      ? "border-b-2 border-purple-400 text-purple-400"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    {t}
                  </span>
                </button>
              ))}
            </div>

            {/* Override CSS variables for dark admin theme */}
            <div className="[--background:220_13%_9%] [--foreground:210_40%_96%] [--card:220_13%_12%] [--border:220_13%_20%] [--secondary:220_13%_15%] [--muted-foreground:217_11%_55%] [--primary:270_70%_60%]">
              {tab === "products" && <ProductsTab />}
              {tab === "orders" && <OrdersTab />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
