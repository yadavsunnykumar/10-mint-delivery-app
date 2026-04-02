import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  LayoutAnimation,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/context/ThemeContext";
import { BRAND_COLORS } from "@/lib/constants";

const FAQS = [
  {
    q: "How fast is delivery?",
    a: "We deliver in 10 minutes or less for most areas in Kathmandu Valley. Actual time may vary based on your location and order size.",
  },
  {
    q: "What are the delivery hours?",
    a: "We operate 7 AM to 11 PM, 365 days a year including public holidays.",
  },
  {
    q: "Is there a minimum order value?",
    a: "There is no minimum order value. However, orders above रू299 qualify for free delivery.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept UPI, Credit/Debit Cards, and Cash on Delivery.",
  },
  {
    q: "Can I track my order in real-time?",
    a: "Yes! Once your order is placed, you can track it live on a map including your rider's location and estimated arrival time.",
  },
  {
    q: "How do I cancel an order?",
    a: "You can cancel an order within 60 seconds of placing it. After that, please contact our support team.",
  },
  {
    q: "Are the products fresh?",
    a: "All fresh produce is sourced daily from local farms and markets. We guarantee freshness on every delivery.",
  },
  {
    q: "Do you deliver to my area?",
    a: "We currently serve Kathmandu, Lalitpur, and Bhaktapur. Check the location selector in the app for available delivery zones.",
  },
];

export default function FAQsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIdx(openIdx === i ? null : i);
  };

  const s = styles(colors);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>FAQs</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <Text style={s.intro}>Have questions? We have answers.</Text>

        {FAQS.map((faq, i) => (
          <TouchableOpacity
            key={i}
            style={s.faqItem}
            onPress={() => toggle(i)}
            activeOpacity={0.85}
          >
            <View style={s.faqHeader}>
              <Text style={s.faqQuestion}>{faq.q}</Text>
              <Ionicons
                name={openIdx === i ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.subtext}
              />
            </View>
            {openIdx === i && (
              <Text style={s.faqAnswer}>{faq.a}</Text>
            )}
          </TouchableOpacity>
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
    intro: { fontSize: 14, color: colors.subtext, marginBottom: 16 },
    faqItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
    },
    faqHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    faqQuestion: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      paddingRight: 8,
    },
    faqAnswer: {
      fontSize: 13,
      color: colors.subtext,
      lineHeight: 20,
      marginTop: 10,
    },
  });
