import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
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

interface Props {
  product: Product | null;
  onClose: () => void;
}

const { height: SCREEN_H } = Dimensions.get("window");

export default function ProductDetailModal({ product, onClose }: Props) {
  const { colors } = useTheme();
  const { getQty, addToCart, updateItem, removeItem } = useCart();
  const { isLoggedIn, openLoginModal } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  if (!product) return null;

  const qty = getQty(product.id);
  const wishlisted = isWishlisted(product.id);
  const discountPct =
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100,
        )
      : 0;
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAdd = async () => {
    if (!isLoggedIn) {
      onClose();
      openLoginModal();
      return;
    }
    await addToCart(product.id);
  };

  const s = styles(colors);

  return (
    <Modal
      visible={!!product}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <TouchableOpacity style={s.backdrop} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.handle} />

          {/* Action buttons row */}
          <View style={s.actionRow}>
            <TouchableOpacity
              style={s.wishlistBtn}
              onPress={() => toggleWishlist(product)}
            >
              <Ionicons
                name={wishlisted ? "heart" : "heart-outline"}
                size={20}
                color={wishlisted ? BRAND_COLORS.red : colors.subtext}
              />
            </TouchableOpacity>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Image
              source={{ uri: product.image }}
              style={s.image}
              resizeMode="contain"
            />

            <View style={s.body}>
              {/* Badges row */}
              <View style={s.badgesRow}>
                {discountPct > 0 && (
                  <View style={s.discountBadge}>
                    <Text style={s.discountBadgeText}>{discountPct}% OFF</Text>
                  </View>
                )}
                {product.tag && (
                  <View style={s.tagBadge}>
                    <Text style={s.tagBadgeText}>{product.tag}</Text>
                  </View>
                )}
                {isOutOfStock && (
                  <View style={s.outOfStockBadge}>
                    <Text style={s.outOfStockText}>Out of Stock</Text>
                  </View>
                )}
              </View>

              <Text style={s.name}>{product.name}</Text>
              <Text style={s.weight}>{product.weight || product.unit}</Text>

              {product.brand && (
                <Text style={s.brand}>by {product.brand}</Text>
              )}

              {/* Rating */}
              {product.rating ? (
                <View style={s.ratingRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons
                      key={i}
                      name={i <= Math.round(product.rating!) ? "star" : "star-outline"}
                      size={14}
                      color="#F59E0B"
                    />
                  ))}
                  <Text style={s.ratingCount}>
                    {product.rating.toFixed(1)}
                    {product.ratingCount ? ` (${product.ratingCount} reviews)` : ""}
                  </Text>
                </View>
              ) : null}

              {/* Price */}
              <View style={s.priceRow}>
                <Text style={s.price}>
                  {CURRENCY_SYMBOL}{product.price}
                </Text>
                {product.originalPrice > product.price && (
                  <Text style={s.originalPrice}>
                    {CURRENCY_SYMBOL}{product.originalPrice}
                  </Text>
                )}
                {discountPct > 0 && (
                  <Text style={s.savings}>
                    Save {CURRENCY_SYMBOL}{product.originalPrice - product.price}
                  </Text>
                )}
              </View>

              {/* Delivery info */}
              <View style={s.deliveryInfo}>
                <Ionicons name="flash-outline" size={14} color={BRAND_COLORS.success} />
                <Text style={s.deliveryText}>Delivered in ~10 minutes</Text>
              </View>

              <View style={s.separator} />

              {/* Description */}
              {product.description ? (
                <>
                  <Text style={s.sectionTitle}>About this product</Text>
                  <Text style={s.description}>{product.description}</Text>
                  <View style={s.separator} />
                </>
              ) : null}

              {/* Product details */}
              <Text style={s.sectionTitle}>Product Details</Text>
              <View style={s.detailsGrid}>
                <DetailRow label="Category" value={product.category} />
                {product.brand && <DetailRow label="Brand" value={product.brand} />}
                {product.weight && <DetailRow label="Weight" value={product.weight} />}
                <DetailRow
                  label="Availability"
                  value={
                    isOutOfStock
                      ? "Out of stock"
                      : product.stock != null
                      ? `In stock (${product.stock} units)`
                      : "In stock"
                  }
                  valueColor={isOutOfStock ? BRAND_COLORS.red : BRAND_COLORS.success}
                />
              </View>

              {/* Add to cart */}
              <View style={s.addRow}>
                {isOutOfStock ? (
                  <View style={[s.addBtn, s.addBtnDisabled]}>
                    <Text style={s.addBtnText}>Currently Unavailable</Text>
                  </View>
                ) : qty === 0 ? (
                  <TouchableOpacity style={s.addBtn} onPress={handleAdd}>
                    <Ionicons name="bag-add-outline" size={18} color="#fff" />
                    <Text style={s.addBtnText}>Add to Cart</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={s.qtyControl}>
                    <TouchableOpacity
                      style={s.qtyBtn}
                      onPress={() =>
                        qty <= 1 ? removeItem(product.id) : updateItem(product.id, qty - 1)
                      }
                    >
                      <Ionicons
                        name={qty <= 1 ? "trash-outline" : "remove"}
                        size={18}
                        color="#fff"
                      />
                    </TouchableOpacity>
                    <Text style={s.qtyText}>{qty} in cart</Text>
                    <TouchableOpacity
                      style={s.qtyBtn}
                      onPress={() => updateItem(product.id, qty + 1)}
                    >
                      <Ionicons name="add" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
      <Text style={{ fontSize: 13, color: colors.subtext }}>{label}</Text>
      <Text style={{ fontSize: 13, color: valueColor ?? colors.text, fontWeight: "500" }}>
        {value}
      </Text>
    </View>
  );
}

