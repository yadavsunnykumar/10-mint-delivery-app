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

// "everest_location_np" key replaces the old "everest_location" key to clear
// any India-context locations (e.g. Andheri, Mumbai) stored from prior sessions.
const STORAGE_KEY = "everest_location_np";

// Nepal bounding box for stored-location validation
const isNepalCoords = (lat: number, lng: number) =>
  lat >= 26.3 && lat <= 30.5 && lng >= 79.9 && lng <= 88.3;

const DEFAULT_LOCATION: DeliveryLocation = {
  label: "Thamel",
  area: "Thamel, Kathmandu",
  city: "Kathmandu",
  pincode: "44600",
  coords: { lat: 27.7149, lng: 85.313 },
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<DeliveryLocation | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULT_LOCATION;
      const parsed = JSON.parse(saved) as DeliveryLocation;
      // Discard locations outside Nepal
      if (
        parsed.coords &&
        !isNepalCoords(parsed.coords.lat, parsed.coords.lng)
      ) {
        return DEFAULT_LOCATION;
      }
      return parsed;
    } catch {
      return DEFAULT_LOCATION;
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
