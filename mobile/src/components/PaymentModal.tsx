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

export type PaymentMethod = "esewa" | "khalti" | "fonepay" | "cod" | "card" | "imepay";

interface PaymentMethodConfig {
  id: PaymentMethod;
  label: string;
  subtitle: string;
  icon: string;
  popular: boolean;
  color: string;
}

const PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: "esewa",   label: "eSewa",             subtitle: "Nepal's #1 digital wallet", icon: "phone-portrait-outline", popular: true,  color: "#60B246" },
  { id: "khalti",  label: "Khalti",            subtitle: "Fast & secure payments",    icon: "phone-portrait-outline", popular: true,  color: "#5C2D91" },
  { id: "fonepay", label: "FonePay QR",        subtitle: "Scan & pay instantly",      icon: "qr-code-outline",        popular: true,  color: "#E31E25" },
  { id: "cod",     label: "Cash on Delivery",  subtitle: "Pay when order arrives",    icon: "cash-outline",           popular: true,  color: "#16A34A" },
  { id: "imepay",  label: "IME Pay",           subtitle: "Digital remittance wallet", icon: "phone-portrait-outline", popular: false, color: "#F97316" },
  { id: "card",    label: "Debit / Credit Card",subtitle: "Visa, Mastercard accepted",icon: "card-outline",           popular: false, color: "#1E3A8A" },
];

interface Props {
  visible: boolean;
  amount: number;
  onClose: () => void;
  onSuccess: (method: PaymentMethod) => Promise<void>;
}

