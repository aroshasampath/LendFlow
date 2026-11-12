# LendFlow – Multi-User Loan Management System

LendFlow is an enterprise-grade, secure, mobile-first, full-stack MERN application designed for personal and peer-to-peer loan management, repayment tracking, immutable financial auditing, and real-time portfolio analytics across all device form factors.

---

## 📌 Project Status & Stage Checklist

- [x] **Stage 0: Workspace Inspection & Architectural Planning** *(Completed & Verified)*
- [x] **Stage 1: MongoDB Atlas Setup & Database Connection** *(Completed & Verified)*
- [x] **Stage 2: Project Architecture (Frontend & Backend Scaffolding)** *(Completed & Verified)*
- [x] **Stage 3: Responsive Design System (Mobile-First Foundation & Viewport QA)** *(Completed & Verified)*
- [x] **Stage 4: User Authentication & Security (MFA, JWT, Cookie Rotation)** *(Completed & Verified)*
- [x] **Stage 5: User Profiles & Privacy-Preserving User Search** *(Completed & Verified)*
- [x] **Stage 6: Loan Management (Lender/Borrower Lifecycle & State Machine)** *(Completed & Verified)*
- [x] **Stage 7: Repayment Management (Idempotency, Financial Audit Trail)** *(Completed & Verified)*
- [x] **Stage 8: Dashboard & Notification Engine (Real-Time Analytics)** *(Completed & Verified)*
- [x] **Stage 9: Fintech UI/UX Design System (Skeletons, Empty States, Breadcrumbs)** *(Completed & Verified)*
- [x] **Stage 10: User-Friendly Error Handling & Centralized Middleware (Zero-Leakage)** *(Completed & Verified)*
- [x] **Stage 11: Security Testing & STRIDE Threat Model Hardening** *(Completed & Verified)*
- [x] **Stage 12: Cross-Device Performance Optimization & Viewport QA** *(Completed & Verified)*
- [x] **Stage 13: Final Verification, Documentation & Production Readiness** *(Completed & Verified)*

---

## 🛠️ Technology Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Frontend** | React 19, Vite v8, Tailwind CSS v4, Lucide React, Recharts, React Router v6, Axios |
| **Backend** | Node.js (v20+ LTS), Express.js, Mongoose ODM, Helmet, CORS, Express-Rate-Limit, Cookie-Parser |
| **Authentication & Security** | JSON Web Tokens (Access + Rotated Refresh Tokens), Bcrypt.js (12 rounds), Speakeasy (TOTP 2FA), QRCode, Crypto |
| **Database** | MongoDB Atlas (Multi-tenant `lendflow` replica set cluster with strict least-privilege role) |
| **Architecture** | Clean Architecture / Service-Repository Pattern, Strict Minor Currency (Cents), STRIDE Threat Hardening |
| **Testing** | Automated Node.js native assert test suites across all 8 feature modules (67/67 automated tests passing) |

---

## 🏗️ System Architecture & Directory Overview

