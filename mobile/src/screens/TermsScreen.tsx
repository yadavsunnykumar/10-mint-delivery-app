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
import { useTheme } from "@/context/ThemeContext";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By using Everest Dash, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our service.",
  },
  {
    title: "2. Use of Service",
    body: "Everest Dash provides an on-demand grocery delivery service. You must be 18 years or older to create an account and place orders. You are responsible for maintaining the confidentiality of your account credentials.",
  },
  {
    title: "3. Orders & Payment",
    body: "All orders are subject to availability. We reserve the right to cancel orders due to stock unavailability or pricing errors. Payment is processed at the time of checkout.",
  },
  {
    title: "4. Delivery",
    body: "Delivery times are estimates only. Actual delivery times may vary based on location, weather, and demand. We are not liable for delays beyond our reasonable control.",
  },
  {
    title: "5. Returns & Refunds",
    body: "If you receive a damaged or incorrect item, please contact us within 24 hours of delivery. We will arrange a replacement or refund at our discretion.",
  },
  {
    title: "6. Privacy",
    body: "Your personal information is collected and used as described in our Privacy Policy. We do not sell your data to third parties.",
  },
  {
    title: "7. Changes to Terms",
    body: "We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.",
  },
  {
    title: "8. Contact",
    body: "For any queries regarding these terms, contact us at support@everestdash.np",
  },
];

export default function TermsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const s = styles(colors);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Terms & Conditions</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <Text style={s.lastUpdated}>Last updated: January 2024</Text>

        {SECTIONS.map((sec, i) => (
          <View key={i} style={s.section}>
            <Text style={s.sectionTitle}>{sec.title}</Text>
            <Text style={s.sectionBody}>{sec.body}</Text>
          </View>
        ))}

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
    content: { padding: 16 },
    lastUpdated: { fontSize: 12, color: colors.subtext, marginBottom: 20 },
    section: { marginBottom: 18 },
    sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 6 },
    sectionBody: { fontSize: 14, color: colors.subtext, lineHeight: 22 },
  });
