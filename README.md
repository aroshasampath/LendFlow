# LendFlow – Multi-User Loan Management System

LendFlow is a secure, responsive, full-stack MERN application for managing personal and peer-to-peer loans, tracking repayment schedules, maintaining financial audit records, and visualizing lending portfolios across all device form factors.

---

## Project Status & Stage Checklist

- [x] **Stage 0: Workspace Inspection & Architectural Planning** *(Completed)*
- [x] **Stage 1: MongoDB Atlas Setup & Database Connection** *(Completed & Verified)*
- [x] **Stage 2: Project Architecture (Frontend & Backend Scaffolding)** *(Completed & Verified)*
- [x] **Stage 3: Responsive Design System (Mobile-First Foundation & Viewport QA)** *(Completed & Verified)*
- [x] **Stage 4: User Authentication & Security (MFA, JWT, Rotation)** *(Completed & Verified)*
- [x] **Stage 5: User Profiles & Privacy-Preserving User Search** *(Completed & Verified)*
- [x] **Stage 6: Loan Management (Lender/Borrower Lifecycle & State Machine)** *(Completed & Verified)*
- [x] **Stage 7: Repayment Management (Idempotency, Financial Audit Trail)** *(Completed & Verified)*
- [ ] **Stage 8: Dashboard & Notification Engine**
- [ ] **Stage 3: Responsive Design System & Layout Foundation**
- [ ] **Stage 4: User Authentication & Security (MFA, JWT, Rotation)**
- [ ] **Stage 5: User Profiles & Privacy-Preserving User Search**
- [ ] **Stage 6: Loan Management (Lender/Borrower Lifecycle & State Machine)**
- [ ] **Stage 7: Repayment Management (Idempotency, Financial Audit Trail)**
- [ ] **Stage 8: Dashboard & Notification Engine**
- [ ] **Stage 9: Fintech UI/UX Design System & Interactive Pages**
- [ ] **Stage 10: User-Friendly Error Handling & Centralized Middleware**
- [ ] **Stage 11: Security Testing & STRIDE Threat Model Hardening**
- [ ] **Stage 12: Cross-Device Performance Optimization & Viewport QA**
- [ ] **Stage 13: Final Verification, Documentation & Production Readiness**

---

## Technology Stack

- **Frontend**: React 18 / Vite, Tailwind CSS, Lucide React, Recharts, React Hook Form, Axios, React Router v6.
- **Backend**: Node.js (v20+), Express.js, Mongoose ODM, JWT, Helmet, CORS, Express-Rate-Limit.
- **Database**: MongoDB Atlas (Dedicated `lendflow` database with least-privilege role).

---

## Directory Overview

```text
LendFlow/
├── backend/
│   ├── config/          # Database & environment configurations
│   ├── controllers/     # Route logic & request coordinators
│   ├── middleware/      # Auth, rate-limiting, error handling
│   ├── models/          # Mongoose schemas with strict validation
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic & financial calculations
│   ├── validators/      # Input sanitization & schema validation
│   ├── utils/           # Shared helper functions & formatters
│   └── tests/           # Automated integration & unit tests
├── frontend/
│   ├── src/
│   │   ├── assets/      # Static media & brand assets
│   │   ├── components/  # Reusable UI elements (cards, buttons, modals)
│   │   ├── context/     # Auth & notification global state
│   │   ├── hooks/       # Custom React hooks
│   │   ├── layouts/     # Responsive layout wrappers
│   │   ├── pages/       # Application views
│   │   ├── services/    # Axios API client modules
│   │   └── utils/       # Formatting, date & currency helpers
└── README.md
```

