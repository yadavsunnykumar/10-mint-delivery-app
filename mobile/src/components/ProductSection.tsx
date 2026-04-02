import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import { fetchProducts, Product } from "@/lib/api";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";

interface Props {
  title: string;
  category: string;
  onSeeAll?: () => void;
}

export default function ProductSection({ title, category, onSeeAll }: Props) {
  const { colors } = useTheme();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", category],
    queryFn: () => fetchProducts({ category }),
    staleTime: 60_000,
  });
  const products = data?.products ?? [];

  if (isLoading) {
    return (
      <View style={styles(colors).loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!products.length) return null;

  const s = styles(colors);

  return (
    <View style={s.section}>
      <View style={s.header}>
        <Text style={s.title}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={s.seeAll}>See all</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={products.slice(0, 10)}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={setSelectedProduct} />
        )}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </View>
  );
}

const styles = (
  colors: ReturnType<
    typeof import("@/context/ThemeContext").useTheme
  >["colors"],
) =>
  StyleSheet.create({
    section: {
      marginBottom: 20,
    },
    loadingContainer: {
      height: 200,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    title: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
    },
    seeAll: {
      fontSize: 13,
      color: colors.accent,
      fontWeight: "600",
    },
    list: {
      paddingHorizontal: 16,
      gap: 10,
    },
  });
