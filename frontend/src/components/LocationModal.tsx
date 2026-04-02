import { useState, useMemo } from "react";
import { MapPin, LocateFixed, Search, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation, type DeliveryLocation } from "@/context/LocationContext";
import { CITIES } from "@/lib/constants";

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
          <DialogDescription className="sr-only">
            Search for an area, city, or pincode, or use your current location.
          </DialogDescription>
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
