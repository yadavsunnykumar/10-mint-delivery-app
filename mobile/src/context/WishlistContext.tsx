import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product } from "@/lib/api";

const STORAGE_KEY = "everest_wishlist";

interface WishlistContextValue {
  wishlist: Product[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextValue>({
  wishlist: [],
  isWishlisted: () => false,
  toggleWishlist: () => {},
  clearWishlist: () => {},
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setWishlist(JSON.parse(raw));
        } catch {}
      }
    });
  }, []);

  const persist = (items: Product[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const isWishlisted = useCallback(
    (productId: string) => wishlist.some((p) => p.id === productId),
    [wishlist],
  );

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      const next = exists
        ? prev.filter((p) => p.id !== product.id)
        : [product, ...prev];
      persist(next);
      return next;
    });
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <WishlistContext.Provider
      value={{ wishlist, isWishlisted, toggleWishlist, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
