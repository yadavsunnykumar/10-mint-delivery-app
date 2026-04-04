import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp, RouteProp } from "@react-navigation/native-stack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { useTheme } from "@/context/ThemeContext";
import { getOrderTracking, cancelOrder } from "@/lib/api";
import {
  BRAND_COLORS,
  CURRENCY_SYMBOL,
  SOCKET_URL,
  STATUS_BG_COLORS,
  STATUS_COLORS,
} from "@/lib/constants";
import { formatOrderStatus } from "@/lib/utils";
import type { RootStackParamList } from "@/navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteP = RouteProp<RootStackParamList, "TrackOrder">;

const STATUS_STEPS = [
  { key: "created", label: "Order Placed", icon: "receipt-outline" },
  { key: "accepted", label: "Accepted", icon: "checkmark-circle-outline" },
  { key: "packed", label: "Packed", icon: "cube-outline" },
  { key: "assigned", label: "Rider Assigned", icon: "bicycle-outline" },
  { key: "en_route", label: "On the Way", icon: "navigate-outline" },
  { key: "delivered", label: "Delivered", icon: "home-outline" },
];

export default function TrackOrderScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const { orderId } = route.params;
  const mapRef = useRef<MapView>(null);
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState(false);
  // ETA countdown
  const [etaDisplay, setEtaDisplay] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: tracking, refetch, isLoading } = useQuery({
    queryKey: ["tracking", orderId],
    queryFn: () => getOrderTracking(orderId),
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  // ETA countdown timer
  useEffect(() => {
    if (tracking?.eta_minutes != null && tracking.eta_minutes > 0) {
      setEtaDisplay(tracking.eta_minutes);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setEtaDisplay((prev) => {
          if (prev == null || prev <= 1) {
            clearInterval(countdownRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 60_000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [tracking?.eta_minutes]);

  // Socket.io for real-time updates
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socket.emit("join_order", orderId);
    socket.on("order_update", () => refetch());
    socket.on(`order-${orderId}`, () => refetch());
    return () => {
      socket.emit("leave_order", orderId);
      socket.disconnect();
    };
  }, [orderId, refetch]);

  const handleCancel = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "Keep Order", style: "cancel" },
        {
          text: "Cancel Order",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelOrder(orderId, "Customer requested cancellation");
              queryClient.invalidateQueries({ queryKey: ["tracking", orderId] });
              queryClient.invalidateQueries({ queryKey: ["orders"] });
              Alert.alert("Cancelled", "Your order has been cancelled.");
            } catch (e: unknown) {
              Alert.alert("Error", e instanceof Error ? e.message : "Could not cancel order");
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  const s = styles(colors);

  if (isLoading) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Track Order</Text>
        </View>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.blue} />
          <Text style={s.loadingText}>Loading tracking info…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tracking) return null;

  const stepIdx = STATUS_STEPS.findIndex((s) => s.key === tracking.order_status);
  const isDelivered = tracking.order_status === "delivered";
  const isCancelled = tracking.order_status === "cancelled";
  const canCancel = tracking.order_status === "created";

  const mapRegion = {
    latitude: tracking.user_location.lat,
    longitude: tracking.user_location.lng,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Track Order</Text>
          <Text style={s.headerSub}>
            #{orderId.slice(-6).toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map */}
        <View style={s.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={s.map}
            initialRegion={mapRegion}
          >
            {/* User location marker */}
            <Marker
              coordinate={{
                latitude: tracking.user_location.lat,
                longitude: tracking.user_location.lng,
              }}
              title="Your Location"
            >
              <View style={s.homeMarker}>
                <Ionicons name="home" size={16} color="#fff" />
              </View>
            </Marker>

            {/* Warehouse marker */}
            {tracking.warehouse_location && (
              <Marker
                coordinate={{
                  latitude: tracking.warehouse_location.lat,
                  longitude: tracking.warehouse_location.lng,
                }}
                title={tracking.warehouse_name ?? "Store"}
              >
                <View style={s.storeMarker}>
                  <Ionicons name="storefront" size={16} color="#fff" />
                </View>
              </Marker>
            )}

            {/* Rider marker */}
            {tracking.rider?.current_location && (
              <Marker
                coordinate={{
                  latitude: tracking.rider.current_location.lat,
                  longitude: tracking.rider.current_location.lng,
                }}
                title={`Rider: ${tracking.rider.name}`}
              >
                <View style={s.riderMarker}>
                  <Text style={{ fontSize: 20 }}>🛵</Text>
                </View>
              </Marker>
            )}

            {/* Route line */}
            {tracking.warehouse_location && (
              <Polyline
                coordinates={[
                  {
                    latitude: tracking.warehouse_location.lat,
                    longitude: tracking.warehouse_location.lng,
                  },
                  {
                    latitude: tracking.user_location.lat,
                    longitude: tracking.user_location.lng,
                  },
                ]}
                strokeColor={BRAND_COLORS.blue}
                strokeWidth={3}
                lineDashPattern={[8, 4]}
              />
            )}
          </MapView>
        </View>

        {/* Status card */}
        <View style={s.statusCard}>
          {isCancelled ? (
            <View style={s.deliveredBox}>
              <Text style={s.deliveredEmoji}>❌</Text>
              <Text style={[s.deliveredTitle, { color: BRAND_COLORS.red }]}>Order Cancelled</Text>
              <Text style={s.deliveredSub}>
                {tracking.cancellation_reason ?? "Your order was cancelled."}
              </Text>
            </View>
          ) : isDelivered ? (
            <View style={s.deliveredBox}>
              <Text style={s.deliveredEmoji}>🎉</Text>
              <Text style={s.deliveredTitle}>Delivered!</Text>
              <Text style={s.deliveredSub}>Your order was delivered successfully.</Text>
            </View>
          ) : (
            <>
              <View style={s.etaRow}>
                <View>
                  <Text style={s.etaLabel}>Estimated Arrival</Text>
                  <Text style={s.etaValue}>
                    {etaDisplay != null ? `~${etaDisplay} min` : "—"}
                  </Text>
                </View>
                <View
                  style={[
                    s.statusBadge,
                    { backgroundColor: STATUS_BG_COLORS[tracking.order_status] ?? "#F1F5F9" },
                  ]}
                >
                  <Text
                    style={[
                      s.statusBadgeText,
                      { color: STATUS_COLORS[tracking.order_status] ?? "#475569" },
                    ]}
                  >
                    {formatOrderStatus(tracking.order_status)}
                  </Text>
                </View>
              </View>

              {/* Rider info */}
              {tracking.rider && (
                <View style={s.riderCard}>
                  <View style={s.riderIcon}>
                    <Text style={{ fontSize: 22 }}>🛵</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.riderName}>{tracking.rider.name}</Text>
                    {tracking.rider.vehicle_number && (
                      <Text style={s.riderVehicle}>{tracking.rider.vehicle_number}</Text>
                    )}
                  </View>
                  {tracking.rider.phone && (
                    <TouchableOpacity
                      style={s.callBtn}
                      onPress={() => Linking.openURL(`tel:${tracking.rider!.phone}`)}
                    >
                      <Ionicons name="call" size={14} color={BRAND_COLORS.blue} />
                      <Text style={s.callBtnText}>Call</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Cancel order button */}
              {canCancel && (
                <TouchableOpacity
                  style={s.cancelBtn}
                  onPress={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <ActivityIndicator size="small" color={BRAND_COLORS.red} />
                  ) : (
                    <>
                      <Ionicons name="close-circle-outline" size={16} color={BRAND_COLORS.red} />
                      <Text style={s.cancelBtnText}>Cancel Order</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Progress steps */}
          <View style={s.stepsContainer}>
            {STATUS_STEPS.map((step, i) => {
              const done = i <= stepIdx;
              const current = i === stepIdx;
              return (
                <View key={step.key} style={s.stepRow}>
                  <View style={s.stepLeft}>
                    <View
                      style={[
                        s.stepCircle,
                        done
                          ? { backgroundColor: BRAND_COLORS.blue }
                          : { backgroundColor: colors.border },
                      ]}
                    >
                      <Ionicons
                        name={step.icon as never}
                        size={14}
                        color={done ? "#fff" : colors.subtext}
                      />
                    </View>
                    {i < STATUS_STEPS.length - 1 && (
                      <View
                        style={[
                          s.stepLine,
                          {
                            backgroundColor:
                              i < stepIdx ? BRAND_COLORS.blue : colors.border,
                          },
                        ]}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      s.stepLabel,
                      current && { color: BRAND_COLORS.blue, fontWeight: "700" },
                      !done && { color: colors.subtext },
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Order summary */}
        {tracking.items && tracking.items.length > 0 && (
          <View style={s.orderSummary}>
            <Text style={s.summaryTitle}>Order Summary</Text>
            {tracking.items.map((item, i) => (
              <View key={i} style={s.summaryItem}>
                <Text style={s.summaryItemName} numberOfLines={1}>
                  {item.name ?? item.product_id}
                </Text>
                <Text style={s.summaryItemQty}>x{item.qty}</Text>
                {item.price && (
                  <Text style={s.summaryItemPrice}>
                    {CURRENCY_SYMBOL}
                    {item.price * item.qty}
                  </Text>
                )}
              </View>
            ))}
            {tracking.total_amount && (
              <View style={[s.summaryItem, s.summaryTotal]}>
                <Text style={s.summaryTotalLabel}>Total</Text>
                <Text style={s.summaryTotalValue}>
                  {CURRENCY_SYMBOL}
                  {tracking.total_amount}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (colors: ReturnType<typeof import("@/context/ThemeContext").useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
    headerSub: { fontSize: 12, color: colors.subtext },
    loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
    loadingText: { marginTop: 12, fontSize: 14, color: colors.subtext },
    mapContainer: { height: 260, margin: 16, borderRadius: 16, overflow: "hidden" },
    map: { flex: 1 },
    homeMarker: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#16A34A",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "#fff",
    },
    storeMarker: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: BRAND_COLORS.blue,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "#fff",
    },
    riderMarker: { alignItems: "center", justifyContent: "center" },
    statusCard: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    etaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    etaLabel: { fontSize: 12, color: colors.subtext },
    etaValue: { fontSize: 28, fontWeight: "800", color: colors.text },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    statusBadgeText: { fontSize: 13, fontWeight: "600" },
    riderCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      backgroundColor: colors.inputBg,
      borderRadius: 10,
      marginBottom: 14,
    },
    riderIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    riderName: { fontSize: 14, fontWeight: "600", color: colors.text },
    riderVehicle: { fontSize: 12, color: colors.subtext },
    callBtn: {
      marginLeft: "auto",
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: BRAND_COLORS.blue,
    },
    callBtnText: { fontSize: 12, color: BRAND_COLORS.blue, fontWeight: "600" },
    stepsContainer: { marginTop: 4 },
    stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
    stepLeft: { alignItems: "center" },
    stepCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    stepLine: { width: 2, height: 28, marginTop: 2 },
    stepLabel: { fontSize: 13, fontWeight: "500", color: colors.text, paddingTop: 7 },
    cancelBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: 12,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: BRAND_COLORS.red,
    },
    cancelBtnText: { fontSize: 14, fontWeight: "600", color: BRAND_COLORS.red },
    deliveredBox: { alignItems: "center", paddingVertical: 20 },
    deliveredEmoji: { fontSize: 56, marginBottom: 10 },
    deliveredTitle: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 4 },
    deliveredSub: { fontSize: 14, color: colors.subtext },
    orderSummary: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    summaryTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 10 },
    summaryItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 8,
    },
    summaryItemName: { flex: 1, fontSize: 13, color: colors.text },
    summaryItemQty: { fontSize: 13, color: colors.subtext },
    summaryItemPrice: { fontSize: 13, fontWeight: "600", color: colors.text },
    summaryTotal: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 10,
      marginTop: 4,
    },
    summaryTotalLabel: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.text },
    summaryTotalValue: { fontSize: 15, fontWeight: "700", color: colors.text },
  });
