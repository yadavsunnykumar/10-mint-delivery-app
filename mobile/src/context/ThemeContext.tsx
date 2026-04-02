import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof LIGHT_COLORS;
}

const LIGHT_COLORS = {
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  subtext: "#64748B",
  border: "#E2E8F0",
  primary: "#1E3A8A",
  primaryText: "#FFFFFF",
  accent: "#3B82F6",
  success: "#16A34A",
  error: "#DC2626",
  warning: "#F59E0B",
  inputBg: "#F1F5F9",
  tabBar: "#FFFFFF",
  headerBg: "#1E3A8A",
  headerText: "#FFFFFF",
  shadow: "#000000",
  placeholder: "#94A3B8",
  skeleton: "#E2E8F0",
};

const DARK_COLORS: typeof LIGHT_COLORS = {
  background: "#0F172A",
  card: "#1E293B",
  text: "#F1F5F9",
  subtext: "#94A3B8",
  border: "#334155",
  primary: "#3B82F6",
  primaryText: "#FFFFFF",
  accent: "#60A5FA",
  success: "#22C55E",
  error: "#EF4444",
  warning: "#FBBF24",
  inputBg: "#1E293B",
  tabBar: "#1E293B",
  headerBg: "#1E293B",
  headerText: "#F1F5F9",
  shadow: "#000000",
  placeholder: "#475569",
  skeleton: "#334155",
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemScheme === "dark" ? "dark" : "light");

  useEffect(() => {
    AsyncStorage.getItem("everest_theme").then((saved) => {
      if (saved === "dark" || saved === "light") setTheme(saved);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      AsyncStorage.setItem("everest_theme", next);
      return next;
    });
  }, []);

  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
