import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/context/ThemeContext";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import { aiSearch, fetchProducts, Product } from "@/lib/api";
import { BRAND_COLORS } from "@/lib/constants";
import type { RootStackParamList } from "@/navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteP = RouteProp<RootStackParamList, "SearchResults">;

type SortKey = "popular" | "price_asc" | "price_desc" | "rating";

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: "popular", label: "Popular", icon: "trending-up-outline" },
  { key: "price_asc", label: "Price: Low", icon: "arrow-up-outline" },
  { key: "price_desc", label: "Price: High", icon: "arrow-down-outline" },
  { key: "rating", label: "Top Rated", icon: "star-outline" },
];

export default function SearchResultsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const [query, setQuery] = useState(route.params?.query ?? "");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sort, setSort] = useState<SortKey>("popular");
  const [hasSearched, setHasSearched] = useState(false);

  const sortResults = (items: Product[], s: SortKey): Product[] => {
    const copy = [...items];
    switch (s) {
      case "price_asc": return copy.sort((a, b) => a.price - b.price);
      case "price_desc": return copy.sort((a, b) => b.price - a.price);
      case "rating": return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      default: return copy;
    }
  };

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      let data: Product[] = [];
      try {
        data = await aiSearch(q);
      } catch {}
      if (data.length === 0) {
        const res = await fetchProducts({ search: q });
        data = res.products;
      }
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) doSearch(query);
  }, []);

  const sorted = sortResults(results, sort);
  const s = styles(colors);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      {/* Search header */}
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={s.searchBox}>
          <Ionicons name="search" size={16} color={colors.subtext} />
          <TextInput
            style={s.searchInput}
            placeholder="Search groceries, snacks…"
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => doSearch(query)}
            autoFocus={!route.params?.query}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(""); setResults([]); setHasSearched(false); }}>
              <Ionicons name="close-circle" size={16} color={colors.subtext} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort chips — shown when results present */}
      {results.length > 0 && !loading && (
        <View style={s.sortContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.sortScroll}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[s.sortChip, sort === opt.key && s.sortChipActive]}
                onPress={() => setSort(opt.key)}
              >
                <Ionicons
                  name={opt.icon as never}
                  size={13}
                  color={sort === opt.key ? "#fff" : colors.subtext}
                />
                <Text style={[s.sortChipText, sort === opt.key && s.sortChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading && (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.blue} />
          <Text style={s.loadingText}>Searching for "{query}"…</Text>
        </View>
      )}

      {!loading && hasSearched && results.length === 0 && (
        <View style={s.emptyContainer}>
          <Text style={s.emptyEmoji}>🔍</Text>
          <Text style={s.emptyTitle}>No results for "{query}"</Text>
          <Text style={s.emptySub}>Try different keywords or check spelling</Text>
          <View style={s.suggestionsRow}>
            {["Vegetables", "Milk", "Snacks", "Rice"].map((s) => (
              <TouchableOpacity
                key={s}
                style={styles2.suggestionChip}
                onPress={() => { setQuery(s); doSearch(s); }}
              >
                <Text style={styles2.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {!loading && sorted.length > 0 && (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={s.grid}
          columnWrapperStyle={s.row}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <Text style={s.resultsCount}>
              {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
            </Text>
          )}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={setSelectedProduct} />
          )}
        />
      )}

      {!loading && !hasSearched && (
        <View style={s.emptyContainer}>
          <Text style={s.emptyEmoji}>🛍️</Text>
          <Text style={s.emptyTitle}>Find your groceries</Text>
          <Text style={s.emptySub}>Search by name, brand or category</Text>
        </View>
      )}

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </SafeAreaView>
  );
}

const styles = (colors: ReturnType<typeof import("@/context/ThemeContext").useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 8,
    },
    backBtn: { padding: 4 },
    searchBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 9,
      gap: 8,
    },
    searchInput: { flex: 1, fontSize: 14, color: colors.text },
    sortContainer: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sortScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    sortChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sortChipActive: { backgroundColor: BRAND_COLORS.blue, borderColor: BRAND_COLORS.blue },
    sortChipText: { fontSize: 12, fontWeight: "500", color: colors.subtext },
    sortChipTextActive: { color: "#fff", fontWeight: "700" },
    loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
    loadingText: { marginTop: 12, fontSize: 14, color: colors.subtext },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
    emptyEmoji: { fontSize: 56, marginBottom: 14 },
    emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 6 },
    emptySub: { fontSize: 14, color: colors.subtext, marginBottom: 20, textAlign: "center" },
    suggestionsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
    resultsCount: { fontSize: 13, color: colors.subtext, paddingHorizontal: 4, paddingBottom: 10 },
    grid: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 4 },
    row: { justifyContent: "space-between" },
  });

// Flat styles for suggestion chips (don't need color context)
const styles2 = StyleSheet.create({
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  suggestionText: { fontSize: 13, fontWeight: "600", color: BRAND_COLORS.blue },
});
