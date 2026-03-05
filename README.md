# 🏛️ SOLVSTRAT PROD — Fore Case Management • CashFlow

A dynamic, production-ready **Legal-Fintech ERP** platform for managing cases, invoices, expenses, and AI-driven analytics.

![License](https://img.shields.io/badge/license-MIT-teal)
![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20Express%20%7C%20FastAPI-black)

---

## 🎨 Branding

| Token | Value | Usage |
|-------|-------|-------|
| **White** | `#FFFFFF` | Primary background |
| **Teal Green** | `#0D9488` / `#14B8A6` | Primary actions, buttons, profit indicators |
| **Black** | `#111827` | Typography, sidebar background |

---

## 📁 Project Structure

```
CashFlow/
├── .env                    # Root environment variables
├── frontend/               # Next.js (App Router) + Tailwind CSS
│   └── src/
│       ├── app/
│       │   ├── page.tsx            # Gated Landing (Login + Signup)
│       │   ├── (dashboard)/
│       │   │   ├── layout.tsx      # Dashboard layout w/ Sidebar
│       │   │   ├── dashboard/      # Bento Grid Dashboard
│       │   │   ├── cases/          # Kanban Board
│       │   │   ├── invoices/       # GST-ready Invoices
│       │   │   ├── expenses/       # Case-linked Expenses
│       │   │   ├── ai-reports/     # Profit Margin AI
│       │   │   └── team/           # Team Settings
│       │   └── globals.css         # Design System
│       └── components/
│           ├── Logo.tsx            # SVG Logo
│           ├── Sidebar.tsx         # Navigation
│           └── Topbar.tsx          # Header
│
├── backend-node/           # Express API
│   └── src/
│       ├── server.js              # API Server (JWT, RBAC, CRUD, GST)
│       └── models.js              # MongoDB Schemas
│
└── backend-python/         # FastAPI AI Service
    └── main.py                    # Profit Margin AI + Expense Analysis
```

---

## 🚀 Getting Started

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend — Node.js

```bash
cd backend-node
npm install
npm run dev
# → http://localhost:5000
```

### Backend — Python (AI)

```bash
cd backend-python
pip install -r requirements.txt
python main.py
# → http://localhost:8000
# Swagger Docs → http://localhost:8000/docs
```

---

## 🔐 Authentication & Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access — CRUD all entities, manage team |
| **Manager** | Case management, invoice creation, team oversight |
| **Staff** | Case-level access, expense logging, time tracking |

**Demo Login:** `admin@solvstart.com` (any password in demo mode)

**API Endpoints:**
- `POST /api/auth/login` — Sign in with email/password
- `POST /api/auth/signup` — Register new user with role

---

## 📊 Case Pipeline

```
New → Assigned → In Progress → Review → Closed
```

Every Expense and Time-log **MUST** link to a `CaseID`.

---

## 💰 Expense Module (Dynamic + GST)

**POST `/api/expenses`** — Auto-calculates GST (18%):
```json
{
  "caseId": "JF-2024-001",
  "amount": 12500,
  "category": "Court Filing",
  "description": "High Court filing fee"
}
```

**Response:**
```json
{
  "id": "EXP-003",
  "caseId": "JF-2024-001",
  "amount": 12500,
  "gstAmount": 2250,
  "totalWithGst": 14750,
  "category": "Court Filing",
  "status": "Pending"
}
```

---

## 🧠 Profit Margin AI

**Formula:** `Profit = Revenue - (Staff Cost per Hour × Total Hours + Expenses)`

**Risk Levels:**
- 🟢 **Low Risk:** Margin > 30%
- 🟡 **Medium Risk:** Margin 15-30%
- 🔴 **High Risk:** Margin < 15%

---

## 🔍 Dynamic Expense Analysis (Python AI)

**POST `/analyze/expense`** — Real-time profit impact analysis:

```json
// Request
{
  "caseId": "JF-2024-001",
  "amount": 150000,
  "category": "Expert Witness"
}

// Response
{
  "caseId": "JF-2024-001",
  "status": "success",
  "analysis": {
    "netProfitImpact": -177000.0,
    "marginChange": "-51.3%",
    "alert": "CRITICAL: Profit margin drops to -13.2% — below safe threshold",
    "suggestion": "Review Expert Witness costs. Consider renegotiating vendor rates."
  },
  "timestamp": "2026-02-23T10:30:00Z"
}
```

---

## 🔔 Notification System

Role-based alerts with priority levels:
- **High-risk financial alerts** → Highlighted in **Teal/Red** on dashboard
- **Overdue invoices** → Red alerts
- **Case deadlines** → Warning alerts

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Icons | Lucide React |
| Node API | Express.js, JWT, Mongoose |
| AI Engine | Python FastAPI, Pydantic |
| Database | MongoDB Atlas |
| Design | Bento Grid, Glassmorphic Cards |

---

## 📄 License

MIT License © 2026 SOLVSTRAT PROD
