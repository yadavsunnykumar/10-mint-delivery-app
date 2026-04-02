import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { APP_NAME, APP_TAGLINE, BRAND_COLORS } from "@/lib/constants";

export default function AboutScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const s = styles(colors);

  const features = [
    { icon: "time-outline", title: "10-Minute Delivery", desc: "Fastest grocery delivery in Kathmandu Valley" },
    { icon: "leaf-outline", title: "Fresh Products", desc: "Farm-fresh produce sourced directly from farmers" },
    { icon: "shield-checkmark-outline", title: "Quality Assured", desc: "Every product verified for freshness and quality" },
    { icon: "location-outline", title: "Wide Coverage", desc: "Covering all major areas across Kathmandu, Lalitpur, Bhaktapur" },
  ];

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>About Us</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[BRAND_COLORS.blue, BRAND_COLORS.blueLight]}
          style={s.heroBanner}
        >
          <Text style={s.heroEmoji}>🏔️</Text>
          <Text style={s.heroTitle}>{APP_NAME}</Text>
          <Text style={s.heroTagline}>{APP_TAGLINE}</Text>
        </LinearGradient>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Our Mission</Text>
          <Text style={s.bodyText}>
            Everest Dash is Nepal's fastest grocery delivery service, committed to
            delivering fresh groceries, daily essentials, and more to your doorstep
            in just 10 minutes.
          </Text>
          <Text style={s.bodyText}>
            We partner with local farmers and trusted brands to ensure you get the
            best quality products at the best prices, all while supporting the local
            economy.
          </Text>
        </View>

        <View style={s.featuresGrid}>
          {features.map((f, i) => (
            <View key={i} style={s.featureCard}>
              <View style={s.featureIcon}>
                <Ionicons name={f.icon as never} size={24} color={BRAND_COLORS.blue} />
              </View>
              <Text style={s.featureTitle}>{f.title}</Text>
              <Text style={s.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Our Story</Text>
          <Text style={s.bodyText}>
            Founded in 2024, Everest Dash was born out of a simple idea: why should
            getting groceries be a hassle? Our team of passionate engineers and
            logistics experts built a platform that makes grocery shopping as easy
            as a tap on your phone.
          </Text>
        </View>

        <View style={s.statsRow}>
          {[
            { num: "50K+", label: "Happy Customers" },
            { num: "10K+", label: "Products" },
            { num: "3", label: "Cities" },
            { num: "10 min", label: "Avg. Delivery" },
          ].map((stat, i) => (
            <View key={i} style={s.statItem}>
              <Text style={s.statNum}>{stat.num}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

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
    heroBanner: {
      alignItems: "center",
      paddingVertical: 40,
      paddingHorizontal: 24,
    },
    heroEmoji: { fontSize: 56, marginBottom: 10 },
    heroTitle: { fontSize: 28, fontWeight: "800", color: "#fff", marginBottom: 4 },
    heroTagline: { fontSize: 15, color: "rgba(255,255,255,0.8)" },
    section: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 10 },
    bodyText: { fontSize: 14, color: colors.subtext, lineHeight: 22, marginBottom: 10 },
    featuresGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 12,
      gap: 10,
    },
    featureCard: {
      width: "47%",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
    },
    featureIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    featureTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 4 },
    featureDesc: { fontSize: 12, color: colors.subtext, lineHeight: 17 },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      backgroundColor: colors.card,
      marginHorizontal: 16,
      borderRadius: 14,
      paddingVertical: 20,
    },
    statItem: { alignItems: "center" },
    statNum: { fontSize: 20, fontWeight: "800", color: BRAND_COLORS.blue },
    statLabel: { fontSize: 11, color: colors.subtext, marginTop: 2, textAlign: "center" },
  });
