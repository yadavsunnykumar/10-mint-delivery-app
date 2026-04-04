import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import PaymentModal, { PaymentMethod } from "@/components/PaymentModal";
import {
  BRAND_COLORS,
  CURRENCY_SYMBOL,
  DELIVERY_FEE,
  DELIVERY_FREE_ABOVE,
  PROMO_CODES,
} from "@/lib/constants";
import { getWarehouses, placeOrder, clearCartApi, fetchProducts, getUserOrders, CartItem, Product } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import type { RootStackParamList } from "@/navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CartScreen() {
  const { colors } = useTheme();
  const { cartItems, cartTotal, updateItem, removeItem, clearCart } = useCart();
  const { isLoggedIn, openLoginModal, user } = useAuth();
  const { location } = useLocation();
  const navigation = useNavigation<Nav>();
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");
  const [instructions, setInstructions] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Derive category from cart items for suggestions
  const cartCategories = [...new Set(cartItems.map((i) => i.product?.category).filter(Boolean))] as string[];
  const suggestCategory = cartCategories[0] ?? null;

  // Also pull from past orders to suggest repeat purchases
  const { data: pastOrders = [] } = useQuery({
    queryKey: ["orders", user?.user_id],
    queryFn: () => getUserOrders(user!.user_id),
    enabled: !!user && cartItems.length === 0,
    staleTime: 60_000,
  });
  const pastCategory = pastOrders[0]?.items?.[0]?.product_id ? null : null; // placeholder

  // Suggested products — based on current cart category, else popular
  const { data: suggestionsData } = useQuery({
    queryKey: ["suggestions", suggestCategory],
    queryFn: () => fetchProducts(suggestCategory ? { category: suggestCategory, limit: 10 } : { sort: "popular", limit: 10 }),
    staleTime: 120_000,
  });

  const promoData = appliedPromo ? PROMO_CODES[appliedPromo] : null;
  const promoDiscount = promoData
    ? promoData.type === "flat"
      ? promoData.discount
      : Math.round((cartTotal * promoData.discount) / 100)
    : 0;
  const deliveryFee = cartTotal >= DELIVERY_FREE_ABOVE ? 0 : DELIVERY_FEE;
  const grandTotal = Math.max(0, cartTotal + deliveryFee - promoDiscount);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    setPromoError("");
    if (!code) return;
    const promo = PROMO_CODES[code];
    if (!promo) {
      setPromoError("Invalid promo code");
      return;
    }
    if (promo.minOrder && cartTotal < promo.minOrder) {
      setPromoError(`Minimum order ${CURRENCY_SYMBOL}${promo.minOrder} required`);
      return;
    }
    setAppliedPromo(code);
    setPromoInput("");
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Add some items first.");
      return;
    }
    setPaymentVisible(true);
  };

  const handlePaymentSuccess = async (method: PaymentMethod) => {
    setPlacing(true);
    try {
      const warehouses = await getWarehouses();
      const warehouse = warehouses[0];
      if (!warehouse) throw new Error("No warehouse available");

      const userLocation = location?.coords ?? { lat: 27.7172, lng: 85.324 };
      const orderItems = cartItems
        .filter(
          (i): i is CartItem & { product: NonNullable<CartItem["product"]> } =>
            i.product !== null,
        )
        .map((i) => ({
          product_id: i.product_id,
          qty: i.qty,
          price: i.product.price,
        }));

      const order = await placeOrder({
        warehouse_id: warehouse.warehouse_id,
        user_location: userLocation,
        items: orderItems,
        total_amount: grandTotal,
        payment_method: method,
        promo_code: appliedPromo,
        promo_discount: promoDiscount,
        delivery_instructions: instructions.trim() || undefined,
      });

      await clearCartApi();
      clearCart();
      setPaymentVisible(false);
      setAppliedPromo(null);
      setInstructions("");

      Alert.alert(
        "Order Placed!",
        `Order #${order.order.order_id.slice(-6).toUpperCase()} confirmed!\nETA: ~${order.order.eta_minutes} min`,
        [
          {
            text: "Track Order",
            onPress: () => navigation.navigate("TrackOrder", { orderId: order.order.order_id }),
          },
          { text: "OK" },
        ],
      );
    } catch (e: unknown) {
      throw e;
    } finally {
      setPlacing(false);
    }
  };

  const s = styles(colors);

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.headerBar}>
          <Text style={s.headerTitle}>My Cart</Text>
        </View>
        <View style={s.emptyContainer}>
          <Text style={s.emptyEmoji}>🛒</Text>
          <Text style={s.emptyTitle}>Your cart is empty</Text>
          <Text style={s.emptySub}>Login to view your saved cart</Text>
          <TouchableOpacity style={s.actionBtn} onPress={openLoginModal}>
            <Text style={s.actionBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    const suggestions = suggestionsData?.products ?? [];
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.headerBar}>
          <Text style={s.headerTitle}>My Cart</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Empty state hero */}
          <View style={s.emptyHero}>
            <Text style={s.emptyEmoji}>🛒</Text>
            <Text style={s.emptyTitle}>Your cart is empty</Text>
            <Text style={s.emptySub}>Add items to get started</Text>
            <View style={s.shopBtnRow}>
              <TouchableOpacity
                style={s.actionBtn}
                onPress={() => {
                  // Navigate to Home tab which shows all products
                  navigation.navigate("Main");
                }}
              >
                <Ionicons name="storefront-outline" size={16} color="#fff" />
                <Text style={s.actionBtnText}>Shop Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.browseBtn}
                onPress={() => navigation.navigate("SearchResults", { query: "" })}
              >
                <Ionicons name="search-outline" size={16} color={BRAND_COLORS.blue} />
                <Text style={s.browseBtnText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick category shortcuts */}
          <View style={s.quickCatsSection}>
            <Text style={s.suggestTitle}>Browse Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.quickCatsScroll}>
              {[
                { label: "🥦 Vegetables", slug: "fruits-vegetables" },
                { label: "🥛 Dairy",      slug: "dairy-bread-eggs" },
                { label: "🍜 Noodles",    slug: "packaged-food" },
                { label: "🍿 Snacks",     slug: "biscuits-snacks" },
                { label: "🍗 Meat",       slug: "meat-seafood" },
                { label: "🪔 Puja",       slug: "puja-festival" },
                { label: "💊 Health",     slug: "health-wellness" },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.slug}
                  style={s.quickCatChip}
                  onPress={() => navigation.navigate("Shop", { slug: cat.slug })}
                >
                  <Text style={s.quickCatText}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Suggested products */}
          {suggestions.length > 0 && (
            <View style={s.suggestSection}>
              <View style={s.suggestHeader}>
                <Text style={s.suggestTitle}>
                  {suggestCategory ? `More from ${suggestCategory}` : "Popular Right Now"}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Main")}>
                  <Text style={s.seeAllText}>See all</Text>
                </TouchableOpacity>
              </View>
              <View style={s.suggestGrid}>
                {suggestions.slice(0, 6).map((product) => (
                  <View key={product.id} style={s.suggestCardWrapper}>
                    <ProductCard product={product} onPress={setSelectedProduct} />
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.headerBar}>
        <Text style={s.headerTitle}>My Cart ({cartItems.length})</Text>
      </View>

      {/* Delivery ETA strip */}
      <View style={s.etaBanner}>
        <Ionicons name="flash" size={15} color={BRAND_COLORS.success} />
        <Text style={s.etaText}>
          Delivery in ~10 min to {location?.area ?? "your location"}
        </Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.product_id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (!item.product) return null;
          const { product } = item;
          return (
            <View style={s.cartItem}>
              <Image
                source={{ uri: product.image }}
                style={s.productImage}
                resizeMode="contain"
              />
              <View style={s.productInfo}>
                <Text style={s.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={s.productWeight}>{product.weight}</Text>
                <Text style={s.productPrice}>
                  {CURRENCY_SYMBOL}{product.price}
                </Text>
              </View>
              <View style={s.qtyControls}>
                <TouchableOpacity
                  style={s.qtyBtn}
                  onPress={() =>
                    item.qty <= 1
                      ? removeItem(item.product_id)
                      : updateItem(item.product_id, item.qty - 1)
                  }
                >
                  <Ionicons
                    name={item.qty <= 1 ? "trash-outline" : "remove"}
                    size={15}
                    color={BRAND_COLORS.blue}
                  />
                </TouchableOpacity>
                <Text style={s.qtyText}>{item.qty}</Text>
                <TouchableOpacity
                  style={s.qtyBtn}
                  onPress={() => updateItem(item.product_id, item.qty + 1)}
                >
                  <Ionicons name="add" size={15} color={BRAND_COLORS.blue} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListFooterComponent={() => (
          <View>
            {/* Promo code */}
            <View style={s.promoSection}>
              {appliedPromo ? (
                <View style={s.promoApplied}>
                  <Ionicons name="pricetag" size={16} color={BRAND_COLORS.success} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.promoAppliedCode}>{appliedPromo} applied</Text>
                    <Text style={s.promoAppliedDesc}>{promoData?.description}</Text>
                  </View>
                  <TouchableOpacity onPress={removePromo}>
                    <Ionicons name="close-circle" size={20} color={colors.subtext} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={s.promoRow}>
                  <Ionicons name="pricetag-outline" size={18} color={colors.subtext} />
                  <TextInput
                    style={s.promoInput}
                    placeholder="Promo code"
                    placeholderTextColor={colors.placeholder}
                    value={promoInput}
                    onChangeText={(t) => {
                      setPromoInput(t);
                      setPromoError("");
                    }}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity style={s.promoApplyBtn} onPress={applyPromo}>
                    <Text style={s.promoApplyText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              )}
              {promoError ? (
                <Text style={s.promoError}>{promoError}</Text>
              ) : null}
            </View>

            {/* Delivery instructions */}
            <TouchableOpacity
              style={s.instructionsToggle}
              onPress={() => setShowInstructions((v) => !v)}
            >
              <Ionicons name="chatbubble-outline" size={16} color={colors.subtext} />
              <Text style={s.instructionsToggleText}>
                {showInstructions ? "Hide" : "Add"} delivery instructions
              </Text>
              <Ionicons
                name={showInstructions ? "chevron-up" : "chevron-down"}
                size={14}
                color={colors.subtext}
              />
            </TouchableOpacity>
            {showInstructions && (
              <TextInput
                style={s.instructionsInput}
                placeholder="E.g. Leave at door, call before arriving…"
                placeholderTextColor={colors.placeholder}
                value={instructions}
                onChangeText={setInstructions}
                multiline
                maxLength={200}
              />
            )}

            {/* Bill summary */}
            <View style={s.billSection}>
              <Text style={s.billTitle}>Bill Details</Text>
              <BillRow label="Item Total" value={`${CURRENCY_SYMBOL}${cartTotal}`} colors={colors} />
              <BillRow
                label="Delivery Fee"
                value={deliveryFee === 0 ? "FREE" : `${CURRENCY_SYMBOL}${deliveryFee}`}
                valueColor={deliveryFee === 0 ? BRAND_COLORS.success : undefined}
                colors={colors}
              />
              {promoDiscount > 0 && (
                <BillRow
                  label={`Promo (${appliedPromo})`}
                  value={`- ${CURRENCY_SYMBOL}${promoDiscount}`}
                  valueColor={BRAND_COLORS.success}
                  colors={colors}
                />
              )}
              <View style={s.billDivider} />
              <View style={s.billTotalRow}>
                <Text style={s.billTotalLabel}>Grand Total</Text>
                <Text style={s.billTotalValue}>{CURRENCY_SYMBOL}{grandTotal}</Text>
              </View>
              {deliveryFee > 0 && (
                <Text style={s.freeDeliveryHint}>
                  Add {CURRENCY_SYMBOL}{DELIVERY_FREE_ABOVE - cartTotal} more for free delivery
                </Text>
              )}
            </View>

            {/* You may also like */}
            {(suggestionsData?.products ?? []).filter(
              (p) => !cartItems.some((c) => c.product_id === p.id)
            ).length > 0 && (
              <View style={s.upsellSection}>
                <View style={s.suggestHeader}>
                  <Text style={s.suggestTitle}>You may also like</Text>
                  <TouchableOpacity onPress={() => suggestCategory
                    ? navigation.navigate("Shop", { slug: suggestCategory.toLowerCase().replace(/ /g, "-") })
                    : navigation.navigate("Main")
                  }>
                    <Text style={s.seeAllText}>See all</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.upsellScroll}>
                  {(suggestionsData?.products ?? [])
                    .filter((p) => !cartItems.some((c) => c.product_id === p.id))
                    .slice(0, 8)
                    .map((product) => (
                      <View key={product.id} style={s.upsellCardWrapper}>
                        <ProductCard product={product} onPress={setSelectedProduct} />
                      </View>
                    ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Checkout bar */}
      <View style={s.checkoutBar}>
        <View>
          <Text style={s.checkoutTotal}>{CURRENCY_SYMBOL}{grandTotal}</Text>
          <Text style={s.checkoutSub}>Total incl. delivery</Text>
        </View>
        <TouchableOpacity
          style={[s.checkoutBtn, placing && { opacity: 0.7 }]}
          onPress={handleCheckout}
          disabled={placing}
        >
          {placing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.checkoutBtnText}>Proceed to Pay</Text>
          )}
        </TouchableOpacity>
      </View>

      <PaymentModal
        visible={paymentVisible}
        amount={grandTotal}
        onClose={() => setPaymentVisible(false)}
        onSuccess={handlePaymentSuccess}
      />
    </SafeAreaView>
  );
}

function BillRow({
  label,
  value,
  valueColor,
  colors,
}: {
  label: string;
  value: string;
  valueColor?: string;
  colors: ReturnType<typeof import("@/context/ThemeContext").useTheme>["colors"];
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
      <Text style={{ fontSize: 14, color: colors.subtext }}>{label}</Text>
      <Text style={{ fontSize: 14, color: valueColor ?? colors.text, fontWeight: "500" }}>
        {value}
      </Text>
    </View>
  );
}

const styles = (
  colors: ReturnType<typeof import("@/context/ThemeContext").useTheme>["colors"],
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerBar: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    headerTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
    etaBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: "#DCFCE7",
    },
    etaText: { fontSize: 13, color: "#15803D", fontWeight: "500" },
    listContent: { padding: 16 },
    cartItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 12,
      marginBottom: 10,
      gap: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    productImage: { width: 64, height: 64, borderRadius: 10 },
    productInfo: { flex: 1 },
    productName: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    productWeight: { fontSize: 11, color: colors.subtext, marginBottom: 4 },
    productPrice: { fontSize: 15, fontWeight: "700", color: colors.text },
    qtyControls: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: BRAND_COLORS.blue,
      borderRadius: 8,
      overflow: "hidden",
    },
    qtyBtn: { padding: 8, backgroundColor: "#EFF6FF" },
    qtyText: {
      paddingHorizontal: 10,
      fontSize: 14,
      fontWeight: "700",
      color: BRAND_COLORS.blue,
    },
    promoSection: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    promoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    promoInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      paddingVertical: 4,
    },
    promoApplyBtn: {
      backgroundColor: BRAND_COLORS.blue,
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 8,
    },
    promoApplyText: { color: "#fff", fontWeight: "700", fontSize: 13 },
    promoApplied: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    promoAppliedCode: {
      fontSize: 13,
      fontWeight: "700",
      color: BRAND_COLORS.success,
    },
    promoAppliedDesc: { fontSize: 11, color: colors.subtext },
    promoError: { fontSize: 12, color: BRAND_COLORS.red, marginTop: 6 },
    instructionsToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    instructionsToggleText: { flex: 1, fontSize: 14, color: colors.subtext },
    instructionsInput: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      fontSize: 14,
      color: colors.text,
      minHeight: 80,
      textAlignVertical: "top",
    },
    billSection: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginTop: 4,
      marginBottom: 8,
    },
    billTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 14,
    },
    billDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 10,
    },
    billTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    billTotalLabel: { fontSize: 15, fontWeight: "700", color: colors.text },
    billTotalValue: { fontSize: 16, fontWeight: "800", color: colors.text },
    freeDeliveryHint: {
      fontSize: 12,
      color: BRAND_COLORS.success,
      marginTop: 8,
      textAlign: "center",
    },
    checkoutBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    checkoutTotal: { fontSize: 18, fontWeight: "800", color: colors.text },
    checkoutSub: { fontSize: 11, color: colors.subtext },
    checkoutBtn: {
      backgroundColor: BRAND_COLORS.blue,
      borderRadius: 14,
      paddingHorizontal: 28,
      paddingVertical: 13,
    },
    checkoutBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    emptyHero: {
      alignItems: "center",
      paddingTop: 48,
      paddingBottom: 28,
      paddingHorizontal: 32,
    },
    emptyEmoji: { fontSize: 64, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 8 },
    emptySub: { fontSize: 14, color: colors.subtext, marginBottom: 24, textAlign: "center" },
    shopBtnRow: { flexDirection: "row", gap: 12 },
    actionBtn: {
      backgroundColor: BRAND_COLORS.blue,
      borderRadius: 14,
      paddingHorizontal: 24,
      paddingVertical: 13,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    browseBtn: {
      borderRadius: 14,
      paddingHorizontal: 20,
      paddingVertical: 13,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderWidth: 1.5,
      borderColor: BRAND_COLORS.blue,
    },
    browseBtnText: { color: BRAND_COLORS.blue, fontWeight: "700", fontSize: 15 },
    quickCatsSection: { paddingBottom: 8 },
    quickCatsScroll: { paddingHorizontal: 16, gap: 8 },
    quickCatChip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickCatText: { fontSize: 13, fontWeight: "600", color: colors.text },
    suggestSection: { paddingTop: 8 },
    suggestHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 10,
    },
    suggestTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    seeAllText: { fontSize: 13, color: BRAND_COLORS.blue, fontWeight: "600" },
    suggestGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 12,
      gap: 0,
    },
    suggestCardWrapper: { width: "50%" },
    upsellSection: { marginTop: 16, paddingBottom: 8 },
    upsellScroll: { paddingHorizontal: 16, gap: 10 },
    upsellCardWrapper: { width: 160 },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
    },
  });