export default function PaymentModal({ visible, amount, onClose, onSuccess }: Props) {
  const { colors } = useTheme();
  const [method, setMethod] = useState<PaymentMethod>("esewa");
  const [upiId, setUpiId] = useState("");
  const [walletPhone, setWalletPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"select" | "processing" | "done">("select");
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setStep("select");
      setError("");
      setUpiId("");
      setWalletPhone("");
      setCardNumber("");
      setCardName("");
      setCardExpiry("");
      setCardCvv("");
    }
  }, [visible]);

  const isWallet = (m: PaymentMethod) => ["esewa", "khalti", "imepay"].includes(m);
  const isQr = (m: PaymentMethod) => m === "fonepay";

  const handlePay = async () => {
    setError("");
    if (isWallet(method) && !walletPhone.trim()) {
      setError(`Enter your registered ${PAYMENT_METHODS.find(p => p.id === method)?.label} phone number`);
      return;
    }
    if (method === "card") {
      if (cardNumber.replace(/\s/g, "").length < 16) { setError("Enter a valid 16-digit card number"); return; }
      if (!cardName.trim()) { setError("Enter the cardholder name"); return; }
    }
    setLoading(true);
    setStep("processing");
    try {
      await onSuccess(method);
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Payment failed. Please try again.");
      setStep("select");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("select");
    setError("");
    setWalletPhone("");
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCvv("");
    onClose();
  };

  const selectedConfig = PAYMENT_METHODS.find(p => p.id === method)!;
  const s = styles(colors);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={s.overlay}>
        <TouchableOpacity style={s.backdrop} onPress={handleClose} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.kavWrapper}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <View style={s.header}>
              <Text style={s.title}>Choose Payment</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {step === "processing" && (
              <View style={s.centeredContainer}>
                <ActivityIndicator size="large" color={BRAND_COLORS.blue} />
                <Text style={s.processingText}>Processing {selectedConfig.label} payment…</Text>
                <Text style={s.processingSubText}>Please do not close this screen</Text>
              </View>
            )}

            {step === "done" && (
              <View style={s.centeredContainer}>
                <View style={s.successCircle}>
                  <Ionicons name="checkmark" size={44} color="#fff" />
                </View>
                <Text style={s.successTitle}>Payment Successful!</Text>
                <Text style={s.successSub}>Your order has been placed. 🎉</Text>
                <Text style={s.successSub}>Delivering in ~10 minutes!</Text>
              </View>
            )}

            {step === "select" && (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Amount card */}
                <View style={s.amountCard}>
                  <View>
                    <Text style={s.amountLabel}>Total to pay</Text>
                    <Text style={s.amountNote}>Incl. delivery & packaging</Text>
                  </View>
                  <Text style={s.amount}>{CURRENCY_SYMBOL}{amount}</Text>
                </View>

                {error ? (
                  <View style={s.errorBox}>
                    <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
                    <Text style={s.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Popular methods */}
                <Text style={s.sectionTitle}>Popular in Nepal</Text>
                {PAYMENT_METHODS.filter(m => m.popular).map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[s.methodOption, method === m.id && { borderColor: m.color, backgroundColor: `${m.color}11` }]}
                    onPress={() => setMethod(m.id)}
                  >
                    <View style={[s.methodIconBox, { backgroundColor: `${m.color}22` }]}>
                      <Ionicons name={m.icon as never} size={20} color={m.color} />
                    </View>
                    <View style={s.methodTextBlock}>
                      <Text style={[s.methodLabel, method === m.id && { color: m.color }]}>{m.label}</Text>
                      <Text style={s.methodSubtitle}>{m.subtitle}</Text>
                    </View>
                    {method === m.id && (
                      <Ionicons name="checkmark-circle" size={20} color={m.color} style={{ marginLeft: "auto" }} />
                    )}
                  </TouchableOpacity>
                ))}

                {/* Other methods */}
                <Text style={[s.sectionTitle, { marginTop: 8 }]}>More Options</Text>
                {PAYMENT_METHODS.filter(m => !m.popular).map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[s.methodOption, method === m.id && { borderColor: m.color, backgroundColor: `${m.color}11` }]}
                    onPress={() => setMethod(m.id)}
                  >
                    <View style={[s.methodIconBox, { backgroundColor: `${m.color}22` }]}>
                      <Ionicons name={m.icon as never} size={20} color={m.color} />
                    </View>
                    <View style={s.methodTextBlock}>
                      <Text style={[s.methodLabel, method === m.id && { color: m.color }]}>{m.label}</Text>
                      <Text style={s.methodSubtitle}>{m.subtitle}</Text>
                    </View>
                    {method === m.id && (
                      <Ionicons name="checkmark-circle" size={20} color={m.color} style={{ marginLeft: "auto" }} />
                    )}
                  </TouchableOpacity>
                ))}

                {/* Wallet phone input */}
                {isWallet(method) && (
                  <View style={s.inputSection}>
                    <Text style={s.inputLabel}>Registered Phone Number</Text>
                    <TextInput
                      style={s.input}
                      placeholder={`Phone number linked to ${selectedConfig.label}`}
                      placeholderTextColor={colors.placeholder}
                      value={walletPhone}
                      onChangeText={setWalletPhone}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                    <Text style={s.inputHint}>
                      A payment request will be sent to your {selectedConfig.label} app
                    </Text>
                  </View>
                )}

                {/* FonePay QR note */}
                {isQr(method) && (
                  <View style={s.infoBox}>
                    <Ionicons name="qr-code-outline" size={28} color="#E31E25" />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.infoTitle, { color: "#E31E25" }]}>Scan QR Code</Text>
                      <Text style={s.infoText}>
                        After placing the order, a FonePay QR code will appear. Open your bank app and scan to pay.
                      </Text>
                    </View>
                  </View>
                )}

                {/* COD note */}
                {method === "cod" && (
                  <View style={s.infoBox}>
                    <Ionicons name="cash-outline" size={24} color={BRAND_COLORS.success} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.infoTitle, { color: BRAND_COLORS.success }]}>Pay on Delivery</Text>
                      <Text style={s.infoText}>
                        Keep {CURRENCY_SYMBOL}{amount} ready when your order arrives.
                        Our delivery partner accepts exact change.
                      </Text>
                    </View>
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
                        setCardNumber(clean.match(/.{1,4}/g)?.join(" ") ?? clean);
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

                <TouchableOpacity
                  style={[s.payBtn, { backgroundColor: selectedConfig.color }, loading && s.payBtnDisabled]}
                  onPress={handlePay}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name={selectedConfig.icon as never} size={18} color="#fff" />
                      <Text style={s.payBtnText}>
                        Pay {CURRENCY_SYMBOL}{amount} via {selectedConfig.label}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text style={s.secureNote}>🔒 Payments are 100% secure & encrypted</Text>
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
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "92%",
      paddingBottom: 32,
    },
    handle: {
      width: 36, height: 4, backgroundColor: colors.border,
      borderRadius: 2, alignSelf: "center", marginTop: 10,
    },
    header: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    title: { fontSize: 17, fontWeight: "700", color: colors.text },
    amountCard: {
      margin: 16, padding: 16, backgroundColor: "#EFF6FF",
      borderRadius: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    },
    amountLabel: { fontSize: 14, fontWeight: "600", color: BRAND_COLORS.blue },
    amountNote: { fontSize: 11, color: BRAND_COLORS.slate, marginTop: 2 },
    amount: { fontSize: 26, fontWeight: "800", color: BRAND_COLORS.blue },
    errorBox: {
      flexDirection: "row", alignItems: "center", gap: 6,
      marginHorizontal: 16, marginBottom: 8, padding: 10,
      backgroundColor: "#FEE2E2", borderRadius: 8,
    },
    errorText: { flex: 1, color: colors.error, fontSize: 12 },
    sectionTitle: {
      fontSize: 12, fontWeight: "700", color: colors.subtext,
      paddingHorizontal: 16, paddingBottom: 8, marginTop: 4,
      textTransform: "uppercase", letterSpacing: 0.6,
    },
    methodOption: {
      flexDirection: "row", alignItems: "center", gap: 12,
      marginHorizontal: 16, marginBottom: 8, padding: 13,
      borderRadius: 12, borderWidth: 1.5, borderColor: colors.border,
      backgroundColor: colors.card,
    },
    methodIconBox: {
      width: 38, height: 38, borderRadius: 10,
      alignItems: "center", justifyContent: "center",
    },
    methodTextBlock: { flex: 1 },
    methodLabel: { fontSize: 14, fontWeight: "600", color: colors.text },
    methodSubtitle: { fontSize: 11, color: colors.subtext, marginTop: 1 },
    inputSection: { paddingHorizontal: 16, paddingTop: 8 },
    inputLabel: { fontSize: 12, fontWeight: "600", color: colors.subtext, marginBottom: 6 },
    input: {
      borderWidth: 1, borderColor: colors.border, borderRadius: 10,
      paddingHorizontal: 12, paddingVertical: 11,
      fontSize: 14, color: colors.text, backgroundColor: colors.inputBg, marginBottom: 12,
    },
    inputHint: { fontSize: 11, color: colors.subtext, marginTop: -8, marginBottom: 12 },
    infoBox: {
      flexDirection: "row", alignItems: "flex-start", gap: 12,
      marginHorizontal: 16, marginTop: 8, padding: 14,
      backgroundColor: colors.inputBg, borderRadius: 12,
    },
    infoTitle: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
    infoText: { fontSize: 12, color: colors.subtext, lineHeight: 18 },
    payBtn: {
      margin: 16, borderRadius: 14, paddingVertical: 15,
      alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8,
    },
    payBtnDisabled: { opacity: 0.6 },
    payBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    secureNote: { textAlign: "center", fontSize: 11, color: colors.subtext, paddingBottom: 8 },
    centeredContainer: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 24 },
    processingText: { marginTop: 16, fontSize: 16, fontWeight: "600", color: colors.text },
    processingSubText: { marginTop: 6, fontSize: 13, color: colors.subtext },
    successCircle: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: BRAND_COLORS.success,
      alignItems: "center", justifyContent: "center", marginBottom: 16,
    },
    successTitle: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 8 },
    successSub: { fontSize: 14, color: colors.subtext, textAlign: "center", marginBottom: 4 },
  });
