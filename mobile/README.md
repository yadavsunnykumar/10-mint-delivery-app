# Everest Dash — React Native App

Mobile app for **Everest Dash**, a 10-minute grocery delivery service for the Kathmandu Valley. This is a React Native (Expo) conversion of the web app at `../frontend/`.

## Stack

| Concern | Library |
|---|---|
| Framework | Expo ~51 + React Native 0.74 |
| Navigation | React Navigation (Stack + Bottom Tabs) |
| State | React Context API (Auth, Cart, Location, Theme) |
| Server State | TanStack React Query |
| Maps | react-native-maps (Google Maps) |
| Storage | AsyncStorage (replaces localStorage) |
| Icons | @expo/vector-icons (Ionicons) |
| Real-time | Socket.io-client |
| Location | expo-location |
| Image Picker | expo-image-picker |
| Gradients | expo-linear-gradient |
| Toast | react-native-toast-message |

## Project Structure

```
mobile/
├── App.tsx                    # Root — all providers wired up
├── app.json                   # Expo config
├── babel.config.js            # Path aliases (@/*)
├── tsconfig.json
├── package.json
├── assets/                    # App icons, splash screen
└── src/
    ├── navigation/
    │   └── AppNavigator.tsx   # Stack + Bottom Tab navigation
    ├── screens/
    │   ├── HomeScreen.tsx         # Main feed (banners, grid, product sections)
    │   ├── CartScreen.tsx         # Cart + checkout + payment flow
    │   ├── CategoriesScreen.tsx   # Browse all categories
    │   ├── ShopScreen.tsx         # Products by category (sort/filter)
    │   ├── SearchResultsScreen.tsx# AI-powered search
    │   ├── OrderHistoryScreen.tsx # All orders with progress tracker
    │   ├── TrackOrderScreen.tsx   # Live order tracking with map
    │   ├── ProfileScreen.tsx      # User profile, edit, avatar, logout
    │   ├── AboutScreen.tsx
    │   ├── FAQsScreen.tsx
    │   ├── ContactScreen.tsx
    │   └── TermsScreen.tsx
    ├── components/
    │   ├── LoginModal.tsx         # OTP-based phone login
    │   ├── LocationModal.tsx      # City/area picker + GPS detection
    │   ├── ProductCard.tsx        # Product tile with add-to-cart
    │   ├── ProductDetailModal.tsx # Bottom sheet product details
    │   ├── ProductSection.tsx     # Horizontal product list section
    │   ├── PromoBanners.tsx       # Auto-scrolling carousel banners
    │   └── PaymentModal.tsx       # UPI / Card / COD payment
    ├── context/
    │   ├── AuthContext.tsx        # Auth state + AsyncStorage
    │   ├── CartContext.tsx        # Cart state
    │   ├── LocationContext.tsx    # Delivery location
    │   └── ThemeContext.tsx       # Dark/light mode
    └── lib/
        ├── api.ts                 # All API calls (same as web, AsyncStorage for headers)
        ├── constants.ts           # Colors, cities, categories
        ├── categories.ts          # Category configs
        └── utils.ts               # Formatters
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode + iOS Simulator
- For Android: Android Studio + Emulator, or a physical device with Expo Go

### Install & Run

```bash
cd mobile

# Install dependencies
npm install

# Start the Expo dev server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

### Configuration

1. **Backend URL** — Edit `src/lib/constants.ts`:
   ```ts
   export const API_BASE_URL = "http://YOUR_IP:5001";
   export const SOCKET_URL   = "http://YOUR_IP:5001";
   ```
   Use your machine's local IP (not `localhost`) when running on a physical device.

2. **Google Maps API Key** — In `app.json`, add:
   ```json
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "YOUR_ANDROID_MAPS_KEY"
       }
     }
   },
   "ios": {
     "config": {
       "googleMapsApiKey": "YOUR_IOS_MAPS_KEY"
     }
   }
   ```

3. **Assets** — Replace `assets/placeholder.png` with a real 200×200 transparent PNG.

## Feature Parity with Web App

| Feature | Web | Mobile |
|---|---|---|
| Home feed (banners, categories, products) | ✅ | ✅ |
| AI search | ✅ | ✅ |
| Category/Shop pages | ✅ | ✅ |
| Cart & checkout | ✅ | ✅ |
| OTP login | ✅ | ✅ |
| Payment (UPI, Card, COD) | ✅ | ✅ |
| Order history | ✅ | ✅ |
| Live order tracking with map | ✅ | ✅ |
| Socket.io real-time updates | ✅ | ✅ |
| GPS location detection | ✅ | ✅ |
| Profile edit + avatar | ✅ | ✅ |
| Dark mode | ✅ | ✅ |
| About / FAQs / Contact / Terms | ✅ | ✅ |
| Admin panel | ✅ | ❌ (web-only) |

## Notes

- The `AuthProvider` in `App.tsx` depends on `CartProvider` being a parent, mirroring the web's provider order.
- `AsyncStorage` replaces `localStorage`/`sessionStorage` throughout.
- All API calls are the same endpoints as the web; only the token retrieval is async.
