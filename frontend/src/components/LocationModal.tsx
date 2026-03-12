import { useState, useMemo } from "react";
import { MapPin, LocateFixed, Search, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation, type DeliveryLocation } from "@/context/LocationContext";

// ── Popular delivery areas grouped by city ─────────────────────────────────
const CITIES: { city: string; areas: Omit<DeliveryLocation, "city">[] }[] = [
  {
    city: "Bangalore",
    areas: [
      {
        label: "Koramangala",
        area: "Koramangala, Bangalore",
        pincode: "560034",
        coords: { lat: 12.9279, lng: 77.6271 },
      },
      {
        label: "Indiranagar",
        area: "Indiranagar, Bangalore",
        pincode: "560038",
        coords: { lat: 12.9784, lng: 77.6408 },
      },
      {
        label: "HSR Layout",
        area: "HSR Layout, Bangalore",
        pincode: "560102",
        coords: { lat: 12.9116, lng: 77.6389 },
      },
      {
        label: "Whitefield",
        area: "Whitefield, Bangalore",
        pincode: "560066",
        coords: { lat: 12.9698, lng: 77.7499 },
      },
      {
        label: "JP Nagar",
        area: "JP Nagar, Bangalore",
        pincode: "560078",
        coords: { lat: 12.9102, lng: 77.5853 },
      },
      {
        label: "Marathahalli",
        area: "Marathahalli, Bangalore",
        pincode: "560037",
        coords: { lat: 12.9591, lng: 77.7004 },
      },
    ],
  },
  {
    city: "Mumbai",
    areas: [
      {
        label: "Andheri West",
        area: "Andheri West, Mumbai",
        pincode: "400053",
        coords: { lat: 19.139, lng: 72.8301 },
      },
      {
        label: "Bandra",
        area: "Bandra, Mumbai",
        pincode: "400050",
        coords: { lat: 19.0607, lng: 72.8362 },
      },
      {
        label: "Powai",
        area: "Powai, Mumbai",
        pincode: "400076",
        coords: { lat: 19.1176, lng: 72.906 },
      },
      {
        label: "Malad",
        area: "Malad, Mumbai",
        pincode: "400064",
        coords: { lat: 19.1871, lng: 72.8484 },
      },
      {
        label: "Thane",
        area: "Thane, Mumbai",
        pincode: "400601",
        coords: { lat: 19.2183, lng: 72.9781 },
      },
      {
        label: "Navi Mumbai",
        area: "Navi Mumbai, Mumbai",
        pincode: "400703",
        coords: { lat: 19.033, lng: 73.0297 },
      },
    ],
  },
  {
    city: "Delhi",
    areas: [
      {
        label: "Connaught Place",
        area: "Connaught Place, Delhi",
        pincode: "110001",
        coords: { lat: 28.6315, lng: 77.2167 },
      },
      {
        label: "Lajpat Nagar",
        area: "Lajpat Nagar, Delhi",
        pincode: "110024",
        coords: { lat: 28.565, lng: 77.2432 },
      },
      {
        label: "Saket",
        area: "Saket, Delhi",
        pincode: "110017",
        coords: { lat: 28.5244, lng: 77.209 },
      },
      {
        label: "Dwarka",
        area: "Dwarka, Delhi",
        pincode: "110078",
        coords: { lat: 28.5921, lng: 77.046 },
      },
      {
        label: "Rohini",
        area: "Rohini, Delhi",
        pincode: "110085",
        coords: { lat: 28.7344, lng: 77.117 },
      },
      {
        label: "Janakpuri",
        area: "Janakpuri, Delhi",
        pincode: "110058",
        coords: { lat: 28.6239, lng: 77.0843 },
      },
    ],
  },
  {
    city: "Hyderabad",
    areas: [
      {
        label: "Banjara Hills",
        area: "Banjara Hills, Hyderabad",
        pincode: "500034",
        coords: { lat: 17.4062, lng: 78.4691 },
      },
      {
        label: "Gachibowli",
        area: "Gachibowli, Hyderabad",
        pincode: "500032",
        coords: { lat: 17.44, lng: 78.3489 },
      },
      {
        label: "Hitech City",
        area: "Hitech City, Hyderabad",
        pincode: "500081",
        coords: { lat: 17.4486, lng: 78.3762 },
      },
      {
        label: "Kukatpally",
        area: "Kukatpally, Hyderabad",
        pincode: "500072",
        coords: { lat: 17.4849, lng: 78.399 },
      },
      {
        label: "Secunderabad",
        area: "Secunderabad, Hyderabad",
        pincode: "500003",
        coords: { lat: 17.4399, lng: 78.4983 },
      },
    ],
  },
  {
    city: "Chennai",
    areas: [
      {
        label: "Anna Nagar",
        area: "Anna Nagar, Chennai",
        pincode: "600040",
        coords: { lat: 13.085, lng: 80.2101 },
      },
      {
        label: "Velachery",
        area: "Velachery, Chennai",
        pincode: "600042",
        coords: { lat: 12.9783, lng: 80.2209 },
      },
      {
        label: "T. Nagar",
        area: "T. Nagar, Chennai",
        pincode: "600017",
        coords: { lat: 13.0418, lng: 80.2341 },
      },
      {
        label: "Adyar",
        area: "Adyar, Chennai",
        pincode: "600020",
        coords: { lat: 13.0067, lng: 80.2569 },
      },
      {
        label: "Porur",
        area: "Porur, Chennai",
        pincode: "600116",
        coords: { lat: 13.0348, lng: 80.1568 },
      },
    ],
  },
  {
    city: "Pune",
    areas: [
      {
        label: "Baner",
        area: "Baner, Pune",
        pincode: "411045",
        coords: { lat: 18.559, lng: 73.7868 },
      },
      {
        label: "Kothrud",
        area: "Kothrud, Pune",
        pincode: "411038",
        coords: { lat: 18.5074, lng: 73.8076 },
      },
      {
        label: "Viman Nagar",
        area: "Viman Nagar, Pune",
        pincode: "411014",
        coords: { lat: 18.5679, lng: 73.9143 },
      },
      {
        label: "Hinjewadi",
        area: "Hinjewadi, Pune",
        pincode: "411057",
        coords: { lat: 18.5983, lng: 73.7386 },
      },
      {
        label: "Wakad",
        area: "Wakad, Pune",
        pincode: "411057",
        coords: { lat: 18.5975, lng: 73.757 },
      },
    ],
  },
  {
    city: "Kolkata",
    areas: [
      {
        label: "Salt Lake",
        area: "Salt Lake, Kolkata",
        pincode: "700064",
        coords: { lat: 22.5773, lng: 88.4148 },
      },
      {
        label: "Park Street",
        area: "Park Street, Kolkata",
        pincode: "700016",
        coords: { lat: 22.5508, lng: 88.3509 },
      },
      {
        label: "Newtown",
        area: "Newtown, Kolkata",
        pincode: "700156",
        coords: { lat: 22.5726, lng: 88.468 },
      },
      {
        label: "Behala",
        area: "Behala, Kolkata",
        pincode: "700034",
        coords: { lat: 22.4977, lng: 88.3162 },
      },
    ],
  },
];

