import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { BRAND_COLORS, CURRENCY_SYMBOL } from "@/lib/constants";

type PaymentMethod = "upi" | "card" | "cod";

interface Props {
  visible: boolean;
  amount: number;
  onClose: () => void;
  onSuccess: (method: PaymentMethod) => Promise<void>;
}

export default function PaymentModal({
  visible,
  amount,
  onClose,
  onSuccess,
}: Props) {
  const { colors } = useTheme();
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"select" | "processing" | "done">("select");
  const [error, setError] = useState("");

  // Reset all state whenever the modal is opened fresh
  useEffect(() => {
    if (visible) {
      setStep("select");
      setError("");
      setUpiId("");
      setCardNumber("");
      setCardName("");
      setCardExpiry("");
      setCardCvv("");
    }
  }, [visible]);

  const handlePay = async () => {
    setError("");
    if (method === "upi" && !upiId.trim()) {
      setError("Enter your UPI ID");
      return;
    }
    if (method === "card") {
      if (cardNumber.replace(/\s/g, "").length < 16) {
        setError("Enter valid card number");
        return;
      }
      if (!cardName.trim()) {
        setError("Enter cardholder name");
        return;
      }
    }
    setLoading(true);
    setStep("processing");
    try {
      await onSuccess(method);
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Payment failed");
      setStep("select");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("select");
    setError("");
    setUpiId("");
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCvv("");
    onClose();
  };

  const s = styles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={s.overlay}>
        <TouchableOpacity style={s.backdrop} onPress={handleClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={s.kavWrapper}
        >
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.header}>
            <Text style={s.title}>Payment</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {step === "processing" && (
            <View style={s.processingContainer}>
              <ActivityIndicator size="large" color={BRAND_COLORS.blue} />
              <Text style={s.processingText}>Processing payment…</Text>
            </View>
          )}

          {step === "done" && (
            <View style={s.processingContainer}>
              <View style={s.successCircle}>
                <Ionicons name="checkmark" size={40} color="#fff" />
              </View>
              <Text style={s.successTitle}>Payment Successful!</Text>
              <Text style={s.successSub}>
                Your order has been placed successfully.
              </Text>
            </View>
          )}

          {step === "select" && (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={s.amountCard}>
                <Text style={s.amountLabel}>Amount to pay</Text>
                <Text style={s.amount}>
                  {CURRENCY_SYMBOL}
                  {amount}
                </Text>
              </View>

              {error ? <Text style={s.error}>{error}</Text> : null}

              {/* Method picker */}
              <Text style={s.sectionTitle}>Choose Payment Method</Text>
              {(
                [
                  { id: "upi", label: "UPI", icon: "phone-portrait-outline" },
                  { id: "card", label: "Credit / Debit Card", icon: "card-outline" },
                  { id: "cod", label: "Cash on Delivery", icon: "cash-outline" },
                ] as { id: PaymentMethod; label: string; icon: string }[]
              ).map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[s.methodOption, method === m.id && s.methodSelected]}
                  onPress={() => setMethod(m.id)}
                >
                  <Ionicons
                    name={m.icon as never}
                    size={20}
                    color={method === m.id ? BRAND_COLORS.blue : colors.subtext}
                  />
                  <Text
                    style={[
                      s.methodLabel,
                      method === m.id && s.methodLabelSelected,
                    ]}
                  >
                    {m.label}
                  </Text>
                  {method === m.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={BRAND_COLORS.blue}
                      style={{ marginLeft: "auto" }}
                    />
                  )}
                </TouchableOpacity>
              ))}

              {/* UPI input */}
              {method === "upi" && (
                <View style={s.inputSection}>
                  <Text style={s.inputLabel}>UPI ID</Text>
                  <TextInput
                    style={s.input}
                    placeholder="yourname@upi"
                    placeholderTextColor={colors.placeholder}
                    value={upiId}
                    onChangeText={setUpiId}
                    autoCapitalize="none"
                  />
                </View>
              )}

              {/* Card inputs */}
              {method === "card" && (
                <View style={s.inputSection}>
                  <Text style={s.inputLabel}>Card Number</Text>
                  <TextInput
                    style={s.input}
                    placeholder="0000 0000 0000 0000"
                    placeholderTextColor={colors.placeholder}
                    keyboardType="number-pad"
                    maxLength={19}
                    value={cardNumber}
                    onChangeText={(t) => {
                      const clean = t.replace(/\D/g, "");
                      const formatted =
                        clean.match(/.{1,4}/g)?.join(" ") ?? clean;
                      setCardNumber(formatted);
                    }}
                  />
                  <Text style={s.inputLabel}>Cardholder Name</Text>
                  <TextInput
                    style={s.input}
                    placeholder="Name on card"
                    placeholderTextColor={colors.placeholder}
                    value={cardName}
                    onChangeText={setCardName}
                    autoCapitalize="words"
                  />
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.inputLabel}>Expiry</Text>
                      <TextInput
                        style={s.input}
                        placeholder="MM/YY"
                        placeholderTextColor={colors.placeholder}
                        keyboardType="number-pad"
                        maxLength={5}
                        value={cardExpiry}
                        onChangeText={(t) => {
                          const clean = t.replace(/\D/g, "");
                          if (clean.length <= 2) setCardExpiry(clean);
                          else setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
                        }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.inputLabel}>CVV</Text>
                      <TextInput
                        style={s.input}
                        placeholder="•••"
                        placeholderTextColor={colors.placeholder}
                        keyboardType="number-pad"
                        maxLength={3}
                        secureTextEntry
                        value={cardCvv}
                        onChangeText={setCardCvv}
                      />
                    </View>
                  </View>
                </View>
              )}

              {method === "cod" && (
                <View style={s.codNote}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.subtext} />
                  <Text style={s.codNoteText}>
                    Pay {CURRENCY_SYMBOL}
                    {amount} in cash when your order arrives.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[s.payBtn, loading && s.payBtnDisabled]}
                onPress={handlePay}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.payBtnText}>
                    Pay {CURRENCY_SYMBOL}
                    {amount}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = (colors: ReturnType<typeof import("@/context/ThemeContext").useTheme>["colors"]) =>
  StyleSheet.create({
    overlay: { flex: 1, justifyContent: "flex-end" },
    kavWrapper: { width: "100%" },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "90%",
      paddingBottom: 32,
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginTop: 10,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { fontSize: 17, fontWeight: "700", color: colors.text },
    amountCard: {
      margin: 16,
      padding: 16,
      backgroundColor: "#EFF6FF",
      borderRadius: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    amountLabel: { fontSize: 13, color: BRAND_COLORS.blue },
    amount: { fontSize: 22, fontWeight: "800", color: BRAND_COLORS.blue },
    error: { marginHorizontal: 16, marginBottom: 8, color: colors.error, fontSize: 12 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.subtext,
      paddingHorizontal: 16,
      paddingBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    methodOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginHorizontal: 16,
      marginBottom: 8,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    methodSelected: {
      borderColor: BRAND_COLORS.blue,
      backgroundColor: "#EFF6FF",
    },
    methodLabel: { fontSize: 14, color: colors.text, fontWeight: "500" },
    methodLabelSelected: { color: BRAND_COLORS.blue, fontWeight: "700" },
    inputSection: { paddingHorizontal: 16, paddingTop: 12 },
    inputLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.subtext,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 11,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.inputBg,
      marginBottom: 12,
    },
    codNote: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      margin: 16,
      padding: 14,
      backgroundColor: colors.inputBg,
      borderRadius: 10,
    },
    codNoteText: { flex: 1, fontSize: 13, color: colors.subtext },
    payBtn: {
      margin: 16,
      backgroundColor: BRAND_COLORS.blue,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    payBtnDisabled: { opacity: 0.6 },
    payBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    processingContainer: {
      alignItems: "center",
      paddingVertical: 60,
      paddingHorizontal: 24,
    },
    processingText: { marginTop: 16, fontSize: 15, color: colors.subtext },
    successCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: BRAND_COLORS.success,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    successTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 6 },
    successSub: { fontSize: 14, color: colors.subtext, textAlign: "center" },
  });