```text
LendFlow/
├── backend/
│   ├── config/
│   │   └── db.js                 # Resilient MongoDB Atlas connector with credential masking
│   ├── controllers/
│   │   ├── auth.controller.js    # Registration, login, MFA TOTP, refresh rotation, password recovery
│   │   ├── dashboard.controller.js # Financial metric aggregations, upcoming dues, overdue alerts
│   │   ├── loan.controller.js    # Proposal creation, bilateral acceptance/rejection/cancellation
│   │   ├── notification.controller.js # User notification querying, unread count, read markers
│   │   ├── repayment.controller.js # Installment submissions, lender confirmations, balance deductions
│   │   └── user.controller.js    # Private profile updates, privacy-preserving search, public views
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT verification, cookie parsing, active session validation
│   │   ├── errorHandler.js       # Zero-leakage centralized error mapper (CastError, 11000, JWT, 404)
│   │   └── rateLimiter.js        # Brute-force & DDoS protection for auth and recovery endpoints
│   ├── models/
│   │   ├── Loan.model.js         # Minor unit loan agreements with embedded immutable audit timeline
│   │   ├── Notification.model.js # Real-time notification records with action links
│   │   ├── Repayment.model.js    # Installment records with unique idempotencyKey indexes
│   │   └── User.model.js         # User identity with bcrypt hashing, TOTP secret & backup codes
│   ├── routes/
│   │   ├── auth.routes.js        # /api/auth routes
│   │   ├── dashboard.routes.js   # /api/dashboard routes
│   │   ├── loan.routes.js        # /api/loans routes
│   │   ├── notification.routes.js# /api/notifications routes
│   │   ├── repayment.routes.js   # /api/repayments routes
│   │   └── user.routes.js        # /api/users routes
│   ├── services/
│   │   └── notification.service.js # Automated notification dispatcher for financial events
│   ├── tests/
│   │   ├── auth.test.js          # Stage 4: Authentication, Bcrypt, JWT, Password recovery (9/9)
│   │   ├── user.test.js          # Stage 5: User profiles, privacy redactions, search (9/9)
│   │   ├── loan.test.js          # Stage 6: Loan lifecycle state machine, BOLA/IDOR (9/9)
│   │   ├── repayment.test.js     # Stage 7: Repayments, overpayment guards, idempotency (9/9)
│   │   ├── dashboard.test.js     # Stage 8: Dashboard metrics, overdue flags, notifications (8/8)
│   │   ├── errorHandler.test.js  # Stage 10: Zero-leakage error translation, CastError (8/8)
│   │   ├── securityAudit.test.js # Stage 11: STRIDE penetration tests & threat matrix (8/8)
│   │   └── viewportQA.test.js    # Stage 12: Cross-device viewport QA & code-splitting (7/7)
│   ├── utils/
│   │   ├── apiResponse.js        # Standardized JSON response envelope
│   │   └── money.js              # Integer minor currency (cents) math and formatters
│   ├── validators/
│   │   ├── auth.validator.js     # Input sanitization and strong password rules
│   │   └── loan.validator.js     # Loan proposal parameter validation
│   ├── .env.example              # Sanitized template for backend environment variables
│   ├── package.json
│   └── server.js                 # Main Express server configuration & route registration
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Badge.jsx             # Visual status badges (pending, active, overdue, etc.)
│   │   │   │   ├── Breadcrumbs.jsx       # Hierarchical navigation links for deep views
│   │   │   │   ├── Button.jsx            # Touch-friendly interactive buttons (>=44px)
│   │   │   │   ├── Card.jsx              # Universal fintech elevated container
│   │   │   │   ├── ConfirmModal.jsx      # Confirmation dialog for critical/destructive actions
│   │   │   │   ├── EmptyState.jsx        # Illustrated empty state with call-to-action buttons
│   │   │   │   ├── Input.jsx             # Accessible text & number inputs with clear focus rings
│   │   │   │   ├── Modal.jsx             # Mobile bottom-sheet drawer & desktop centered dialog
│   │   │   │   ├── ResponsiveTable.jsx   # Table-to-card auto-transformation below 768px
│   │   │   │   └── Skeleton.jsx          # Shimmer pulse loading placeholders (No-Jank UI)
│   │   │   ├── ErrorBoundary.jsx         # Global React crash safety catch with graceful fallback
│   │   │   ├── Footer.jsx                # Security badges and copyright footer
│   │   │   ├── Navbar.jsx                # Responsive header with notification drawer & mobile menu
│   │   │   ├── PageLoader.jsx            # Dynamic chunk suspense loading animation
│   │   │   ├── ProtectedRoute.jsx        # Client-side session and auth gatekeeper
│   │   │   └── Sidebar.jsx               # Collapsible desktop sidebar & mobile slide-out drawer
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # Global authentication state, JWT storage & session timers
│   │   │   └── NotificationContext.jsx   # Real-time notification polling & unread counter
│   │   ├── hooks/
│   │   │   └── useViewport.js            # Reactive viewport measurements & breakpoint detection
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx            # Universal responsive layout wrapper
│   │   ├── pages/
│   │   │   ├── ArchitecturePage.jsx      # Architectural documentation view
│   │   │   ├── CreateLoanPage.jsx        # Bilateral loan proposal creation wizard
│   │   │   ├── EditProfilePage.jsx       # Profile editing and avatar configuration
│   │   │   ├── ForgotPasswordPage.jsx    # Email-based password reset initiation
│   │   │   ├── HomePage.jsx              # Financial analytics dashboard & portfolio charts
│   │   │   ├── LoanDetailsPage.jsx       # Loan agreement detail, action panel & audit timeline
│   │   │   ├── LoginPage.jsx             # Credentials login & MFA verification challenge
│   │   │   ├── MyLoansPage.jsx           # Dual-role loan agreement management (Lender/Borrower)
│   │   │   ├── MyProfilePage.jsx         # Authenticated private identity view
│   │   │   ├── NotificationsPage.jsx     # Full notification center and history
│   │   │   ├── PublicProfilePage.jsx     # Privacy-preserving public profile view
│   │   │   ├── RegisterPage.jsx          # New user registration with password strength meter
│   │   │   ├── RepaymentsPage.jsx        # Installment submissions & lender confirmation panel
│   │   │   ├── ResetPasswordPage.jsx     # Single-use token password reset form
│   │   │   ├── ResponsiveDesignShowcase.jsx # Live interactive QA testing across all 8 viewports
│   │   │   ├── SecuritySettingsPage.jsx  # TOTP 2FA configuration, backup codes, password changes
│   │   │   ├── StatusPage.jsx            # Real-time system diagnostics & database latency test
│   │   │   └── UserSearchPage.jsx        # Privacy-preserving member search
│   │   ├── services/
│   │   │   └── api.js                    # Pre-configured Axios instance with intelligent error mapper
│   │   ├── utils/
│   │   │   └── formatters.js             # Currency formatting and date localization
│   │   ├── App.jsx                       # Lazy-loaded route architecture with Suspense
│   │   ├── index.css                     # Tailwind v4 theme, safe-area insets & touch targets
│   │   └── main.jsx                      # React application entrypoint
│   ├── .env.example                      # Template for frontend environment variables
│   ├── package.json
│   └── vite.config.js                    # Rolldown optimization, manualChunks & Tailwind v4 plugin
│
├── SECURITY_REPORT.md                    # Formal STRIDE Threat Model & Penetration Testing Report
├── .gitignore                            # Comprehensive credential & build exclusion rules
└── README.md                             # Master documentation & deployment guide
```

