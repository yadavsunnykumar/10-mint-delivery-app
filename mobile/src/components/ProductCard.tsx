import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/lib/api";
import { CURRENCY_SYMBOL, BRAND_COLORS } from "@/lib/constants";

const CARD_WIDTH = (Dimensions.get("window").width - 48) / 2;

interface Props {
  product: Product;
  onPress?: (product: Product) => void;
}

export default function ProductCard({ product, onPress }: Props) {
  const { colors } = useTheme();
  const { getQty, addToCart, updateItem, removeItem } = useCart();
  const { isLoggedIn, openLoginModal } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const qty = getQty(product.id);
  const wishlisted = isWishlisted(product.id);

  const handleAdd = async () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    await addToCart(product.id);
  };

  const discountPct =
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100,
        )
      : 0;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const s = styles(colors);

  return (
    <TouchableOpacity
      style={[s.card, isOutOfStock && s.cardDisabled]}
      onPress={() => onPress?.(product)}
      activeOpacity={0.85}
    >
      {/* Discount badge */}
      {discountPct > 0 && (
        <View style={s.badge}>
          <Text style={s.badgeText}>{discountPct}% OFF</Text>
        </View>
      )}

      {/* Wishlist button */}
      <TouchableOpacity
        style={s.wishlistBtn}
        onPress={() => toggleWishlist(product)}
        hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
      >
        <Ionicons
          name={wishlisted ? "heart" : "heart-outline"}
          size={16}
          color={wishlisted ? BRAND_COLORS.red : colors.subtext}
        />
      </TouchableOpacity>

      {/* Product image */}
      <TouchableOpacity onPress={() => onPress?.(product)} activeOpacity={0.9}>
        <Image
          source={{ uri: product.image }}
          style={[s.image, isOutOfStock && s.imageDisabled]}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Out of stock overlay text */}
      {isOutOfStock && (
        <View style={s.outOfStockBadge}>
          <Text style={s.outOfStockText}>Out of Stock</Text>
        </View>
      )}

      {/* Tag (e.g. "New", "Bestseller") */}
      {product.tag && !isOutOfStock && (
        <View style={s.tagBadge}>
          <Text style={s.tagText}>{product.tag}</Text>
        </View>
      )}

      <Text style={s.name} numberOfLines={2}>{product.name}</Text>
      <Text style={s.weight}>{product.weight || product.unit}</Text>

      {/* Rating */}
      {product.rating ? (
        <View style={s.ratingRow}>
          <Ionicons name="star" size={10} color="#F59E0B" />
          <Text style={s.ratingText}>{product.rating.toFixed(1)}</Text>
          {product.ratingCount ? (
            <Text style={s.ratingCount}>({product.ratingCount})</Text>
          ) : null}
        </View>
      ) : null}

      {/* Price + Add button */}
      <View style={s.priceRow}>
        <View>
          <Text style={s.price}>
            {CURRENCY_SYMBOL}{product.price}
          </Text>
          {product.originalPrice > product.price && (
            <Text style={s.originalPrice}>
              {CURRENCY_SYMBOL}{product.originalPrice}
            </Text>
          )}
        </View>

        {isOutOfStock ? (
          <View style={s.soldOutBtn}>
            <Text style={s.soldOutText}>Notify</Text>
          </View>
        ) : qty === 0 ? (
          <TouchableOpacity style={s.addBtn} onPress={handleAdd}>
            <Ionicons name="add" size={16} color={BRAND_COLORS.blue} />
            <Text style={s.addBtnText}>ADD</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.qtyControl}>
            <TouchableOpacity
              style={s.qtyBtn}
              onPress={async () => {
                if (qty <= 1) await removeItem(product.id);
                else await updateItem(product.id, qty - 1);
              }}
            >
              <Ionicons name={qty <= 1 ? "trash-outline" : "remove"} size={13} color={BRAND_COLORS.blue} />
            </TouchableOpacity>
            <Text style={s.qtyText}>{qty}</Text>
            <TouchableOpacity
              style={s.qtyBtn}
              onPress={() => updateItem(product.id, qty + 1)}
            >
              <Ionicons name="add" size={13} color={BRAND_COLORS.blue} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = (colors: ReturnType<typeof import("@/context/ThemeContext").useTheme>["colors"]) =>
  StyleSheet.create({
    card: {
      width: CARD_WIDTH,
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 10,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
      elevation: 3,
    },
    cardDisabled: { opacity: 0.75 },
    badge: {
      position: "absolute",
      top: 8,
      left: 8,
      backgroundColor: "#DCFCE7",
      borderRadius: 5,
      paddingHorizontal: 5,
      paddingVertical: 2,
      zIndex: 2,
    },
    badgeText: { fontSize: 9, fontWeight: "700", color: "#16A34A" },
    wishlistBtn: {
      position: "absolute",
      top: 8,
      right: 8,
      zIndex: 2,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 3,
    },
    image: { width: "100%", height: 100, borderRadius: 10, marginBottom: 8 },
    imageDisabled: { opacity: 0.5 },
    outOfStockBadge: {
      backgroundColor: "#FEE2E2",
      borderRadius: 5,
      paddingHorizontal: 6,
      paddingVertical: 2,
      alignSelf: "flex-start",
      marginBottom: 4,
    },
    outOfStockText: { fontSize: 9, fontWeight: "700", color: BRAND_COLORS.red },
    tagBadge: {
      backgroundColor: "#EFF6FF",
      borderRadius: 5,
      paddingHorizontal: 6,
      paddingVertical: 2,
      alignSelf: "flex-start",
      marginBottom: 4,
    },
    tagText: { fontSize: 9, fontWeight: "700", color: BRAND_COLORS.blue },
    name: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
      lineHeight: 18,
    },
    weight: { fontSize: 11, color: colors.subtext, marginBottom: 4 },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      marginBottom: 6,
    },
    ratingText: { fontSize: 10, color: colors.subtext, fontWeight: "600" },
    ratingCount: { fontSize: 10, color: colors.subtext },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: "auto",
    },
    price: { fontSize: 14, fontWeight: "700", color: colors.text },
    originalPrice: {
      fontSize: 10,
      color: colors.subtext,
      textDecorationLine: "line-through",
    },
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      borderWidth: 1.5,
      borderColor: BRAND_COLORS.blue,
      borderRadius: 7,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    addBtnText: { color: BRAND_COLORS.blue, fontWeight: "700", fontSize: 11 },
    soldOutBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 7,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    soldOutText: { fontSize: 11, color: colors.subtext, fontWeight: "600" },
    qtyControl: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: BRAND_COLORS.blue,
      borderRadius: 7,
      overflow: "hidden",
    },
    qtyBtn: {
      paddingHorizontal: 6,
      paddingVertical: 5,
      backgroundColor: "#EFF6FF",
    },
    qtyText: {
      fontSize: 12,
      fontWeight: "700",
      color: BRAND_COLORS.blue,
      paddingHorizontal: 7,
    },
  });