// Flatten all areas for search
const ALL_AREAS: DeliveryLocation[] = CITIES.flatMap(({ city, areas }) =>
  areas.map((a) => ({ ...a, city })),
);

// ── GPS detect state machine ────────────────────────────────────────────────
type GpsStatus = "idle" | "loading" | "error";

export default function LocationModal() {
  const {
    modalOpen,
    closeModal,
    setLocation,
    location: currentLocation,
  } = useLocation();

  const [search, setSearch] = useState("");
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");
  const [gpsError, setGpsError] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null; // show city groups when no search
    return ALL_AREAS.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        (a.pincode && a.pincode.includes(q)),
    );
  }, [search]);

  // ── Detect location via browser Geolocation + Nominatim reverse-geocode ───
  function detectLocation() {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      setGpsStatus("error");
      return;
    }
    setGpsStatus("loading");
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } },
          );
          if (!res.ok) throw new Error("Reverse geocode failed");
          const data = await res.json();
          const addr = data.address ?? {};
          const label =
            addr.suburb ||
            addr.neighbourhood ||
            addr.county ||
            addr.city_district ||
            addr.town ||
            addr.village ||
            "Your Location";
          const city =
            addr.city ||
            addr.town ||
            addr.county ||
            addr.state_district ||
            "Unknown";
          const pincode = addr.postcode ?? undefined;
          setLocation({
            label,
            area: `${label}, ${city}`,
            city,
            pincode,
            coords: { lat: latitude, lng: longitude },
          });
          setGpsStatus("idle");
        } catch {
          setGpsError("Could not fetch address. Please select manually.");
          setGpsStatus("error");
        }
      },
      (err) => {
        const msg =
          err.code === 1
            ? "Location permission denied. Please allow access or select manually."
            : "Unable to detect location. Please select manually.";
        setGpsError(msg);
        setGpsStatus("error");
      },
      { timeout: 10_000 },
    );
  }

  function handleClose() {
    setSearch("");
    setGpsStatus("idle");
    setGpsError("");
    closeModal();
  }

  return (
    <Dialog open={modalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md w-full p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <MapPin className="w-4 h-4 text-primary" />
            Select Delivery Location
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pt-4 space-y-3">
          {/* GPS detect */}
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-primary border-primary/30 hover:bg-primary/5"
            onClick={detectLocation}
            disabled={gpsStatus === "loading"}
          >
            <LocateFixed
              className={`w-4 h-4 ${gpsStatus === "loading" ? "animate-pulse" : ""}`}
            />
            {gpsStatus === "loading"
              ? "Detecting your location…"
              : "Use my current location"}
          </Button>

          {gpsError && (
            <p className="text-xs text-destructive flex items-start gap-1">
              <X className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {gpsError}
            </p>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search area, city or pincode…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearch("")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mt-2 max-h-80 overflow-y-auto px-5 pb-5">
          {filtered ? (
            // Search results
            filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No areas found for "{search}"
              </p>
            ) : (
              <ul className="space-y-0.5">
                {filtered.map((loc) => (
                  <AreaRow
                    key={`${loc.city}-${loc.label}`}
                    loc={loc}
                    onSelect={setLocation}
                    current={currentLocation}
                  />
                ))}
              </ul>
            )
          ) : (
            // City groups
            CITIES.map(({ city, areas }) => (
              <div key={city} className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 pt-2">
                  {city}
                </p>
                <ul className="space-y-0.5">
                  {areas.map((a) => {
                    const loc: DeliveryLocation = { ...a, city };
                    return (
                      <AreaRow
                        key={`${city}-${a.label}`}
                        loc={loc}
                        onSelect={setLocation}
                        current={currentLocation}
                      />
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Single area row ──────────────────────────────────────────────────────────
function AreaRow({
  loc,
  onSelect,
  current,
}: {
  loc: DeliveryLocation;
  onSelect: (l: DeliveryLocation) => void;
  current: DeliveryLocation | null;
}) {
  const isSelected = current?.label === loc.label && current?.city === loc.city;

  return (
    <li>
      <button
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left
          ${
            isSelected
              ? "bg-primary/10 text-primary font-medium"
              : "hover:bg-secondary text-foreground"
          }`}
        onClick={() => onSelect(loc)}
      >
        <span className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
          <span>
            {loc.label}
            {loc.pincode && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                {loc.pincode}
              </span>
            )}
          </span>
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      </button>
    </li>
  );
}
