import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal";
import { BRAND_COLORS } from "@/lib/constants";

// Screens
import HomeScreen from "@/screens/HomeScreen";
import CartScreen from "@/screens/CartScreen";
import CategoriesScreen from "@/screens/CategoriesScreen";
import OrderHistoryScreen from "@/screens/OrderHistoryScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import SearchResultsScreen from "@/screens/SearchResultsScreen";
import ShopScreen from "@/screens/ShopScreen";
import TrackOrderScreen from "@/screens/TrackOrderScreen";
import AboutScreen from "@/screens/AboutScreen";
import FAQsScreen from "@/screens/FAQsScreen";
import ContactScreen from "@/screens/ContactScreen";
import TermsScreen from "@/screens/TermsScreen";
import WishlistScreen from "@/screens/WishlistScreen";

// ── Type declarations ─────────────────────────────────────────────────────────

export type RootStackParamList = {
  Main: undefined;
  SearchResults: { query?: string };
  Shop: { slug: string };
  TrackOrder: { orderId: string };
  About: undefined;
  FAQs: undefined;
  Contact: undefined;
  Terms: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
  Wishlist: undefined;
};

export type TabParamList = {
  Home: undefined;
  Categories: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ── Bottom Tab Navigator ──────────────────────────────────────────────────────

function MainTabs() {
  const { colors } = useTheme();
  const { cartCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          height: 56,
          paddingBottom: 4,
          paddingTop: 4,
        },
        tabBarActiveTintColor: BRAND_COLORS.blue,
        tabBarInactiveTintColor: colors.subtext,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home-outline";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Categories") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "CartTab") {
            iconName = focused ? "bag" : "bag-outline";
            // Show badge
            if (cartCount > 0) {
              return (
                <View>
                  <Ionicons name={iconName} size={size} color={color} />
                  <View style={badgeStyles.badge}>
                    <Text style={badgeStyles.badgeText}>
                      {cartCount > 9 ? "9+" : cartCount}
                    </Text>
                  </View>
                </View>
              );
            }
          } else if (route.name === "OrdersTab") {
            iconName = focused ? "receipt" : "receipt-outline";
          } else if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name="Categories" component={CategoriesScreen} options={{ title: "Shop" }} />
      <Tab.Screen name="CartTab" component={CartScreen} options={{ title: "Cart" }} />
      <Tab.Screen name="OrdersTab" component={OrderHistoryScreen} options={{ title: "Orders" }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}

// ── Root Stack Navigator ──────────────────────────────────────────────────────

export default function AppNavigator() {
  const { colors } = useTheme();
  const { loginModalOpen, closeLoginModal, login } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
        <Stack.Screen name="Shop" component={ShopScreen} />
        <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Orders" component={OrderHistoryScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="FAQs" component={FAQsScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="Wishlist" component={WishlistScreen} />
      </Stack.Navigator>
      <LoginModal
        visible={loginModalOpen}
        onClose={closeLoginModal}
        onLogin={login}
      />
    </NavigationContainer>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
});