---

## 🔒 Key Architectural & Financial Safeguards

### 1. Integer Minor Currency Representation (Cents)
To eliminate IEEE-754 floating-point rounding errors common in monetary systems, all monetary values in LendFlow are stored strictly as **integer cents** (e.g., $\$1,500.50$ is stored as `150050`). Mathematical calculations occur on integer minor units; conversions to display strings occur strictly at the presentation boundary.

### 2. Dual-Role Bilateral State Machine
A user can simultaneously act as a **Lender** on some agreements and a **Borrower** on others. Agreements follow an enforced state machine:
```text
[Created] ──► PENDING ──► Borrower Accepts ──► ACTIVE ──► Fully Repaid ──► COMPLETED
                 │                                │
                 ├──────► Borrower Rejects ──► REJECTED   └──────► Past Due Date ──► OVERDUE
                 │
                 └──────► Lender Cancels   ──► CANCELLED
```

### 3. Idempotent Repayments & Overpayment Guards
- Every repayment submission accepts an optional or client-generated `idempotencyKey` backed by a MongoDB unique sparse index, preventing accidental duplicate charges upon network retries.
- Overpayment guard: Repayment requests exceeding the loan's `remainingBalance` are rejected before insertion.
- Repayments start as `pending` and **do not reduce loan balance** until the lender explicitly reviews and confirms receipt.

### 4. Zero-Leakage Security & Privacy Architecture
- **STRIDE Compliance**: Tested against Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege.
- **Default Projection Redaction**: Sensitive attributes (`password`, `emailVerificationToken`, `passwordResetToken`, `mfa.secret`, `mfa.backupCodes`, `refreshTokens`) have `select: false` in the Mongoose schema.
- **Privacy-Preserving Search**: Public user profiles strictly redact emails, phone numbers, and balances.
- **Account Enumeration Protection**: Registration, login, and password reset endpoints return uniform, non-distinguishing response messages for valid and invalid accounts.
- **Safe Error Handling**: Mongoose `CastError`, duplicate keys, and 500 exceptions are mapped to clean, user-friendly messages without exposing database internals or file paths.

