import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getUserOrders, cancelOrder, addToCart, Order } from "@/lib/api";
import {
  BRAND_COLORS,
  CURRENCY_SYMBOL,
  STATUS_COLORS,
  STATUS_BG_COLORS,
} from "@/lib/constants";
import { formatOrderStatus, formatDate } from "@/lib/utils";
import type { RootStackParamList } from "@/navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_STEPS = ["created", "accepted", "packed", "assigned", "en_route", "delivered"];

type FilterKey = "all" | "active" | "delivered" | "cancelled";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function OrderHistoryScreen() {
  const { colors } = useTheme();
  const { user, isLoggedIn, openLoginModal } = useAuth();
  const { addToCart: addToCartCtx } = useCart();
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["orders", user?.user_id],
    queryFn: () => getUserOrders(user!.user_id),
    enabled: !!user,
    staleTime: 30_000,
  });

  const filtered = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "active") return !["delivered", "cancelled"].includes(o.order_status);
    return o.order_status === filter;
  });

  const handleCancel = (orderId: string) => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "Keep", style: "cancel" },
      {
        text: "Cancel Order",
        style: "destructive",
        onPress: async () => {
          setCancellingId(orderId);
          try {
            await cancelOrder(orderId, "Customer requested cancellation");
            queryClient.invalidateQueries({ queryKey: ["orders"] });
          } catch (e: unknown) {
            Alert.alert("Error", e instanceof Error ? e.message : "Could not cancel");
          } finally {
            setCancellingId(null);
          }
        },
      },
    ]);
  };

  const handleReorder = async (order: Order) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    try {
      for (const item of order.items) {
        await addToCart(item.product_id, item.qty);
      }
      Alert.alert("Added to Cart", "Items added to your cart.", [
        { text: "View Cart", onPress: () => navigation.navigate("Cart") },
        { text: "OK" },
      ]);
    } catch {
      Alert.alert("Error", "Some items could not be added to cart.");
    }
  };

  const s = styles(colors);

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.headerBar}>
          <Text style={s.headerTitle}>My Orders</Text>
        </View>
        <View style={s.emptyContainer}>
          <Text style={s.emptyEmoji}>📦</Text>
          <Text style={s.emptyTitle}>Login to view orders</Text>
          <TouchableOpacity style={s.loginBtn} onPress={openLoginModal}>
            <Text style={s.loginBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.headerBar}>
          <Text style={s.headerTitle}>My Orders</Text>
        </View>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.blue} />
        </View>
      </SafeAreaView>
    );
  }

  const renderOrderCard = ({ item: order }: { item: Order }) => {
    const stepIdx = STATUS_STEPS.indexOf(order.order_status);
    const isActive = !["delivered", "cancelled"].includes(order.order_status);
    const canCancel = order.order_status === "created";
    const statusColor = STATUS_COLORS[order.order_status] ?? "#475569";
    const statusBg = STATUS_BG_COLORS[order.order_status] ?? "#F1F5F9";
    const isCancelling = cancellingId === order.order_id;

    return (
      <View style={s.orderCard}>
        <View style={s.orderHeader}>
          <View>
            <Text style={s.orderId}>
              #{order.order_id.slice(-6).toUpperCase()}
            </Text>
            <Text style={s.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[s.statusText, { color: statusColor }]}>
              {formatOrderStatus(order.order_status)}
            </Text>
          </View>
        </View>

        <View style={s.orderDetails}>
          <View style={s.detailRow}>
            <Ionicons name="bag-outline" size={14} color={colors.subtext} />
            <Text style={s.itemsText}>
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </Text>
          </View>
          {order.payment_method && (
            <View style={s.detailRow}>
              <Ionicons name="card-outline" size={14} color={colors.subtext} />
              <Text style={s.itemsText}>{order.payment_method.toUpperCase()}</Text>
            </View>
          )}
          <Text style={s.totalText}>
            {CURRENCY_SYMBOL}{order.total_amount}
          </Text>
        </View>

        {/* Progress tracker */}
        {order.order_status !== "cancelled" && (
          <View style={s.progressContainer}>
            {STATUS_STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <View
                  style={[
                    s.progressDot,
                    i <= stepIdx
                      ? { backgroundColor: BRAND_COLORS.blue }
                      : { backgroundColor: colors.border },
                  ]}
                />
                {i < STATUS_STEPS.length - 1 && (
                  <View
                    style={[
                      s.progressLine,
                      i < stepIdx
                        ? { backgroundColor: BRAND_COLORS.blue }
                        : { backgroundColor: colors.border },
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={s.actionsRow}>
          {isActive && (
            <TouchableOpacity
              style={[s.actionBtn, s.trackBtn]}
              onPress={() => navigation.navigate("TrackOrder", { orderId: order.order_id })}
            >
              <Ionicons name="navigate-outline" size={14} color={BRAND_COLORS.blue} />
              <Text style={[s.actionBtnText, { color: BRAND_COLORS.blue }]}>Track</Text>
            </TouchableOpacity>
          )}

          {(order.order_status === "delivered") && (
            <TouchableOpacity
              style={[s.actionBtn, s.reorderBtn]}
              onPress={() => handleReorder(order)}
            >
              <Ionicons name="refresh-outline" size={14} color={BRAND_COLORS.success} />
              <Text style={[s.actionBtnText, { color: BRAND_COLORS.success }]}>Reorder</Text>
            </TouchableOpacity>
          )}

          {canCancel && (
            <TouchableOpacity
              style={[s.actionBtn, s.cancelBtn]}
              onPress={() => handleCancel(order.order_id)}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color={BRAND_COLORS.red} />
              ) : (
                <>
                  <Ionicons name="close-outline" size={14} color={BRAND_COLORS.red} />
                  <Text style={[s.actionBtnText, { color: BRAND_COLORS.red }]}>Cancel</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.headerBar}>
        <Text style={s.headerTitle}>My Orders</Text>
        {orders.length > 0 && (
          <Text style={s.headerSub}>{orders.length} order{orders.length !== 1 ? "s" : ""}</Text>
        )}
      </View>

      {/* Filter chips */}
      <View style={s.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[s.filterChip, filter === f.key && s.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[s.filterChipText, filter === f.key && s.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filtered.length === 0 ? (
        <View style={s.emptyContainer}>
          <Text style={s.emptyEmoji}>📦</Text>
          <Text style={s.emptyTitle}>
            {filter === "all" ? "No orders yet" : `No ${filter} orders`}
          </Text>
          <Text style={s.emptySub}>
            {filter === "all" ? "Your order history will appear here" : `You have no ${filter} orders`}
          </Text>
          {filter === "all" && (
            <TouchableOpacity style={s.loginBtn} onPress={() => navigation.navigate("Main")}>
              <Text style={s.loginBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.order_id}
          contentContainerStyle={s.list}
          renderItem={renderOrderCard}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = (colors: ReturnType<typeof import("@/context/ThemeContext").useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerBar: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
    headerSub: { fontSize: 13, color: colors.subtext },
    filterContainer: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: BRAND_COLORS.blue,
      borderColor: BRAND_COLORS.blue,
    },
    filterChipText: { fontSize: 13, fontWeight: "500", color: colors.subtext },
    filterChipTextActive: { color: "#fff", fontWeight: "700" },
    loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
    emptyEmoji: { fontSize: 60, marginBottom: 14 },
    emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 8 },
    emptySub: { fontSize: 14, color: colors.subtext, marginBottom: 20, textAlign: "center" },
    loginBtn: {
      backgroundColor: BRAND_COLORS.blue,
      borderRadius: 12,
      paddingHorizontal: 32,
      paddingVertical: 13,
    },
    loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    list: { padding: 16 },
    orderCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 5,
      elevation: 2,
    },
    orderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
    },
    orderId: { fontSize: 15, fontWeight: "700", color: colors.text },
    orderDate: { fontSize: 12, color: colors.subtext, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 12, fontWeight: "600" },
    orderDetails: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
    },
    detailRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    itemsText: { fontSize: 12, color: colors.subtext },
    totalText: { marginLeft: "auto", fontSize: 15, fontWeight: "700", color: colors.text },
    progressContainer: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    progressDot: { width: 10, height: 10, borderRadius: 5 },
    progressLine: { flex: 1, height: 2 },
    actionsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    actionBtnText: { fontSize: 13, fontWeight: "600" },
    trackBtn: { borderColor: BRAND_COLORS.blue },
    reorderBtn: { borderColor: BRAND_COLORS.success },
    cancelBtn: { borderColor: BRAND_COLORS.red },
  });
