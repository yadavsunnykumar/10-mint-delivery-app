import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/context/ThemeContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import { Product } from "@/lib/api";
import { BRAND_COLORS } from "@/lib/constants";
import type { RootStackParamList } from "@/navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function WishlistScreen() {
  const { colors } = useTheme();
  const { wishlist, clearWishlist } = useWishlist();
  const { isLoggedIn, openLoginModal } = useAuth();
  const navigation = useNavigation<Nav>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const s = styles(colors);

  const handleClearAll = () => {
    Alert.alert("Clear Wishlist", "Remove all items from your wishlist?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear All", style: "destructive", onPress: clearWishlist },
    ]);
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Wishlist</Text>
        </View>
        <View style={s.emptyContainer}>
          <Text style={s.emptyEmoji}>❤️</Text>
          <Text style={s.emptyTitle}>Login to view wishlist</Text>
          <Text style={s.emptySub}>Save products you love</Text>
          <TouchableOpacity style={s.actionBtn} onPress={openLoginModal}>
            <Text style={s.actionBtnText}>Login / Sign up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Wishlist</Text>
        {wishlist.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={s.clearBtn}>
            <Text style={s.clearBtnText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      {wishlist.length === 0 ? (
        <View style={s.emptyContainer}>
          <Text style={s.emptyEmoji}>🤍</Text>
          <Text style={s.emptyTitle}>Your wishlist is empty</Text>
          <Text style={s.emptySub}>Tap the heart on any product to save it here</Text>
          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate("Main")}>
            <Text style={s.actionBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={s.grid}
          columnWrapperStyle={s.row}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <Text style={s.count}>
              {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved
            </Text>
          )}
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
    backBtn: { padding: 4 },
    headerTitle: { flex: 1, fontSize: 20, fontWeight: "700", color: colors.text },
    clearBtn: { padding: 4 },
    clearBtnText: { fontSize: 13, color: BRAND_COLORS.red, fontWeight: "600" },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
    emptyEmoji: { fontSize: 56, marginBottom: 14 },
    emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 6 },
    emptySub: { fontSize: 14, color: colors.subtext, marginBottom: 24, textAlign: "center" },
    actionBtn: {
      backgroundColor: BRAND_COLORS.blue,
      borderRadius: 12,
      paddingHorizontal: 32,
      paddingVertical: 13,
    },
    actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    count: { fontSize: 13, color: colors.subtext, paddingHorizontal: 4, paddingBottom: 10 },
    grid: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 4 },
    row: { justifyContent: "space-between" },
  });
