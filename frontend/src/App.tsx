import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AppLayout from "./components/AppLayout.tsx";
import Index from "./pages/Index.tsx";
import Cart from "./pages/Cart.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import Profile from "./pages/Profile.tsx";
import ShopPage from "./pages/ShopPage.tsx";
import About from "./pages/About.tsx";
import Careers from "./pages/Careers.tsx";
import Blog from "./pages/Blog.tsx";
import Press from "./pages/Press.tsx";
import CategoriesPage from "./pages/Categories.tsx";
import FAQs from "./pages/FAQs.tsx";
import ContactUs from "./pages/ContactUs.tsx";
import Terms from "./pages/Terms.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import OrderHistory from "./pages/OrderHistory.tsx";
import SearchResults from "./pages/SearchResults.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CartProvider>
          <AuthProvider>
            <LocationProvider>
              <BrowserRouter>
                <Routes>
                  {/* All pages share the AppLayout shell (header + category tabs) */}
                  {/* Standalone admin — no user layout */}
                  <Route path="/admin" element={<AdminPanel />} />

                  {/* All pages share the AppLayout shell (header + category tabs) */}
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/shop/:gridSlug" element={<ShopPage />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/press" element={<Press />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/help/faqs" element={<FAQs />} />
                    <Route path="/help/contact" element={<ContactUs />} />
                    <Route path="/help/terms" element={<Terms />} />
                    <Route path="/help/privacy" element={<PrivacyPolicy />} />
                  </Route>
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </LocationProvider>
          </AuthProvider>
        </CartProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