const styles = (colors: ReturnType<typeof import("@/context/ThemeContext").useTheme>["colors"]) =>
  StyleSheet.create({
    overlay: { flex: 1, justifyContent: "flex-end" },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: SCREEN_H * 0.88,
      paddingBottom: 40,
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginTop: 10,
      marginBottom: 4,
    },
    actionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 6,
    },
    wishlistBtn: {
      padding: 6,
      borderRadius: 20,
      backgroundColor: colors.inputBg,
    },
    closeBtn: {
      padding: 6,
      borderRadius: 20,
      backgroundColor: colors.inputBg,
    },
    image: { width: "100%", height: 220 },
    body: { padding: 16 },
    badgesRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 10 },
    discountBadge: {
      backgroundColor: "#DCFCE7",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    discountBadgeText: { fontSize: 11, fontWeight: "700", color: "#16A34A" },
    tagBadge: {
      backgroundColor: "#EFF6FF",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    tagBadgeText: { fontSize: 11, fontWeight: "700", color: BRAND_COLORS.blue },
    outOfStockBadge: {
      backgroundColor: "#FEE2E2",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    outOfStockText: { fontSize: 11, fontWeight: "700", color: BRAND_COLORS.red },
    name: { fontSize: 19, fontWeight: "700", color: colors.text, marginBottom: 4 },
    weight: { fontSize: 13, color: colors.subtext, marginBottom: 4 },
    brand: { fontSize: 12, color: colors.subtext, marginBottom: 10 },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      marginBottom: 12,
    },
    ratingCount: { fontSize: 12, color: colors.subtext, marginLeft: 4 },
    priceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 10,
      marginBottom: 10,
    },
    price: { fontSize: 24, fontWeight: "800", color: colors.text },
    originalPrice: {
      fontSize: 15,
      color: colors.subtext,
      textDecorationLine: "line-through",
    },
    savings: { fontSize: 13, fontWeight: "600", color: BRAND_COLORS.success },
    deliveryInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 16,
    },
    deliveryText: { fontSize: 13, color: BRAND_COLORS.success, fontWeight: "500" },
    separator: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
    sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 10 },
    description: { fontSize: 13, color: colors.subtext, lineHeight: 20 },
    detailsGrid: {},
    addRow: { marginTop: 16 },
    addBtn: {
      backgroundColor: BRAND_COLORS.blue,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    addBtnDisabled: { backgroundColor: colors.border },
    addBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    qtyControl: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: BRAND_COLORS.blue,
      borderRadius: 14,
      overflow: "hidden",
    },
    qtyBtn: { paddingHorizontal: 22, paddingVertical: 14 },
    qtyText: {
      flex: 1,
      textAlign: "center",
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
  });
