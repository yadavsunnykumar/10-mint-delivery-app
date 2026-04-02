import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import { fetchProducts, Product } from "@/lib/api";
import { getShopCategoryBySlug } from "@/lib/categories";
import { BRAND_COLORS } from "@/lib/constants";
import type { RootStackParamList } from "@/navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteP = RouteProp<RootStackParamList, "Shop">;

export default function ShopScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const { slug } = route.params;
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<
    "default" | "price_asc" | "price_desc" | "rating"
  >("default");

  const category = getShopCategoryBySlug(slug);
  const backendCategory = category?.backendCategory ?? null;

  const { data, isLoading } = useQuery({
    queryKey: ["products", "shop", slug],
    queryFn: () =>
      fetchProducts(backendCategory ? { category: backendCategory } : {}),
    staleTime: 60_000,
  });
  const products = data?.products ?? [];

  const sorted = [...products].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    return 0;
  });

  const s = styles(colors);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>
            {category?.emoji} {category?.name ?? slug}
          </Text>
          {!isLoading && (
            <Text style={s.productCount}>{sorted.length} products</Text>
          )}
        </View>
      </View>

      {/* Sort options */}
      <View style={s.sortRow}>
        {(
          [
            { key: "default", label: "Default" },
            { key: "price_asc", label: "Price ↑" },
            { key: "price_desc", label: "Price ↓" },
            { key: "rating", label: "Top Rated" },
          ] as { key: typeof sortBy; label: string }[]
        ).map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[s.sortChip, sortBy === opt.key && s.sortChipActive]}
            onPress={() => setSortBy(opt.key)}
          >
            <Text
              style={[
                s.sortChipText,
                sortBy === opt.key && s.sortChipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.blue} />
        </View>
      ) : sorted.length === 0 ? (
        <View style={s.emptyContainer}>
          <Text style={s.emptyEmoji}>📦</Text>
          <Text style={s.emptyTitle}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={s.grid}
          columnWrapperStyle={s.row}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={setSelectedProduct} />
          )}
        />
      )}

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </SafeAreaView>
  );
}

const styles = (
  colors: ReturnType<
    typeof import("@/context/ThemeContext").useTheme
  >["colors"],
) =>
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
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
    productCount: { fontSize: 12, color: colors.subtext },
    sortRow: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
    },
    sortChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sortChipActive: {
      backgroundColor: BRAND_COLORS.blue,
      borderColor: BRAND_COLORS.blue,
    },
    sortChipText: { fontSize: 12, color: colors.subtext, fontWeight: "500" },
    sortChipTextActive: { color: "#fff", fontWeight: "600" },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyEmoji: { fontSize: 56, marginBottom: 12 },
    emptyTitle: { fontSize: 16, color: colors.subtext },
    grid: { paddingHorizontal: 16, paddingBottom: 100 },
    row: { justifyContent: "space-between" },
  });
