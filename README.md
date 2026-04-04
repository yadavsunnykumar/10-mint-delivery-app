# DaakDelivery — Kathmandu's 10-Minute Grocery Delivery App

> **Kathmandu ko sab kuch, 10 minutema!**

A production-grade quick-commerce delivery app built for the Kathmandu Valley. Inspired by Zepto and Blinkit, DaakDelivery delivers groceries, dairy, fresh produce, puja items, and household essentials in 10 minutes through a network of 6 dark stores across Kathmandu, Lalitpur, and Bhaktapur.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Product Catalog](#product-catalog)
- [Dark Stores](#dark-stores)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [AI Service](#ai-service)
- [Payment Methods](#payment-methods)
- [Security Notes](#security-notes)

---

## Features

### Customer App (React Native / Expo)

| Feature | Description |
|---|---|
| **10-min delivery** | Guaranteed delivery within 10 minutes from the nearest dark store |
| **139+ Products** | 17 categories including fresh vegetables, dairy, meat & seafood, puja items, electronics |
| **Nepal-context catalog** | Wai Wai, Sujal, DDC, Gorkha Beer, Ilam Tea, Timur spice — real Nepali brands |
| **AI Semantic Search** | FAISS vector search + fuzzy fallback for natural language queries |
| **OTP Login** | Phone-based OTP authentication with 30-second resend timer |
| **GPS Location** | Auto-detect location or pick from 50+ Kathmandu Valley areas |
| **Live ETA** | ML-predicted delivery time based on distance and dark store proximity |
| **Promo Codes** | NEWKTM (20% off), DAIRY50 (रू50 off), DIGITALPAY (10% eSewa/Khalti cashback) |
| **Wishlist** | Save products with AsyncStorage persistence |
| **Cart** | Server-side persistent cart with real-time count badge |
| **Order Tracking** | 6-step progress (Created → Accepted → Packed → Assigned → En Route → Delivered) |
| **Live Map Tracking** | Google Maps integration for real-time rider location |
| **ETA Countdown** | Live countdown timer on the track order screen |
| **Order Cancellation** | Cancel orders in "Created" or "Accepted" status |
| **Reorder** | One-tap reorder from order history |
| **Dark Mode** | System-aware theme toggle |
| **Pull-to-refresh** | On order history and product listings |
| **Delivery Instructions** | Add special notes for the delivery partner |

### Nepal-Specific Payment Methods

- **eSewa** — Nepal's #1 digital wallet
- **Khalti** — Fast & secure payments
- **FonePay QR** — Scan & pay via any bank app
- **IME Pay** — Digital remittance wallet
- **Cash on Delivery (COD)**
- **Debit / Credit Card** (Visa, Mastercard)

### Admin Panel (Web)

- Password-gated standalone admin panel at `/admin`
- Add / manage products with image preview
- Inline stock editing
- Order status management with live dropdown updates
- All API calls require `X-Admin-Key` server-side validation

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Mobile App** | React Native, Expo, TypeScript, TanStack Query v5, React Navigation v6 |
| **Mobile State** | React Context (Auth, Cart, Location, Wishlist, Theme) + AsyncStorage |
| **Frontend Web** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Express, MongoDB Atlas, Mongoose, JWT, Socket.IO |
| **AI Service** | FastAPI, Python, FAISS, sentence-transformers, XGBoost / scikit-learn |
| **Maps** | Google Maps (React Native Maps / expo-location) |
| **Dev Tools** | ESLint, TypeScript strict mode |

---

## Product Catalog

**17 categories, 139+ products** — all priced in NPR (Nepalese Rupees):

| Category | Products | Examples |
|---|---|---|
| 🥦 Fruits & Vegetables | 17 | Golbheda, Aalu, Palunggo, Mustang Syau, Sindhuli Suntala |
| 🥛 Dairy & Eggs | 10 | Sujal Milk, DDC Toned Milk, Juju Dhau, Cow Ghee, Fresh Eggs |
| 🍗 Meat & Seafood | 5 | Skinless Chicken, Khasi Mutton, Rohu Fish, Buff Momo Filling |
| 🌾 Grocery & Staples | 17 | Basmati Rice, Masoor Dal, Wai Wai, Rara, Mustard Oil, Timur |
| 🥤 Beverages | 9 | Gorkha Beer, Ilam CTC Tea, Red Bull, Himalayan Sparkling Water |
| 🍿 Snacks | 7 | Kurkure, Lays, Bhuja Mix, Dairy Milk, Kwiks Ice Cream |
| 🧴 Personal Care | 8 | Sunsilk, Colgate, Patanjali, Nivea, Dabur Amla |
| 🧹 Household | 7 | Surf Excel, Vim, Harpic, Dettol, Lizol |
| 👶 Baby Care | 4 | Pampers, Huggies, Johnson's Baby Shampoo, Cerelac |
| 💊 Health & Wellness | 6 | ORS, Himalayan Honey, Chyawanprash, Vitamin C |
| 🍞 Bakery | 4 | White Bread, Samosa, Chocolate Muffin, Whole Wheat Bread |
| 🪔 Puja & Festival | 5 | Agarbatti, Clay Diyo, Tika Set, Sayapatri Maala, Camphor |
| 🔌 Electronics | 3 | Type-C Cable, USB Charger, Wired Earphones |
| ✏️ Stationery | 3 | Ballpoint Pens, A4 Notebook, AA Batteries |
| ❄️ Frozen Food | 1 | Frozen Buff Momo 20 pcs |

---

## Dark Stores

6 dark stores covering the Kathmandu Valley:

| Store | Location | Covers |
|---|---|---|
| DS001 Thamel | Thamel Chowk | Thamel, Lazimpath, Naxal, Bishalnagar |
| DS002 Baneshwor | New Baneshwor | Baneshwor, Battisputali, Putalisadak, Anamnagar |
| DS003 Maharajgunj | Maharajgunj Chowk | Maharajgunj, Chakrapath, Sukedhara, Kapan |
| DS004 Koteshwor | Koteshwor | Koteshwor, Boudha, Chabahil, Jorpati |
| DS005 Patan | Kupondole, Lalitpur | Patan, Jawalakhel, Sanepa, Lagankhel, Pulchowk |
| DS006 Kalimati | Kalimati | Kalimati, Kalanki, Sitapaila, Balaju, Tripureshwor |

---

## Project Structure

```
DaakDelivery/
├── mobile/                    # React Native / Expo app
│   └── src/
│       ├── components/        # ProductCard, PaymentModal, LoginModal, PromoBanners…
│       ├── context/           # Auth, Cart, Location, Wishlist, Theme contexts
│       ├── lib/
│       │   ├── api.ts         # All API functions (typed)
│       │   ├── constants.ts   # App constants, promo codes, delivery config, colors
│       │   ├── categories.ts  # Category definitions and slug mappings
│       │   ├── config.ts      # Runtime config from EXPO_PUBLIC_* env vars
│       │   └── utils.ts       # Date formatting, status formatting helpers
│       ├── navigation/        # AppNavigator (stack + bottom tabs)
│       └── screens/           # HomeScreen, CartScreen, TrackOrder, ProfileScreen…
│
├── backend/                   # Express REST API (port 5001)
│   ├── src/
│   │   ├── controllers/       # product, order, cart, auth, admin, delivery
│   │   ├── middleware/        # requireAuth, adminOnly
│   │   ├── models/            # Product, Order, Cart, User, Warehouse, DeliveryPartner
│   │   └── routes/            # Express routers
│   ├── seed_nepal_products.js # Seeds 139 Nepal-context products
│   └── seed_warehouses.js     # Seeds 6 Kathmandu dark stores
│
├── frontend/                  # React web app (port 8080, Vite)
│   └── src/
│       ├── components/        # Shared UI components
│       ├── pages/             # Route-level pages + /admin panel
│       └── lib/               # Web API client
│
└── ai_service/                # FastAPI AI microservice (port 8000)
    └── app/
        ├── routers/           # /search, /recommend, /predict-eta
        ├── services/          # Recommendation engine
        └── utils/             # FAISS index builder
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- MongoDB Atlas cluster (or local `mongod`)
- Expo CLI (`npm install -g expo-cli`)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/daak-delivery.git
cd daak-delivery
```

### 2. Backend

```bash
cd backend
cp .env.example .env        # fill in MONGO_URL, JWT_SECRET, ADMIN_SECRET, AI_URL
npm install
node seed_warehouses.js     # seed 6 dark stores
node seed_nepal_products.js # seed 139 products
node server.js              # starts on port 5001
```

### 3. AI Service

```bash
cd ai_service
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m app.utils.build_faiss_from_mongo   # build FAISS index (run after seeding)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Mobile App

```bash
cd mobile
cp .env.example .env        # set EXPO_PUBLIC_API_URL, EXPO_PUBLIC_SOCKET_URL
npm install
npx expo start              # scan QR with Expo Go or run on emulator
```

### 5. Web Frontend (optional)

```bash
cd frontend
npm install
npm run dev                 # starts at http://localhost:8080
```

---

## Environment Variables

### `backend/.env`

| Variable | Description | Example |
|---|---|---|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://…` |
| `PORT` | Express server port | `5001` |
| `JWT_SECRET` | Secret for signing JWT tokens | `change-me-in-production` |
| `ADMIN_SECRET` | Admin API key (`X-Admin-Key` header) | `change-me-in-production` |
| `AI_URL` | Base URL of AI service | `http://localhost:8000` |

### `mobile/.env` (Expo)

| Variable | Description | Example |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Backend base URL | `http://192.168.1.x:5001` |
| `EXPO_PUBLIC_SOCKET_URL` | Socket.IO URL | `http://192.168.1.x:5001` |
| `EXPO_PUBLIC_ENV` | Environment flag | `development` |
| `EXPO_PUBLIC_ADMIN_KEY` | Admin key for dev tools | `your-admin-secret` |

> **Never commit `.env` files.** Copy `.env.example` and fill in your own values.

---

## API Reference

All routes are prefixed with `/api`.

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/send-otp` | Send OTP to phone number |
| `POST` | `/auth/verify-otp` | Verify OTP, receive JWT |
| `PATCH` | `/auth/profile` | Update name, alt_phone, avatar |

### Products

| Method | Path | Description |
|---|---|---|
| `GET` | `/products` | List products (`?category=`, `?search=`, `?sort=`, `?limit=`, `?offset=`) |
| `GET` | `/products/:id` | Get single product |
| `GET` | `/products/categories` | List all categories with counts |

### Cart _(auth required)_

| Method | Path | Description |
|---|---|---|
| `GET` | `/cart` | Get current user's cart |
| `POST` | `/cart/add` | Add item to cart |
| `PUT` | `/cart/item/:productId` | Update item quantity |
| `DELETE` | `/cart/item/:productId` | Remove item |
| `DELETE` | `/cart/clear` | Clear entire cart |

### Orders _(auth required)_

| Method | Path | Description |
|---|---|---|
| `POST` | `/orders/estimate-eta` | Estimate delivery ETA (no auth) |
| `POST` | `/orders/create` | Place an order (supports promo_code, payment_method, delivery_instructions) |
| `POST` | `/orders/cancel/:orderId` | Cancel an order |
| `GET` | `/orders/user/:userId` | Get order history |
| `GET` | `/orders/status/:orderId` | Poll live order status |
| `GET` | `/orders/tracking/:orderId` | Full tracking data (rider, ETA, route) |

### Warehouses

| Method | Path | Description |
|---|---|---|
| `GET` | `/warehouses` | List all active dark stores |

### Admin _(requires `X-Admin-Key` header)_

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/products` | List all products |
| `POST` | `/admin/products` | Create a product |
| `PUT` | `/admin/products/:id/stock` | Update stock level |
| `GET` | `/admin/orders` | List recent orders |
| `PUT` | `/admin/orders/:orderId/status` | Update order status |

### AI (proxied via backend `/api/ai`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/ai/search?q=` | Semantic product search (FAISS) |
| `GET` | `/ai/recommend/:userId` | Personalised recommendations |
| `POST` | `/orders/estimate-eta` | ML-based ETA prediction |

---

## AI Service

The FastAPI microservice (`ai_service/`) powers three capabilities:

- **Semantic Search** — Sentence-transformer embeddings indexed in FAISS. Query "dahi" returns yogurt, curd, and lassi results. Falls back to fuzzy text matching when the vector index is unavailable.
- **Recommendations** — Returns trending, personalised, and frequently-bought-together product lists derived from order history.
- **ETA Prediction** — XGBoost regression model trained on historical Kathmandu delivery data. Predicts delivery time based on Haversine distance to nearest dark store, item count, and time of day.

Rebuild the FAISS index after adding new products:

```bash
cd ai_service
python -m app.utils.build_faiss_from_mongo
```

---

## Payment Methods

All payments are currently mock (no real gateway integration). The following methods are UI-supported:

| Method | Provider | Status |
|---|---|---|
| eSewa | CG Corp | Mock (UI only) |
| Khalti | Khalti Digital Wallet | Mock (UI only) |
| FonePay QR | FonePay | Mock (UI only) |
| IME Pay | IME Digital | Mock (UI only) |
| Cash on Delivery | — | Fully supported |
| Debit/Credit Card | Visa, Mastercard | Mock (UI only) |

To enable real payments, integrate the eSewa or Khalti merchant SDK and replace the `onSuccess` handler in `PaymentModal.tsx`.

---

## Promo Codes

| Code | Discount | Min Order | Valid For |
|---|---|---|---|
| `NEWKTM` | 20% off (max रू200) | रू300 | First order |
| `WEEKENDFREE` | Free delivery | रू499 | Weekends |
| `DASHAIN15` | 15% off (max रू300) | रू500 | Dashain season |
| `DAIRY50` | रू50 flat off | रू250 | 3+ dairy products |
| `DIGITALPAY` | 10% cashback (max रू150) | रू400 | eSewa / Khalti payments |
| `WELCOME50` | रू50 flat off | रू200 | Any order |
| `SAVE10` | 10% off | रू300 | Any order |

---

## Security Notes

- JWT tokens stored in `AsyncStorage` — migrate to `SecureStore` for production.
- OTP is returned in the API response for development convenience — remove in production and integrate a real SMS gateway (e.g., Sparrow SMS, Aakash SMS for Nepal).
- Admin auth is server-side via `X-Admin-Key` header; the client-side password field is UI gating only.
- Image URLs are validated to `http/https` on the server to prevent injection.
- Users can only fetch their own order status (IDOR protection in `getOrderTracking`).
- Socket.IO order updates are broadcast by order ID — add auth middleware before production deployment.

---

## License

MIT
