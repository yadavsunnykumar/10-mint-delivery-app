import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useQuery } from "@tanstack/react-query";
import { updateProfile, getUserOrders } from "@/lib/api";
import { BRAND_COLORS, APP_NAME, APP_VERSION } from "@/lib/constants";
import type { RootStackParamList } from "@/navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, isLoggedIn, openLoginModal, logout, updateUser } = useAuth();
  const { wishlist } = useWishlist();
  const navigation = useNavigation<Nav>();

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", user?.user_id],
    queryFn: () => getUserOrders(user!.user_id),
    enabled: !!user,
    staleTime: 60_000,
  });
  const deliveredCount = orders.filter((o) => o.order_status === "delivered").length;
  const activeCount = orders.filter((o) => !["delivered", "cancelled"].includes(o.order_status)).length;

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [altPhone, setAltPhone] = useState(user?.alt_phone ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile({ name, alt_phone: altPhone || null });
      updateUser(res.user);
      setEditing(false);
      Alert.alert("Saved", "Profile updated successfully.");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo access to change avatar.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      try {
        const res = await updateProfile({ avatar: base64 });
        updateUser(res.user);
      } catch (e: unknown) {
        Alert.alert("Error", "Failed to update avatar");
      }
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const s = styles(colors);

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.headerBar}>
          <Text style={s.headerTitle}>Profile</Text>
        </View>
        <View style={s.guestContainer}>
          <View style={s.guestAvatar}>
            <Ionicons name="person" size={40} color={colors.subtext} />
          </View>
          <Text style={s.guestTitle}>Welcome to Everest Dash</Text>
          <Text style={s.guestSub}>Login to manage your profile and orders</Text>
          <TouchableOpacity style={s.loginBtn} onPress={openLoginModal}>
            <Text style={s.loginBtnText}>Login / Sign up</Text>
          </TouchableOpacity>

          {/* Theme toggle even for guests */}
          <TouchableOpacity style={s.themeToggle} onPress={toggleTheme}>
            <Ionicons
              name={isDark ? "sunny-outline" : "moon-outline"}
              size={18}
              color={colors.text}
            />
            <Text style={s.themeToggleText}>
              {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.headerBar}>
        <Text style={s.headerTitle}>Profile</Text>
        <TouchableOpacity
          onPress={() => {
            if (editing) {
              setEditing(false);
              setName(user?.name ?? "");
              setAltPhone(user?.alt_phone ?? "");
            } else {
              setEditing(true);
            }
          }}
        >
          <Text style={s.editBtn}>{editing ? "Cancel" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar section */}
        <View style={s.avatarSection}>
          <TouchableOpacity onPress={handlePickAvatar} style={s.avatarWrapper}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={s.avatarImage} />
            ) : (
              <View style={s.avatarFallback}>
                <Text style={s.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={s.avatarEditBadge}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          {!editing && (
            <>
              <Text style={s.userName}>{user?.name}</Text>
              <Text style={s.userPhone}>{user?.phone}</Text>
            </>
          )}
        </View>

        {/* Stats row */}
        {!editing && (
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statValue}>{orders.length}</Text>
              <Text style={s.statLabel}>Total Orders</Text>
            </View>
            <View style={[s.statCard, s.statCardMiddle]}>
              <Text style={s.statValue}>{deliveredCount}</Text>
              <Text style={s.statLabel}>Delivered</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statValue}>{wishlist.length}</Text>
              <Text style={s.statLabel}>Wishlist</Text>
            </View>
          </View>
        )}

        {/* Edit form */}
        {editing && (
          <View style={s.editForm}>
            <Text style={s.formLabel}>Full Name</Text>
            <TextInput
              style={s.formInput}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.placeholder}
            />
            <Text style={s.formLabel}>Alternate Phone</Text>
            <TextInput
              style={s.formInput}
              value={altPhone}
              onChangeText={setAltPhone}
              placeholder="Alternate phone (optional)"
              placeholderTextColor={colors.placeholder}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={[s.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Menu items */}
        <View style={s.menuSection}>
          {[
            {
              icon: "receipt-outline",
              label: "My Orders",
              badge: activeCount > 0 ? String(activeCount) : undefined,
              onPress: () => navigation.navigate("Orders"),
            },
            {
              icon: "heart-outline",
              label: "Wishlist",
              badge: wishlist.length > 0 ? String(wishlist.length) : undefined,
              onPress: () => navigation.navigate("Wishlist"),
            },
            {
              icon: isDark ? "sunny-outline" : "moon-outline",
              label: isDark ? "Light Mode" : "Dark Mode",
              onPress: toggleTheme,
            },
            {
              icon: "information-circle-outline",
              label: "About Everest Dash",
              onPress: () => navigation.navigate("About"),
            },
            {
              icon: "help-circle-outline",
              label: "FAQs",
              onPress: () => navigation.navigate("FAQs"),
            },
            {
              icon: "mail-outline",
              label: "Contact Us",
              onPress: () => navigation.navigate("Contact"),
            },
            {
              icon: "document-text-outline",
              label: "Terms & Conditions",
              onPress: () => navigation.navigate("Terms"),
            },
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={s.menuItem} onPress={item.onPress}>
              <View style={s.menuIconWrapper}>
                <Ionicons name={item.icon as never} size={20} color={BRAND_COLORS.blue} />
              </View>
              <Text style={s.menuLabel}>{item.label}</Text>
              {(item as { badge?: string }).badge ? (
                <View style={s.menuBadge}>
                  <Text style={s.menuBadgeText}>{(item as { badge?: string }).badge}</Text>
                </View>
              ) : null}
              <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App version */}
        <Text style={s.versionText}>{APP_NAME} v{APP_VERSION}</Text>

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
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 22, fontWeight: "700", color: colors.text },
    editBtn: { fontSize: 14, color: BRAND_COLORS.blue, fontWeight: "600" },
    avatarSection: { alignItems: "center", paddingVertical: 28 },
    avatarWrapper: { position: "relative", marginBottom: 12 },
    avatarImage: { width: 88, height: 88, borderRadius: 44 },
    avatarFallback: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: BRAND_COLORS.blue,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitials: { fontSize: 32, fontWeight: "700", color: "#fff" },
    avatarEditBadge: {
      position: "absolute",
      bottom: 2,
      right: 2,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: BRAND_COLORS.blue,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.background,
    },
    userName: { fontSize: 20, fontWeight: "700", color: colors.text },
    userPhone: { fontSize: 14, color: colors.subtext, marginTop: 2 },
    editForm: { paddingHorizontal: 16, marginBottom: 16 },
    formLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.subtext,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    formInput: {
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
    saveBtn: {
      backgroundColor: BRAND_COLORS.blue,
      borderRadius: 12,
      paddingVertical: 13,
      alignItems: "center",
    },
    saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    menuSection: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      borderRadius: 14,
      overflow: "hidden",
      marginBottom: 16,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuIconWrapper: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    menuLabel: { flex: 1, fontSize: 14, color: colors.text, fontWeight: "500" },
    statsRow: {
      flexDirection: "row",
      marginHorizontal: 16,
      marginBottom: 16,
      gap: 10,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      alignItems: "center",
    },
    statCardMiddle: {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: colors.border,
    },
    statValue: { fontSize: 22, fontWeight: "800", color: BRAND_COLORS.blue, marginBottom: 2 },
    statLabel: { fontSize: 11, color: colors.subtext, fontWeight: "500" },
    menuBadge: {
      backgroundColor: BRAND_COLORS.blue,
      borderRadius: 10,
      paddingHorizontal: 7,
      paddingVertical: 2,
      marginRight: 6,
    },
    menuBadgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },
    versionText: {
      fontSize: 12,
      color: colors.subtext,
      textAlign: "center",
      paddingVertical: 8,
    },
    logoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.error,
    },
    logoutText: { fontSize: 15, color: colors.error, fontWeight: "600" },
    guestContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
    },
    guestAvatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.inputBg,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    guestTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 6 },
    guestSub: {
      fontSize: 14,
      color: colors.subtext,
      textAlign: "center",
      marginBottom: 24,
    },
    loginBtn: {
      backgroundColor: BRAND_COLORS.blue,
      borderRadius: 12,
      paddingHorizontal: 40,
      paddingVertical: 13,
      marginBottom: 24,
    },
    loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    themeToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 10,
    },
    themeToggleText: { fontSize: 14, color: colors.text },
  });
