# Zepto Clone — Full-Stack Grocery Delivery App

A production-grade clone of the Zepto quick-commerce grocery delivery platform. Built with a React/TypeScript frontend, a Node.js/Express REST API backend, and a FastAPI-powered AI service for semantic product search, personalized recommendations, and ML-based ETA prediction.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [AI Service](#ai-service)
- [Admin Panel](#admin-panel)
- [Security Notes](#security-notes)

---

## Features

### Customer

- **Product Browsing** — 103 products across 15 categories with filtering, sorting, and category tabs
- **Semantic Search** — AI-powered FAISS vector search with fuzzy fallback
- **Product Detail Modal** — full product info, ratings, and add-to-cart
- **Cart** — persistent server-side cart, real-time item count badge
- **Authentication** — OTP-based phone login (mock OTP shown in response for dev)
- **Location Selection** — GPS auto-detect or manual city/area selection
- **Live ETA** — ML-predicted delivery ETA based on distance and order size
- **Payment Flow** — multi-step mock checkout (UPI / Card / COD)
- **Order Tracking** — 6-step delivery progress bar, real-time polling every 3 s
- **Active Order Banner** — persistent floating banner with live status; collapses to a restore icon when dismissed
- **Order History** — full order history with per-order progress bars
- **Personalised Recommendations** — trending, personalised, and frequently-bought-together sections
- **Dark Mode** — system-aware toggle

### Admin (`/admin`)

- Password-gated standalone panel (`ADMIN_SECRET` env var, checked server-side)
- Add / manage products with image preview and all catalogue fields
- Inline stock editing
- Order status management with live dropdown updates

---

## Tech Stack

| Layer      | Technology                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------- |
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query v5, react-router-dom v6 |
| Backend    | Node.js, Express, MongoDB Atlas, Mongoose, JWT, bcryptjs, Socket.IO                         |
| AI Service | FastAPI, Python, FAISS, sentence-transformers, XGBoost / scikit-learn, pandas               |
| Dev Tools  | ESLint, Vitest, Playwright, Bun                                                             |

---

## Project Structure

```
Zepto-App/
├── frontend/          # React + TypeScript SPA (Vite, port 8080)
│   └── src/
│       ├── components/    # Shared UI components
│       ├── context/       # Auth, Cart, Location contexts
│       ├── lib/           # API client (api.ts)
│       └── pages/         # Route-level pages
│
├── backend/           # Express REST API (port 5001)
│   └── src/
│       ├── controllers/   # Route handlers
│       ├── middleware/    # auth, admin guards
│       ├── models/        # Mongoose schemas
│       └── routes/        # Express routers
│
└── ai_service/        # FastAPI AI microservice (port 8000)
    └── app/
        ├── routers/       # /search, /recommend, /predict-eta
        ├── services/      # Recommendation engine
        └── utils/         # FAISS index builder, embedding utils
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- MongoDB Atlas cluster (or local `mongod`)
- Bun (optional, for frontend lockfile)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/zepto-clone.git
cd zepto-clone
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run seed:products  # seed 103 products
node server.js
```

### 3. AI Service

```bash
cd ai_service
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Build FAISS index (run once after seeding)
python -m app.utils.build_faiss_from_mongo
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Frontend

```bash
cd frontend
npm install          # or: bun install
npm run dev          # starts at http://localhost:8080
```

---

## Environment Variables

### `backend/.env`

| Variable       | Description                                                      | Example                   |
| -------------- | ---------------------------------------------------------------- | ------------------------- |
| `MONGO_URL`    | MongoDB connection string                                        | `mongodb+srv://...`       |
| `PORT`         | Express server port                                              | `5001`                    |
| `JWT_SECRET`   | Secret for signing JWT tokens                                    | `change-me-in-production` |
| `ADMIN_SECRET` | Server-side admin API key (matched against `X-Admin-Key` header) | `change-me-in-production` |
| `AI_URL`       | Base URL of the AI service                                       | `http://localhost:8000`   |

> **Never commit `.env` files.** Copy `.env.example` and fill in your values.

### `ai_service/.env`

| Variable    | Description                                        |
| ----------- | -------------------------------------------------- |
| `MONGO_URL` | Same MongoDB connection string used by the backend |

---

## API Reference

All API routes are prefixed with `/api`.

### Auth

| Method | Path               | Description              |
| ------ | ------------------ | ------------------------ |
| `POST` | `/auth/send-otp`   | Send OTP to phone number |
| `POST` | `/auth/verify-otp` | Verify OTP, receive JWT  |

### Products

| Method | Path        | Description                                          |
| ------ | ----------- | ---------------------------------------------------- |
| `GET`  | `/products` | List products (supports `?category=` and `?search=`) |

### Cart _(auth required)_

| Method   | Path                    | Description           |
| -------- | ----------------------- | --------------------- |
| `GET`    | `/cart`                 | Get current user cart |
| `POST`   | `/cart/add`             | Add item              |
| `PUT`    | `/cart/item/:productId` | Update quantity       |
| `DELETE` | `/cart/item/:productId` | Remove item           |
| `DELETE` | `/cart/clear`           | Clear entire cart     |

### Orders _(auth required)_

| Method | Path                      | Description                     |
| ------ | ------------------------- | ------------------------------- |
| `POST` | `/orders/estimate-eta`    | Estimate delivery ETA (no auth) |
| `POST` | `/orders/create`          | Place an order                  |
| `GET`  | `/orders/user/:userId`    | Get order history               |
| `GET`  | `/orders/status/:orderId` | Poll live order status          |

### Admin _(requires `X-Admin-Key` header)_

| Method | Path                            | Description         |
| ------ | ------------------------------- | ------------------- |
| `GET`  | `/admin/products`               | List all products   |
| `POST` | `/admin/products`               | Create a product    |
| `PUT`  | `/admin/products/:id/stock`     | Update stock        |
| `GET`  | `/admin/orders`                 | List recent orders  |
| `PUT`  | `/admin/orders/:orderId/status` | Update order status |

### AI (proxied via backend `/api/ai`)

| Method | Path                    | Description                  |
| ------ | ----------------------- | ---------------------------- |
| `GET`  | `/ai/search?q=`         | Semantic product search      |
| `GET`  | `/ai/recommend/:userId` | Personalised recommendations |

---

## AI Service

The FastAPI microservice (`ai_service/`) exposes:

- **`/search`** — Sentence-transformer embeddings indexed in FAISS for semantic product search. Falls back to fuzzy text matching when the vector index is unavailable.
- **`/recommend/:userId`** — Returns trending, personalised, and frequently-bought-together product lists derived from order history.
- **`/predict-eta`** — XGBoost regression model trained on historical order data to predict delivery time based on distance, item count, and warehouse location.

To rebuild the FAISS index after adding new products:

```bash
cd ai_service
python -m app.utils.build_faiss_from_mongo
```

---

## Admin Panel

Navigate to `/admin` in the browser. The panel is:

- Isolated from the main app layout (standalone dark UI)
- Server-side protected — all admin API calls require the `X-Admin-Key` header matching `ADMIN_SECRET` in the backend `.env`
- Client-side gated with the same password for the UI

**Default dev password:** `zepto-admin-2024` (set via `ADMIN_SECRET` in `.env`)

> Change `ADMIN_SECRET` in `.env` before any public deployment.

---

## Security Notes

- JWT tokens stored in `localStorage` — migrate to `httpOnly` cookies for production.
- OTP is returned in the API response for development convenience — remove this in production and integrate a real SMS gateway (Twilio, MSG91, etc.).
- Admin authentication is purely server-side via the `X-Admin-Key` header; the client-side password field is only UI gating.
- All image URLs are validated to `http/https` on the server to prevent `javascript:` injection.
- Users can only fetch their own order status (IDOR protection enforced in `getOrderStatus`).

---

## License

MIT
