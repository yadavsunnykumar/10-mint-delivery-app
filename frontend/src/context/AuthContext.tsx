import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import * as api from "@/lib/api";
import { useCart } from "./CartContext";

interface User {
  user_id: string;
  name: string;
  phone: string;
}

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  logout: () => void;
  loginModalOpen: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("zepto_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { refreshCart, clearCart } = useCart();

  useEffect(() => {
    if (user) refreshCart();
  }, [user, refreshCart]);

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem("zepto_token", token);
    localStorage.setItem("zepto_user", JSON.stringify(userData));
    setUser(userData);
    setLoginModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("zepto_token");
    localStorage.removeItem("zepto_user");
    setUser(null);
    clearCart();
  }, [clearCart]);

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        openLoginModal,
        closeLoginModal,
        logout,
        loginModalOpen,
      }}
    >
      {children}
      {loginModalOpen && (
        <LoginModal onLogin={login} onClose={closeLoginModal} />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// ── Login Modal ───────────────────────────────────────────────────────────────

function LoginModal({
  onLogin,
  onClose,
}: {
  onLogin: (token: string, user: User) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter valid 10-digit phone number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.sendOtp(phone);
      setIsNewUser(res.is_new_user);
      // Dev: auto-fill OTP if returned
      if (res.otp) setOtp(res.otp);
      setStep("otp");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setError("Enter the OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.verifyOtp(phone, otp, isNewUser ? name : undefined);
      onLogin(res.token, res.user);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-foreground mb-1">
          {step === "phone" ? "Login / Sign up" : "Enter OTP"}
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          {step === "phone"
            ? "Get groceries delivered in 10 minutes"
            : `OTP sent to +91 ${phone}`}
        </p>

        {error && <p className="text-xs text-destructive mb-3">{error}</p>}

        {step === "phone" ? (
          <>
            <div className="flex items-center border border-border rounded-lg overflow-hidden mb-4">
              <span className="px-3 py-2.5 text-sm text-muted-foreground bg-secondary border-r border-border">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="Mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/, ""))}
                className="flex-1 px-3 py-2.5 text-sm text-foreground bg-card focus:outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              />
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg text-sm disabled:opacity-60 hover:bg-primary/90 transition-colors"
            >
              {loading ? "Sending…" : "Get OTP"}
            </button>
          </>
        ) : (
          <>
            {isNewUser && (
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-card focus:outline-none mb-3"
              />
            )}
            <input
              type="text"
              maxLength={4}
              placeholder="4-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/, ""))}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-lg font-bold text-foreground bg-card focus:outline-none mb-4 tracking-widest text-center"
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg text-sm disabled:opacity-60 hover:bg-primary/90 transition-colors"
            >
              {loading ? "Verifying…" : "Verify OTP"}
            </button>
            <button
              onClick={() => {
                setStep("phone");
                setError("");
              }}
              className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Change number
            </button>
          </>
        )}
      </div>
    </div>
  );
}
