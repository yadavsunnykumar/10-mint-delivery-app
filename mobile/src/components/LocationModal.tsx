import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ExpoLocation from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import { useLocation } from "@/context/LocationContext";
import { getWarehouses } from "@/lib/api";
import { CITIES, BRAND_COLORS } from "@/lib/constants";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function LocationModal({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const { setLocation, location } = useLocation();
  const [detecting, setDetecting] = useState(false);
  const [expandedCity, setExpandedCity] = useState<string | null>(
    location?.city ?? "Kathmandu"
  );

  const { data: warehouses = [], isLoading: loadingWarehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getWarehouses,
    enabled: visible,
    staleTime: 0,
  });

  const detectLocation = async () => {
    setDetecting(true);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is needed to auto-detect your area."
        );
        setDetecting(false);
        return;
      }
      const pos = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;

      // Reverse geocode via Nominatim
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        { headers: { "User-Agent": "EverestDashApp/1.0" } }
      );
      const data = await resp.json();
      const suburb =
        data.address?.suburb ??
        data.address?.neighbourhood ??
        data.address?.quarter ??
        "Your Location";
      const city =
        data.address?.city ?? data.address?.town ?? "";

      // Check if detected city/suburb is within any covered delivery area
      const coveredCities = CITIES.map((c) => c.city.toLowerCase());
      const allAreaLabels = CITIES.flatMap((c) =>
        c.areas.map((a) => a.label.toLowerCase())
      );
      const warehouseAreas = warehouses.map((w) =>
        w.name.replace(/^Dark Store\s*[–-]\s*/i, "").trim().toLowerCase()
      );

      const cityMatches = coveredCities.includes(city.toLowerCase());
      const suburbMatches =
        allAreaLabels.some((l) => suburb.toLowerCase().includes(l) || l.includes(suburb.toLowerCase())) ||
        warehouseAreas.some((a) => suburb.toLowerCase().includes(a) || a.includes(suburb.toLowerCase()));

      if (!cityMatches && !suburbMatches) {
        Alert.alert(
          "Outside Delivery Zone",
          "We are yet to reach there. Our service is currently available in Kathmandu, Lalitpur, and Bhaktapur.",
          [{ text: "OK" }]
        );
        return;
      }

      setLocation({
        area: suburb,
        city: city || "Kathmandu",
        coords: { lat: latitude, lng: longitude },
      });
      onClose();
    } catch {
      Alert.alert("Error", "Could not detect location. Please select manually.");
    } finally {
      setDetecting(false);
    }
  };

  const s = styles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <TouchableOpacity style={s.backdrop} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.header}>
            <Text style={s.title}>Select Delivery Location</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Detect GPS */}
          <TouchableOpacity
            style={s.detectBtn}
            onPress={detectLocation}
            disabled={detecting}
          >
            {detecting ? (
              <ActivityIndicator size="small" color={BRAND_COLORS.blue} />
            ) : (
              <Ionicons name="locate" size={18} color={BRAND_COLORS.blue} />
            )}
            <Text style={s.detectText}>
              {detecting ? "Detecting…" : "Use my current location"}
            </Text>
          </TouchableOpacity>

          <Text style={s.orLabel}>— or choose area —</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {/* Delivery zones from database */}
            {loadingWarehouses ? (
              <View style={s.warehouseLoading}>
                <ActivityIndicator size="small" color={BRAND_COLORS.blue} />
                <Text style={s.warehouseLoadingText}>Loading delivery zones…</Text>
              </View>
            ) : warehouses.length > 0 && (
              <View>
                <View style={s.sectionHeader}>
                  <Ionicons name="storefront-outline" size={14} color={BRAND_COLORS.blue} />
                  <Text style={s.sectionHeaderText}>Active Delivery Zones</Text>
                </View>
                {warehouses.map((w) => {
                  const areaName = w.name.replace(/^Dark Store\s*[–-]\s*/i, "").trim();
                  const isSelected = location?.area === areaName;
                  return (
                    <TouchableOpacity
                      key={w.warehouse_id}
                      style={[s.areaItem, isSelected && s.areaItemSelected]}
                      onPress={() => {
                        setLocation({
                          area: areaName,
                          city: w.city ?? "Kathmandu",
                          coords: w.location,
                        });
                        onClose();
                      }}
                    >
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color={isSelected ? BRAND_COLORS.blue : colors.subtext}
                      />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={[s.areaLabel, isSelected && s.areaLabelSelected]}>
                          {areaName}
                        </Text>
                        <Text style={s.areaSub}>{w.address}</Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color={BRAND_COLORS.blue} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Manually defined city areas */}
            {CITIES.map((cityObj) => (
              <View key={cityObj.city}>
                <TouchableOpacity
                  style={s.cityHeader}
                  onPress={() =>
                    setExpandedCity(
                      expandedCity === cityObj.city ? null : cityObj.city
                    )
                  }
                >
                  <Text style={s.cityName}>{cityObj.city}</Text>
                  <Ionicons
                    name={
                      expandedCity === cityObj.city
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={18}
                    color={colors.subtext}
                  />
                </TouchableOpacity>

                {expandedCity === cityObj.city &&
                  cityObj.areas.map((area) => {
                    const isSelected = location?.area === area.label;
                    return (
                      <TouchableOpacity
                        key={area.label}
                        style={[s.areaItem, isSelected && s.areaItemSelected]}
                        onPress={() => {
                          setLocation({
                            area: area.label,
                            city: cityObj.city,
                            pincode: area.pincode,
                            coords: area.coords,
                          });
                          onClose();
                        }}
                      >
                        <Ionicons
                          name="location-outline"
                          size={16}
                          color={isSelected ? BRAND_COLORS.blue : colors.subtext}
                        />
                        <View style={{ marginLeft: 10 }}>
                          <Text
                            style={[
                              s.areaLabel,
                              isSelected && s.areaLabelSelected,
                            ]}
                          >
                            {area.label}
                          </Text>
                          <Text style={s.areaSub}>
                            {area.area} · {area.pincode}
                          </Text>
                        </View>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={BRAND_COLORS.blue}
                            style={{ marginLeft: "auto" }}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = (colors: ReturnType<typeof import("@/context/ThemeContext").useTheme>["colors"]) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      flex: 1,
      maxHeight: "85%",
      paddingBottom: 24,
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
    title: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
    },
    detectBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      margin: 16,
      padding: 14,
      backgroundColor: "#EFF6FF",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#BFDBFE",
    },
    detectText: {
      fontSize: 14,
      fontWeight: "600",
      color: BRAND_COLORS.blue,
    },
    orLabel: {
      textAlign: "center",
      fontSize: 12,
      color: colors.subtext,
      marginBottom: 8,
    },
    warehouseLoading: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 16,
    },
    warehouseLoadingText: {
      fontSize: 13,
      color: BRAND_COLORS.blue,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: "#EFF6FF",
    },
    sectionHeaderText: {
      fontSize: 12,
      fontWeight: "700",
      color: BRAND_COLORS.blue,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    cityHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.inputBg,
    },
    cityName: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    areaItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    areaItemSelected: {
      backgroundColor: "#EFF6FF",
    },
    areaLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
    },
    areaLabelSelected: {
      color: BRAND_COLORS.blue,
      fontWeight: "700",
    },
    areaSub: {
      fontSize: 11,
      color: colors.subtext,
    },
  });
