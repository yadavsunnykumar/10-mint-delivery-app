import { useState, useRef } from "react";
import {
  User,
  Phone,
  ShoppingCart,
  LogOut,
  Package,
  ChevronRight,
  ArrowLeft,
  Star,
  ClipboardList,
  Camera,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import * as api from "@/lib/api";
import { CURRENCY_SYMBOL } from "@/lib/constants";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, openLoginModal, logout, updateUser } = useAuth();
  const { cartCount, cartTotal, cartItems } = useCart();

  // ── Edit profile state ─────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAltPhone, setEditAltPhone] = useState("");
  const [editAvatar, setEditAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const startEdit = () => {
    setEditName(user?.name ?? "");
    setEditAltPhone(user?.alt_phone ?? "");
    setEditAvatar(user?.avatar ?? null);
    setEditing(true);
    setEditError("");
  };

  const handleAvatarChange = (e: { target: { files: FileList | null } }) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target!.result as string;
      const img = new Image();
      img.onload = () => {
        const MAX = 200;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas
          .getContext("2d")!
          .drawImage(img, 0, 0, canvas.width, canvas.height);
        setEditAvatar(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      setEditError("Name cannot be empty");
      return;
    }
    setSaving(true);
    setEditError("");
    try {
      await api.updateProfile({
        name: editName.trim(),
        alt_phone: editAltPhone.trim() || null,
        avatar: editAvatar,
      });
      updateUser({
        name: editName.trim(),
        alt_phone: editAltPhone.trim() || undefined,
        avatar: editAvatar ?? undefined,
      });
      setEditing(false);
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Not logged in
  if (!isLoggedIn || !user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Welcome to Everest Dash
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Login to view your profile, orders and more
          </p>
        </div>
        <button
          onClick={openLoginModal}
          className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Login / Sign up
        </button>
      </div>
    );
  }

  // Initials avatar
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const totalSaved = cartItems.reduce((acc, item) => {
    if (!item.product) return acc;
    return acc + (item.product.originalPrice - item.product.price) * item.qty;
  }, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Avatar card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        {editing ? (
          /* ── Edit form ───────────────────────────────────────── */
          <div className="space-y-4">
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="relative w-20 h-20 rounded-full cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {editAvatar ? (
                  <img
                    src={editAvatar}
                    alt="avatar"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-2xl font-bold">
                      {initials}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Tap to change photo
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Your full name"
              />
            </div>

            {/* Alt phone */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Alternate Phone{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="tel"
                value={editAltPhone}
                onChange={(e) => setEditAltPhone(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. +977 98XXXXXXXX"
              />
            </div>

            {editError && (
              <p className="text-xs text-destructive">{editError}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                <Check className="w-4 h-4" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="flex items-center justify-center gap-1.5 border border-border text-foreground font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* ── View mode ───────────────────────────────────────── */
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-xl font-bold">
                    {initials}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-foreground truncate">
                {user.name}
              </h1>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{user.phone}</span>
              </div>
              {user.alt_phone && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  <span>{user.alt_phone}</span>
                </div>
              )}
              <span className="inline-block mt-2 text-xs bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full">
                Everest Dash Member
              </span>
            </div>
            <button
              onClick={startEdit}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/40 rounded-lg px-3 py-1.5 hover:bg-primary/10 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Cart summary */}
      <div
        className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => navigate("/cart")}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">My Cart</p>
            <p className="text-xs text-muted-foreground">
              {cartCount > 0
                ? `${cartCount} item${cartCount > 1 ? "s" : ""} · ${CURRENCY_SYMBOL}${cartTotal}`
                : "Cart is empty"}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Savings card (when items in cart) */}
      {totalSaved > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-center gap-3">
          <Star className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
              You're saving {CURRENCY_SYMBOL}
              {totalSaved} on your current cart!
            </p>
            <p className="text-xs text-green-600/70 dark:text-green-500/70 mt-0.5">
              Keep adding products for more savings
            </p>
          </div>
        </div>
      )}

      {/* Menu items */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
        <button
          onClick={() => navigate("/orders")}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ClipboardList className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              My Orders
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Browse Products
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        <button
          onClick={() => navigate("/cart")}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">My Cart</span>
          </div>
          <div className="flex items-center gap-2">
            {cartCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </button>
      </div>

      {/* Account info */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-foreground">Account Info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium text-foreground">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium text-foreground">{user.phone}</span>
          </div>
          {user.alt_phone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alt. Phone</span>
              <span className="font-medium text-foreground">
                {user.alt_phone}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">User ID</span>
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[160px]">
              {user.user_id}
            </span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 border border-destructive text-destructive font-semibold py-3 rounded-xl hover:bg-destructive/10 transition-colors text-sm"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );
};

export default Profile;