### 5. Mobile-First Responsive Design System
- **Breakpoint Range**: Certified across 8 standard viewports from $320\text{px}$ (iPhone SE) up to $1920\text{px}+$ (4K displays).
- **Table-to-Card Transformation**: `<ResponsiveTable />` seamlessly renders standard desktop tables on screens $\ge 768\text{px}$ and automatically converts rows into stacked cards on mobile devices.
- **Touch Targets**: All interactive elements satisfy the $\ge 44\text{px} \times 44\text{px}$ minimum touch target standard.
- **Zero Horizontal Scrolling**: Controlled via `overflow-x: hidden`, flexible grids, and mobile bottom-sheet drawers.

### 6. Dynamic Route Code-Splitting
Using `React.lazy()` and `Suspense`, the frontend splits all 17 page views into separate on-demand bundles. The initial application shell is reduced to **$26.93\text{ kB}$** ($7.50\text{ kB}$ gzip), and heavy dependencies (such as Recharts) are only fetched when navigating to charts.

---

## 📡 REST API Reference

All requests accept and return JSON. Endpoints marked **🔒 Protected** require a valid JWT Access Token passed in the `Authorization: Bearer <token>` header or authenticated cookie.

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account with password strength validation. |
| `POST` | `/api/auth/login` | Public | Authenticate user; returns JWT or prompts for MFA challenge. |
| `POST` | `/api/auth/mfa/setup` | 🔒 Protected | Generate TOTP secret and QR code URI for authenticator apps. |
| `POST` | `/api/auth/mfa/verify` | 🔒 Protected | Verify initial TOTP token and issue 5 emergency backup codes. |
| `POST` | `/api/auth/mfa/disable` | 🔒 Protected | Disable 2FA after verifying current password and valid token. |
| `POST` | `/api/auth/refresh-token` | Public | Rotate refresh token stored in HttpOnly cookie; issue new access token. |
| `POST` | `/api/auth/logout` | 🔒 Protected | Invalidate refresh token and clear session cookies. |
| `POST` | `/api/auth/forgot-password`| Public | Request single-use password reset token via email. |
| `POST` | `/api/auth/reset-password` | Public | Reset password using valid single-use reset token. |
| `POST` | `/api/auth/change-password`| 🔒 Protected | Change password while authenticated (invalidates old sessions). |

### User Management Endpoints (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/me` | 🔒 Protected | Retrieve authenticated user's private identity details. |
| `PUT` | `/api/users/me` | 🔒 Protected | Update profile information (full name, phone, bio, avatar). |
| `GET` | `/api/users/search?q=...` | 🔒 Protected | Privacy-preserving user search by name, @username, or ID. |
| `GET` | `/api/users/profile/:id` | 🔒 Protected | Retrieve public profile with contact details redacted. |

### Loan Management Endpoints (`/api/loans`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/loans` | 🔒 Protected | Propose a new loan agreement (validates anti-self lending). |
| `GET` | `/api/loans` | 🔒 Protected | List user loans with role (`lender`/`borrower`) and status filters. |
| `GET` | `/api/loans/:id` | 🔒 Protected | Get loan details, audit timeline, and repayment schedule (BOLA checked). |
| `POST` | `/api/loans/:id/respond` | 🔒 Protected | Borrower accepts or rejects a pending loan proposal. |
| `POST` | `/api/loans/:id/cancel` | 🔒 Protected | Lender cancels an unaccepted pending loan proposal. |

### Repayment Endpoints (`/api/repayments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/repayments` | 🔒 Protected | Submit installment receipt (supports idempotency key). |
| `GET` | `/api/repayments` | 🔒 Protected | List repayments with pagination, loan, and role filters. |
| `PUT` | `/api/repayments/:id/confirm`| 🔒 Protected | Lender confirms receipt; atomically deducts remaining balance. |
| `PUT` | `/api/repayments/:id/reject` | 🔒 Protected | Lender rejects unverified repayment with reason notes. |

### Dashboard & Analytics Endpoints (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary` | 🔒 Protected | Aggregate portfolio totals, active counts, overdue alerts & upcoming due dates. |

