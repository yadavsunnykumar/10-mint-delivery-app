import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/context/ThemeContext";
import { PROMO_BANNERS, BRAND_COLORS } from "@/lib/constants";
import type { RootStackParamList } from "@/navigation/AppNavigator";

const { width: SCREEN_W } = Dimensions.get("window");
const BANNER_W = SCREEN_W - 32;

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function PromoBanners() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const scrollRef = useRef<ScrollView>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (active + 1) % PROMO_BANNERS.length;
      scrollRef.current?.scrollTo({ x: next * (BANNER_W + 12), animated: true });
      setActive(next);
    }, 4000);
    return () => clearInterval(interval);
  }, [active]);

  const s = styles(colors);

  return (
    <View style={s.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_W + 12}
        decelerationRate="fast"
        contentContainerStyle={s.scrollContent}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(
            e.nativeEvent.contentOffset.x / (BANNER_W + 12),
          );
          setActive(Math.max(0, Math.min(idx, PROMO_BANNERS.length - 1)));
        }}
      >
        {PROMO_BANNERS.map((promo) => (
          <TouchableOpacity
            key={promo.id}
            activeOpacity={0.9}
            onPress={() => {
              if (promo.slug) navigation.navigate("Shop", { slug: promo.slug });
            }}
          >
            <LinearGradient
              colors={promo.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.banner}
            >
              <View style={s.bannerContent}>
                <Text style={s.emoji}>{promo.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.bannerTitle}>{promo.title}</Text>
                  <Text style={s.bannerSub}>{promo.subtitle}</Text>
                </View>
                {promo.slug && (
                  <View style={s.shopNowBadge}>
                    <Text style={s.shopNowText}>Shop →</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dot indicators */}
      <View style={s.dots}>
        {PROMO_BANNERS.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              scrollRef.current?.scrollTo({ x: i * (BANNER_W + 12), animated: true });
              setActive(i);
            }}
          >
            <View style={[s.dot, i === active && s.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = (colors: ReturnType<typeof import("@/context/ThemeContext").useTheme>["colors"]) =>
  StyleSheet.create({
    container: { marginBottom: 20 },
    scrollContent: { paddingHorizontal: 16, gap: 12 },
    banner: {
      width: BANNER_W,
      height: 126,
      borderRadius: 18,
      justifyContent: "center",
      padding: 20,
    },
    bannerContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    emoji: { fontSize: 44 },
    bannerTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: "#fff",
      marginBottom: 3,
    },
    bannerSub: {
      fontSize: 12,
      color: "rgba(255,255,255,0.88)",
      lineHeight: 16,
    },
    shopNowBadge: {
      backgroundColor: "rgba(255,255,255,0.25)",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    shopNowText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#fff",
    },
    dots: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
      marginTop: 10,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
    },
    dotActive: {
      backgroundColor: BRAND_COLORS.blue,
      width: 18,
    },
  });

