import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as api from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { BRAND_COLORS, APP_NAME, APP_TAGLINE } from "@/lib/constants";

const OTP_RESEND_SECONDS = 30;

interface User {
  user_id: string;
  name: string;
  phone: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onLogin: (token: string, user: User) => void;
}

export default function LoginModal({ visible, onClose, onLogin }: Props) {
  const { colors } = useTheme();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown after OTP sent
  const startResendTimer = () => {
    setResendTimer(OTP_RESEND_SECONDS);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const reset = () => {
    setStep("phone");
    setPhone("");
    setOtp("");
    setName("");
    setIsNewUser(false);
    setError("");
    setLoading(false);
    setResendTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const fullPhone = `+977${cleaned}`;
      const res = await api.sendOtp(fullPhone);
      setIsNewUser(res.is_new_user);
      // Dev: auto-fill OTP returned from server
      if (res.otp) setOtp(res.otp);
      setStep("otp");
      startResendTimer();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    await handleSendOtp();
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setError("Enter the 4-digit OTP");
      return;
    }
    if (isNewUser && !name.trim()) {
      setError("Please enter your name to continue");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.verifyOtp(
        `+977${phone}`,
        otp,
        isNewUser ? name.trim() : undefined,
      );
      onLogin(res.token, res.user);
      reset();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const s = styles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={s.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <TouchableWithoutFeedback>
              <View style={s.card}>
                {/* Brand header */}
                <View style={s.brandRow}>
                  <View style={s.logoBox}>
                    <Ionicons name="flash" size={22} color="#fff" />
                  </View>
                  <View>
                    <Text style={s.brandName}>{APP_NAME}</Text>
                    <Text style={s.brandTagline}>{APP_TAGLINE}</Text>
                  </View>
                </View>

                <Text style={s.title}>
                  {step === "phone" ? "Login / Sign up" : isNewUser ? "Create Account" : "Verify OTP"}
                </Text>
                <Text style={s.subtitle}>
                  {step === "phone"
                    ? "Enter your number to get started"
                    : `Code sent to +977 ${phone}`}
                </Text>

                {!!error && (
                  <View style={s.errorBox}>
                    <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
                    <Text style={s.errorText}>{error}</Text>
                  </View>
                )}

                {step === "phone" ? (
                  <>
                    <View style={s.phoneRow}>
                      <View style={s.countryCode}>
                        <Text style={s.countryCodeText}>🇳🇵 +977</Text>
                      </View>
                      <TextInput
                        style={s.phoneInput}
                        placeholder="98XXXXXXXX"
                        placeholderTextColor={colors.placeholder}
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={phone}
                        onChangeText={(t) => setPhone(t.replace(/\D/g, ""))}
                        onSubmitEditing={handleSendOtp}
                        autoFocus
                      />
                    </View>
                    <TouchableOpacity
                      style={[s.btn, (loading || phone.length < 10) && s.btnDisabled]}
                      onPress={handleSendOtp}
                      disabled={loading || phone.length < 10}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={s.btnText}>Send OTP</Text>
                      )}
                    </TouchableOpacity>
                    <Text style={s.terms}>
                      By continuing, you agree to our Terms & Privacy Policy
                    </Text>
                  </>
                ) : (
                  <>
                    {isNewUser && (
                      <TextInput
                        style={s.input}
                        placeholder="Your full name *"
                        placeholderTextColor={colors.placeholder}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        autoFocus
                      />
                    )}
                    <TextInput
                      style={[s.input, s.otpInput]}
                      placeholder="• • • •"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="number-pad"
                      maxLength={4}
                      value={otp}
                      onChangeText={(t) => setOtp(t.replace(/\D/g, ""))}
                      onSubmitEditing={handleVerifyOtp}
                      autoFocus={!isNewUser}
                    />
                    <TouchableOpacity
                      style={[s.btn, (loading || otp.length < 4) && s.btnDisabled]}
                      onPress={handleVerifyOtp}
                      disabled={loading || otp.length < 4}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={s.btnText}>Verify & Continue</Text>
                      )}
                    </TouchableOpacity>

                    <View style={s.resendRow}>
                      {resendTimer > 0 ? (
                        <Text style={s.resendWait}>
                          Resend OTP in {resendTimer}s
                        </Text>
                      ) : (
                        <TouchableOpacity onPress={handleResendOtp}>
                          <Text style={s.resendLink}>Resend OTP</Text>
                        </TouchableOpacity>
                      )}
                      <Text style={s.dot}> · </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setStep("phone");
                          setError("");
                          setOtp("");
                        }}
                      >
                        <Text style={s.resendLink}>Change number</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = (colors: ReturnType<typeof import("@/context/ThemeContext").useTheme>["colors"]) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      width: "100%",
      maxWidth: 380,
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 20,
    },
    logoBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: BRAND_COLORS.blue,
      alignItems: "center",
      justifyContent: "center",
    },
    brandName: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
    },
    brandTagline: {
      fontSize: 11,
      color: colors.subtext,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 13,
      color: colors.subtext,
      marginBottom: 20,
    },
    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#FEE2E2",
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
    },
    errorText: {
      fontSize: 12,
      color: colors.error,
      flex: 1,
    },
    phoneRow: {
      flexDirection: "row",
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 14,
    },
    countryCode: {
      paddingHorizontal: 12,
      paddingVertical: 14,
      backgroundColor: colors.inputBg,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      justifyContent: "center",
    },
    countryCodeText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "600",
    },
    phoneInput: {
      flex: 1,
      paddingHorizontal: 14,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.card,
    },
    input: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 15,
      color: colors.text,
      backgroundColor: colors.inputBg,
      marginBottom: 12,
    },
    otpInput: {
      textAlign: "center",
      fontSize: 28,
      fontWeight: "700",
      letterSpacing: 12,
    },
    btn: {
      backgroundColor: BRAND_COLORS.blue,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    btnDisabled: { opacity: 0.5 },
    btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    terms: {
      fontSize: 11,
      color: colors.subtext,
      textAlign: "center",
      marginTop: 12,
    },
    resendRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 14,
    },
    resendWait: { fontSize: 13, color: colors.subtext },
    resendLink: { fontSize: 13, color: BRAND_COLORS.blue, fontWeight: "600" },
    dot: { fontSize: 13, color: colors.subtext },
  });
