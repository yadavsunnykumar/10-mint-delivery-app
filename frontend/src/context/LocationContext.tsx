import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export interface DeliveryLocation {
  label: string; // e.g. "Koramangala"
  area: string; // e.g. "Koramangala, Bangalore"
  city: string; // e.g. "Bangalore"
  pincode?: string;
  coords?: { lat: number; lng: number };
}

interface LocationContextValue {
  location: DeliveryLocation | null;
  setLocation: (loc: DeliveryLocation) => void;
  clearLocation: () => void;
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const STORAGE_KEY = "zepto_location";

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<DeliveryLocation | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [modalOpen, setModalOpen] = useState(false);

  const setLocation = useCallback((loc: DeliveryLocation) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    setLocationState(loc);
    setModalOpen(false);
  }, []);

  const clearLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLocationState(null);
  }, []);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        clearLocation,
        modalOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}
