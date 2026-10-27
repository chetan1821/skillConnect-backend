# SkillConnect — Modern React Frontend

A modern, high-performance on-demand marketplace frontend built with **React 18**, **Vite**, and **Tailwind CSS**. Seamlessly connects to the FastAPI backend (`http://localhost:8000`) and includes an automatic mock fallback mode for standalone testing.

---

## ✨ Features

- **🛍️ Consumer Marketplace Portal**:
  - High-conversion hero section with interactive search by trade, keyword, and category.
  - Interactive service categories grid with real-time specialist counts and dynamic filtering.
  - Verified specialist profiles with ratings, reviews, experience years, and trust badges.
  - Interactive appointment scheduling modal with instant date/time selection.
  - Clean "How it Works" guide and responsive multi-column footer.

- **🛡️ Comprehensive Admin Operations Suite**:
  - Live platform KPI metrics (`/admin/dashboard`) displaying total users, active accounts, customers, and providers.
  - User management table with real-time text search, role filters, status filters, pagination, and instant activate/deactivate toggles (`PATCH /admin/users/{id}/status`).
  - Category manager with Add Category modal, edit modal, and soft-delete/deactivation.
  - Provider verification desk with one-click verification badge toggles and assigned skills review.

- **💼 Provider Portal**:
  - Provider dashboard with monthly revenue, completed jobs, and client ratings.
  - Direct customer booking appointments feed with Accept & Reschedule controls.

- **⚡ Instant Persona Switcher & Fast Test Credentials**:
  - Switch anytime between **Consumer View**, **Admin Suite**, and **Provider Portal** from the top header bar.
  - 1-click test credentials for Admin (`admin@skillconnect.com` / `Admin@123`), Provider, and Customer accounts.

- **🔄 Dual Connection Architecture**:
  - Live mode connects directly to FastAPI backend endpoints.
  - Instant mock mode allows seamless browsing and state changes even if the backend database is offline.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🔗 Backend Integration
The frontend proxies API requests to `http://localhost:8000`. To run the FastAPI backend alongside the frontend:

```bash
cd ../skillConnect-backend
.\venv\Scripts\uvicorn app.main:app --reload --port 8000
```

