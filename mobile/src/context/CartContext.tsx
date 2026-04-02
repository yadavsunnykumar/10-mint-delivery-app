import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as api from "@/lib/api";

interface CartContextValue {
  cartCount: number;
  cartItems: api.CartItem[];
  cartTotal: number;
  addToCart: (product_id: string) => Promise<void>;
  updateItem: (product_id: string, qty: number) => Promise<void>;
  removeItem: (product_id: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
  getQty: (product_id: string) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<api.CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  const isLoggedIn = async () =>
    !!(await AsyncStorage.getItem("everest_token"));

  const refreshCart = useCallback(async () => {
    if (!(await isLoggedIn())) return;
    try {
      const res = await api.getCart();
      setCartItems(res.items);
      setCartTotal(res.total);
    } catch {
      // silently ignore
    }
  }, []);

  const addToCart = useCallback(
    async (product_id: string) => {
      if (!(await isLoggedIn())) return;
      await api.addToCart(product_id);
      await refreshCart();
    },
    [refreshCart],
  );

  const updateItem = useCallback(
    async (product_id: string, qty: number) => {
      if (!(await isLoggedIn())) return;
      await api.updateCartItem(product_id, qty);
      await refreshCart();
    },
    [refreshCart],
  );

  const removeItem = useCallback(
    async (product_id: string) => {
      if (!(await isLoggedIn())) return;
      await api.removeFromCart(product_id);
      await refreshCart();
    },
    [refreshCart],
  );

  const getQty = useCallback(
    (product_id: string) =>
      cartItems.find((i) => i.product_id === product_id)?.qty ?? 0,
    [cartItems],
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartTotal(0);
  }, []);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        cartItems,
        cartTotal,
        addToCart,
        updateItem,
        removeItem,
        refreshCart,
        clearCart,
        getQty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
