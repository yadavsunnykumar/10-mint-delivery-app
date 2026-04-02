import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as api from "@/lib/api";
import { useCart } from "./CartContext";

interface User {
  user_id: string;
  name: string;
  phone: string;
  alt_phone?: string;
  avatar?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  login: (token: string, userData: User) => Promise<void>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
  loginModalOpen: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { refreshCart, clearCart } = useCart();

  // Load persisted user on mount
  useEffect(() => {
    AsyncStorage.getItem("everest_user").then((saved) => {
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {}
      }
    });
  }, []);

  useEffect(() => {
    if (user) refreshCart();
  }, [user, refreshCart]);

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);

  const login = useCallback(async (token: string, userData: User) => {
    await AsyncStorage.setItem("everest_token", token);
    await AsyncStorage.setItem("everest_user", JSON.stringify(userData));
    setUser(userData);
    setLoginModalOpen(false);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem("everest_token");
    await AsyncStorage.removeItem("everest_user");
    setUser(null);
    clearCart();
  }, [clearCart]);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      AsyncStorage.setItem("everest_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        openLoginModal,
        closeLoginModal,
        logout,
        updateUser,
        loginModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Export the login handler so LoginModal can call it
export function useAuthLogin() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  // We expose a way to set user from outside (LoginModal uses this)
  return ctx;
}
