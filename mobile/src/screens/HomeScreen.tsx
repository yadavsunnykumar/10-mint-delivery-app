import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";
import PromoBanners from "@/components/PromoBanners";
import ProductSection from "@/components/ProductSection";
import LocationModal from "@/components/LocationModal";
import { BRAND_COLORS, SECTION_CATEGORIES } from "@/lib/constants";
import { GRID_CATEGORIES } from "@/lib/categories";
import type { RootStackParamList } from "@/navigation/AppNavigator";
import { useQueryClient } from "@tanstack/react-query";
import { estimateEta } from "@/lib/api";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { user, isLoggedIn, openLoginModal } = useAuth();
  const { cartCount } = useCart();
  const { location, locationModalOpen, openLocationModal, closeLocationModal } =
    useLocation();
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [etaMin, setEtaMin] = useState<number | null>(null);

  // Fetch live ETA when location changes
  useEffect(() => {
    if (location?.coords) {
      estimateEta(location.coords.lat, location.coords.lng)
        .then((res) => setEtaMin(res.eta_minutes))
        .catch(() => setEtaMin(null));
    }
  }, [location?.coords?.lat, location?.coords?.lng]);

  const handleSearch = () => {
    if (searchText.trim()) {
      navigation.navigate("SearchResults", { query: searchText.trim() });
      setSearchText("");
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    setRefreshing(false);
  }, [queryClient]);

  const s = styles(colors);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_COLORS.blue} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.locationBtn} onPress={openLocationModal}>
          <Ionicons name="location-sharp" size={16} color="#fff" />
          <View>
            <Text style={s.locationLabel}>Deliver to</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={s.locationArea} numberOfLines={1}>
                {location?.area ?? "Select Location"}
              </Text>
              <Ionicons name="chevron-down" size={12} color="rgba(255,255,255,0.8)" />
            </View>
          </View>
        </TouchableOpacity>

        <View style={s.headerActions}>
          {isLoggedIn ? (
            <TouchableOpacity
              style={s.avatarBtn}
              onPress={() => navigation.navigate("Profile")}
            >
              <Text style={s.avatarText}>
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.loginBtn} onPress={openLoginModal}>
              <Text style={s.loginBtnText}>Login</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={s.cartBtn}
            onPress={() => navigation.navigate("Cart")}
          >
            <Ionicons name="bag-outline" size={22} color="#fff" />
            {cartCount > 0 && (
              <View style={s.cartBadge}>
                <Text style={s.cartBadgeText}>{cartCount > 9 ? "9+" : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={s.searchContainer}>
        <TouchableOpacity style={s.searchBar} onPress={handleSearch} activeOpacity={1}>
          <Ionicons name="search" size={18} color={colors.subtext} />
          <TextInput
            style={s.searchInput}
            placeholder="Search for groceries, snacks…"
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND_COLORS.blue} />
        }
      >
        {/* Delivery ETA strip */}
        <View style={s.etaStrip}>
          <View style={s.etaLeft}>
            <Ionicons name="flash" size={14} color={BRAND_COLORS.success} />
            <Text style={s.etaTextGreen}>
              {etaMin != null ? `Delivery in ~${etaMin} min` : "Delivery in ~10 min"}
            </Text>
          </View>
          {location?.area && (
            <View style={s.etaRight}>
              <Ionicons name="location-outline" size={12} color={colors.subtext} />
              <Text style={s.etaAreaText} numberOfLines={1}>
                {location.area}
              </Text>
            </View>
          )}
        </View>

        {/* Promo banners */}
        <PromoBanners />

        {/* Category quick-access grid */}
        <View style={s.gridSection}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Shop by Category</Text>
          </View>
          <FlatList
            data={GRID_CATEGORIES}
            keyExtractor={(item) => item.slug}
            numColumns={5}
            scrollEnabled={false}
            contentContainerStyle={s.gridContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.gridItem}
                onPress={() => navigation.navigate("Shop", { slug: item.slug })}
              >
                <View style={s.gridIconBg}>
                  <Text style={s.gridEmoji}>{item.emoji}</Text>
                </View>
                <Text style={s.gridLabel} numberOfLines={2}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* All product sections */}
        {SECTION_CATEGORIES.map((sec) => (
          <ProductSection
            key={sec.key}
            title={sec.title}
            category={sec.key}
            onSeeAll={
              sec.slug
                ? () => navigation.navigate("Shop", { slug: sec.slug! })
                : undefined
            }
          />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <LocationModal visible={locationModalOpen} onClose={closeLocationModal} />
    </SafeAreaView>
  );
}

const styles = (colors: ReturnType<typeof import("@/context/ThemeContext").useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: BRAND_COLORS.blue },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    locationBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex: 1,
    },
    locationLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)" },
    locationArea: {
      fontSize: 15,
      fontWeight: "700",
      color: "#fff",
      maxWidth: 170,
    },
    headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatarBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontSize: 15, fontWeight: "700", color: "#fff" },
    loginBtn: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 8,
    },
    loginBtnText: { fontSize: 13, fontWeight: "600", color: "#fff" },
    cartBtn: { position: "relative", padding: 4 },
    cartBadge: {
      position: "absolute",
      top: -2,
      right: -4,
      backgroundColor: "#EF4444",
      borderRadius: 9,
      minWidth: 18,
      height: 18,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 3,
    },
    cartBadgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },
    searchContainer: { paddingHorizontal: 16, paddingBottom: 14 },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 11,
      gap: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    searchInput: { flex: 1, fontSize: 14, color: "#0F172A" },
    scroll: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    etaStrip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 11,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    etaLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    etaTextGreen: {
      fontSize: 12,
      fontWeight: "600",
      color: BRAND_COLORS.success,
    },
    etaRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    etaAreaText: {
      fontSize: 12,
      color: colors.subtext,
      maxWidth: 130,
    },
    gridSection: { marginBottom: 8, paddingTop: 4 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      marginBottom: 12,
      marginTop: 12,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
    },
    gridContainer: { paddingHorizontal: 12 },
    gridItem: { flex: 1, alignItems: "center", paddingVertical: 6 },
    gridIconBg: {
      width: 54,
      height: 54,
      borderRadius: 16,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    gridEmoji: { fontSize: 26 },
    gridLabel: {
      fontSize: 10,
      color: colors.text,
      textAlign: "center",
      fontWeight: "500",
      lineHeight: 13,
    },
  });
