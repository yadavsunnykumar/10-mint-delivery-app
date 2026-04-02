import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_LOCATION } from "@/lib/constants";

interface LocationData {
  area: string;
  city: string;
  pincode?: string;
  coords: { lat: number; lng: number };
}

interface LocationContextValue {
  location: LocationData | null;
  setLocation: (loc: LocationData) => void;
  locationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
}

const DEFAULT: LocationData = {
  area: "Thamel",
  city: "Kathmandu",
  pincode: "44600",
  coords: DEFAULT_LOCATION,
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<LocationData | null>(DEFAULT);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("everest_location_np").then((saved) => {
      if (saved) {
        try {
          setLocationState(JSON.parse(saved));
        } catch {}
      }
    });
  }, []);

  const setLocation = useCallback((loc: LocationData) => {
    setLocationState(loc);
    AsyncStorage.setItem("everest_location_np", JSON.stringify(loc));
  }, []);

  const openLocationModal = useCallback(() => setLocationModalOpen(true), []);
  const closeLocationModal = useCallback(() => setLocationModalOpen(false), []);

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        locationModalOpen,
        openLocationModal,
        closeLocationModal,
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
