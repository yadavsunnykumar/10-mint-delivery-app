import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DeliveryBanner from "@/components/DeliveryBanner";
import EverestHeader from "@/components/EverestHeader";
import CategoryTabs from "@/components/CategoryTabs";
import LocationModal from "@/components/LocationModal";
import ActiveOrderBanner from "@/components/ActiveOrderBanner";

export interface LayoutContext {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const AppLayout = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { pathname } = useLocation();

  // Reset search when navigating to a new page
  useEffect(() => {
    setSearchQuery("");
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <DeliveryBanner />
      <div className="sticky top-0 z-40 bg-card shadow-sm">
        <EverestHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <CategoryTabs />
      </div>
      <Outlet
        context={{ searchQuery, setSearchQuery } satisfies LayoutContext}
      />
      <LocationModal />
      <ActiveOrderBanner />
    </div>
  );
};

export default AppLayout;
