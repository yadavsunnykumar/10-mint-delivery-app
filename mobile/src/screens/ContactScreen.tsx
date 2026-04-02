import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/context/ThemeContext";
import { BRAND_COLORS } from "@/lib/constants";

export default function ContactScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }
    setSending(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    Alert.alert(
      "Message Sent",
      "Thank you! We will get back to you within 24 hours.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  const s = styles(colors);

  const contacts = [
    { icon: "mail-outline", label: "support@everestdash.np" },
    { icon: "call-outline", label: "+977-01-XXXX-XXX" },
    { icon: "time-outline", label: "Mon–Sun: 7 AM – 11 PM" },
    { icon: "location-outline", label: "Thamel, Kathmandu, Nepal" },
  ];

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Contact Us</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        {contacts.map((c, i) => (
          <View key={i} style={s.contactRow}>
            <View style={s.contactIcon}>
              <Ionicons name={c.icon as never} size={20} color={BRAND_COLORS.blue} />
            </View>
            <Text style={s.contactText}>{c.label}</Text>
          </View>
        ))}

        <View style={s.separator} />

        <Text style={s.formTitle}>Send us a message</Text>

        <Text style={s.inputLabel}>Your Name</Text>
        <TextInput
          style={s.input}
          placeholder="Full name"
          placeholderTextColor={colors.placeholder}
          value={name}
          onChangeText={setName}
        />

        <Text style={s.inputLabel}>Email</Text>
        <TextInput
          style={s.input}
          placeholder="your@email.com"
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={s.inputLabel}>Message</Text>
        <TextInput
          style={[s.input, s.textarea]}
          placeholder="How can we help you?"
          placeholderTextColor={colors.placeholder}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[s.submitBtn, sending && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.submitBtnText}>Send Message</Text>
          )}
        </TouchableOpacity>

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
    contactRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    contactIcon: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },
    contactText: { fontSize: 14, color: colors.text },
    separator: { height: 1, backgroundColor: colors.border, marginVertical: 20 },
    formTitle: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: 16 },
    inputLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.subtext,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 11,
      fontSize: 15,
      color: colors.text,
      backgroundColor: colors.inputBg,
      marginBottom: 14,
    },
    textarea: { height: 110, paddingTop: 11 },
    submitBtn: {
      backgroundColor: BRAND_COLORS.blue,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  });
