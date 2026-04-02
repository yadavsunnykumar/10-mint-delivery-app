import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/context/ThemeContext";
import { ALL_CATEGORIES, BRAND_COLORS } from "@/lib/constants";
import type { RootStackParamList } from "@/navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();

  const s = styles(colors);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.headerBar}>
        <Text style={s.headerTitle}>All Categories</Text>
      </View>

      <FlatList
        data={ALL_CATEGORIES}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.categoryCard}
            onPress={() => navigation.navigate("Shop", { slug: item.slug })}
            activeOpacity={0.8}
          >
            <View style={s.emojiContainer}>
              <Text style={s.emoji}>{item.emoji}</Text>
            </View>
            <View style={s.cardInfo}>
              <Text style={s.cardName}>{item.name}</Text>
              <Text style={s.cardDesc} numberOfLines={1}>
                {item.desc}
              </Text>
              <Text style={s.cardCount}>{item.count} products</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = (colors: ReturnType<typeof import("@/context/ThemeContext").useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerBar: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 22, fontWeight: "700", color: colors.text },
    list: { padding: 12 },
    categoryCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      gap: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
    emojiContainer: {
      width: 54,
      height: 54,
      borderRadius: 14,
      backgroundColor: colors.inputBg,
      alignItems: "center",
      justifyContent: "center",
    },
    emoji: { fontSize: 28 },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 2 },
    cardDesc: { fontSize: 12, color: colors.subtext, marginBottom: 3 },
    cardCount: { fontSize: 11, color: BRAND_COLORS.blue, fontWeight: "600" },
  });