### Notification Endpoints (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | 🔒 Protected | Retrieve paginated notifications and total unread count. |
| `PUT` | `/api/notifications/:id/read`| 🔒 Protected | Mark a single notification as read. |
| `PUT` | `/api/notifications/read-all`| 🔒 Protected | Mark all user notifications as read in bulk. |

### System Diagnostics Endpoints (`/api/health`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Check server uptime and live MongoDB Atlas replica set ping status. |

---

## 🚀 Quickstart & Local Development

### 1. Prerequisites
- **Node.js**: Version `20.x` or higher (`node -v`)
- **NPM**: Version `10.x` or higher (`npm -v`)
- **MongoDB Atlas**: A free or dedicated cluster connection string

### 2. Clone Repository & Setup
```bash
git clone https://github.com/aroshasampath98/LendFlow.git
cd LendFlow
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Edit `backend/.env` with your MongoDB connection string and generated JWT secrets:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.jivnnsp.mongodb.net/lendflow?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_super_secret_high_entropy_access_key_min_64_characters
JWT_REFRESH_SECRET=your_super_secret_high_entropy_refresh_key_min_64_characters
CLIENT_URL=http://localhost:5173
```
Start the backend server:
```bash
npm run dev
# Server running at http://localhost:5000
# Health check available at http://localhost:5000/api/health
```

### 4. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
cp .env.example .env
```
Start the Vite development server:
```bash
npm run dev
# Frontend running at http://localhost:5173
```

---

## 🧪 Automated Test Suite Execution

LendFlow features an automated integration and penetration test suite covering all functional modules. To execute the tests:

```bash
cd backend

# 1. User Authentication & MFA Tests (9 tests)
node tests/auth.test.js

# 2. User Profiles, Privacy Redaction & Search Tests (9 tests)
node tests/user.test.js

# 3. Loan Management & BOLA / IDOR Protection Tests (9 tests)
node tests/loan.test.js

# 4. Repayment Management, Idempotency & Overpayment Tests (9 tests)
node tests/repayment.test.js

# 5. Dashboard Analytics & Notification Engine Tests (8 tests)
node tests/dashboard.test.js

# 6. Zero-Leakage Error Handling & CastError Tests (8 tests)
node tests/errorHandler.test.js

# 7. STRIDE Threat Model & Security Penetration Tests (8 tests)
node tests/securityAudit.test.js

# 8. Cross-Device Viewport QA & Code-Splitting Tests (7 tests)
node tests/viewportQA.test.js

# Run All Tests Simultaneously (67 Tests)
npm test
```

---

## 📦 Production Deployment Guide

### 1. Build the Frontend
```bash
cd frontend
npm run build
# Compiles optimized static assets to frontend/dist/
```

### 2. Production Environment Settings
Ensure the following variables are configured in your production environment:
- `NODE_ENV=production`
- `PORT=5000` (or platform assigned port)
- `CLIENT_URL=https://your-domain.com`
- `MONGODB_URI`: Secure connection string with least-privilege database user.
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`: 256-bit cryptographically random strings.

### 3. Production Process Management (PM2)
```bash
npm install -g pm2
cd backend
pm2 start server.js --name "lendflow-api" -i max
pm2 save
pm2 startup
```

### 4. Sample Nginx Reverse Proxy Configuration
```nginx
server {
    listen 80;
    server_name lendflow.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name lendflow.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/lendflow.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lendflow.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Static Frontend
    root /var/www/lendflow/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔮 Future Roadmap & Enhancements

1. **Multi-Currency Real-Time Exchange Rates**: Automated foreign exchange rate integration (e.g., OpenExchangeRates) to convert balances across USD, EUR, LKR, and GBP.
2. **WebSockets Push Engine**: Replace background polling with Socket.io / SSE for instant sub-second notification badges and repayment confirmation alerts.
3. **PDF Legal Agreement Generation**: Export tamper-proof bilateral loan contracts with digital signature verification.
4. **Third-Party Payment Gateways**: Integration with Stripe / PayHere for instant digital card repayment settlements.

---

## 📄 License & Attribution

Developed by **Arosha Sampath** as an end-to-end full-stack MERN financial software platform.  
Released under the **MIT License**.
