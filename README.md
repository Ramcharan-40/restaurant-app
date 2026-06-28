# 🍽️ Hotel Aadhya — Restaurant Ordering System

A full-stack restaurant ordering system with real-time kitchen updates, an AI-powered menu assistant, and a QR-based customer ordering flow.

> Built as an MVP for a real restaurant use case — customers scan a QR code, browse the menu, chat with an AI waiter, and place orders that appear live on the kitchen dashboard.

---

## 🔗 Live Demo

| App | URL |
|-----|-----|
| 🧾 Customer Menu | [restaurant-app-eight-opal.vercel.app/table/1](https://restaurant-app-eight-opal.vercel.app/table/1) |
| 🍳 Kitchen Dashboard | [restaurant-kitchen-livid.vercel.app](https://restaurant-kitchen-livid.vercel.app) |
| 🔐 Admin Panel | [restaurant-admin-gilt.vercel.app](https://restaurant-admin-gilt.vercel.app) |
| ⚙️ Backend API | [restaurant-app-ppzr.onrender.com](https://restaurant-app-ppzr.onrender.com) |

---

## ✨ Features

### Customer App
- Scan QR code on table → browse menu instantly, no login required
- Items grouped by category with one-tap add to cart
- **AI Menu Assistant ("Ask Aadhya")** — powered by Google Gemini, recommends dishes based on mood, diet, or budget in natural language
- Cart with quantity controls → place order → confirmation screen

### Kitchen Dashboard
- Real-time order board with 4 columns: **New → Preparing → Ready → Served**
- Orders appear instantly via **Socket.IO** — no refresh needed
- One-click status progression per order
- Live connection indicator

### Admin Panel
- JWT-based login (secure, token expires after 8 hours)
- Menu Manager — add, edit, delete items, toggle availability
- Orders view — see all orders with status and items
- QR Code generator — printable QR codes for every table

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite (via better-sqlite3) |
| Real-time | Socket.IO |
| AI Assistant | Google Gemini API (gemini-2.5-flash) |
| Auth | JWT + bcryptjs |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
restaurant-app/
├── backend/          # Express + TypeScript API
│   └── src/
│       ├── routes/   # menu, orders, tables, auth, ai
│       ├── middleware/
│       └── db.ts     # SQLite setup + seeding
├── customer-web/     # QR-facing customer menu (Vite + React)
├── kitchen-panel/    # Live kitchen order board (Vite + React)
└── admin-panel/      # Admin dashboard with login (Vite + React)
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js v20+
- Git

### 1 — Clone the repo
```bash
git clone https://github.com/Ramcharan-40/restaurant-app.git
cd restaurant-app
```

### 2 — Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=4000
NODE_ENV=development
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your_bcrypt_hash
JWT_SECRET=your_random_secret
CUSTOMER_APP_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

```bash
npm run dev
```

### 3 — Customer App
```bash
cd customer-web
npm install
```

Create `customer-web/.env`:
```
VITE_API_URL=http://localhost:4000
```

```bash
npm run dev
# Open http://localhost:5173/table/1
```

### 4 — Kitchen Dashboard
```bash
cd kitchen-panel
npm install
```

Create `kitchen-panel/.env`:
```
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

```bash
npm run dev
```

### 5 — Admin Panel
```bash
cd admin-panel
npm install
```

Create `admin-panel/.env`:
```
VITE_API_URL=http://localhost:4000
```

```bash
npm run dev
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/menu` | Get all menu items |
| POST | `/api/menu` | Add menu item (auth) |
| PUT | `/api/menu/:id` | Update menu item (auth) |
| DELETE | `/api/menu/:id` | Delete menu item (auth) |
| GET | `/api/orders` | Get all orders |
| POST | `/api/orders` | Place new order |
| PATCH | `/api/orders/:id/status` | Update order status |
| GET | `/api/tables` | Get all tables |
| GET | `/api/tables/:id/qr` | Generate QR code |
| POST | `/api/auth/login` | Admin login |
| POST | `/api/ai/ask` | AI menu assistant |

---

## 🤖 AI Assistant — How It Works

The "Ask Aadhya" assistant is built on Google Gemini. When a customer types something like *"something light and not spicy under ₹150"*:

1. The customer app sends the message to your own backend (`POST /api/ai/ask`)
2. The backend fetches the **live menu from SQLite** and passes it to Gemini
3. Gemini reasons over the real menu and returns structured JSON with dish recommendations
4. The customer app renders clickable cards with **"+ Add"** buttons wired to the real cart

The API key never leaves the server — the frontend only talks to your own backend.

---

## 📄 Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `PORT` | backend | Server port |
| `ADMIN_USERNAME` | backend | Admin login username |
| `ADMIN_PASSWORD_HASH` | backend | bcrypt hash of admin password |
| `JWT_SECRET` | backend | Secret for signing JWT tokens |
| `CUSTOMER_APP_URL` | backend | Customer app URL for QR generation |
| `GEMINI_API_KEY` | backend | Google Gemini API key |
| `VITE_API_URL` | all frontends | Backend base URL |
| `VITE_SOCKET_URL` | kitchen-panel | Backend Socket.IO URL |

---

## 👤 Author

**Ram Charan**
- GitHub: [@Ramcharan-40](https://github.com/Ramcharan-40)

---

> ⭐ If you found this project useful, consider giving it a star!
