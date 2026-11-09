# GHSS Student Portal &bull; Sampoorna 2.0

> **Government Higher Secondary School, Rajakkad (School Code: 06042)**  
> General Education Department, Government of Kerala  
> An institutional-grade full-stack School ERP and Academic Lifecycle Management Platform.

---

## 1. Project Overview

The **GHSS Student Portal** is a production-grade, state-level educational governance and academic management platform built specifically for GHSS Rajakkad under Kerala Sampoorna 2.0 standards. The platform coordinates the entire institutional lifecycle across all **4 academic wings** (LP School, UP School, High School, Higher Secondary) spanning **26 consolidated academic divisions**.

### Technology Architecture
- **Frontend SPA:** React 19, Vite 8, React Router v7, Axios with JWT Interceptors, `@react-oauth/google`
- **Backend API:** Node.js 24, Express 5, Mongoose 9, JWT Auth with Cookie/Header support, bcryptjs, Multer
- **Payment Gateway:** Razorpay SDK (Standard Checkout, HMAC SHA-256 signature verification, deterministic sandbox mode)
- **Database:** MongoDB with compound indexing, sparse unique keys, and TTL token expirations
- **Cloud & Microservices:** AWS S3 (with automatic local storage fallback), Nodemailer (6-digit OTP email recovery)
- **Deployment:** Multi-stage Docker, Docker Compose, Single-Port Production Mode via Express static hosting

---

## 2. A-to-Z Master Seeding & Dataset Inventory (Pin-to-Pin)

The database includes a comprehensive, real-world Kerala government school dataset seeded via `npm run seed`:

| Institutional Domain | Metric / Entity | Dataset Coverage | Key Details & Identifiers |
| :--- | :--- | :--- | :--- |
| **Academic Wings** | 4 Wings | 100% | LP School, UP School, High School, Higher Secondary |
| **Class Divisions** | 26 Divisions | 100% | Classes 1-A to 4-B, 5-A to 7-B, 8-A to 10-D, 11-Sci to 12-Com |
| **Student Roll** | 390 Students | 15 per class | Kerala names, unique `ADM-*` numbers, unique `SMP-06042-*` Sampoorna IDs, blood groups, addresses, parent contacts, masked Aadhaar |
| **Faculty Cadre** | 26 Mentors | 1 per class | SPARK PEN numbers (`849201`-`849248`), designations (HST, HSST, UPST, LPST), qualifications (M.Sc/B.Ed/SET), teaching allocations |
| **Daily Attendance** | 260 Registers | 10 past days | Multi-day attendance history for all 26 classes, realistic presence/absence/leave turnout, signed off by Headmaster |
| **Board Examinations** | 17 Timetables | All standards | SSLC State Board March 2027, Plus Two Public Exam, Half-Yearly, First Terminal schedules with QP codes |
| **Examination Seating** | Seating Plans | Active | Hall numbers (Halls 01-05), room numbers, candidate ranges, invigilator allocations with PEN |
| **Fee Transactions** | 105 Receipts | Multi-wing | Annual composite, bus pass, computer lab, PTA fund, model exam fees; Paid, Partial, and Pending dues |
| **Razorpay Payments** | Live Gateway | Integrated | Real & sandbox Razorpay Order IDs (`order_RP*`), Payment IDs (`pay_RP*`), and cryptographic signatures |
| **Internal Marks (CE)** | 7 Evaluation Sheets | Multi-subject | Continuous Evaluation (CE out of 20) and Written Exams (80 marks) with Kerala 9-point grading ($A^+$ to $E$) |

---

## 3. Demo Login Credentials

For quick evaluation and testing across all institutional user roles, use the credentials below:

| Role & Department | Email Address | Password | Access Scope & Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin (Headmaster)** | `admin@ghss.edu` | `Admin@123` | Full school administration, pupil census, staff records, exams, fee ledger, muster rolls |
| **Secondary Admin (Principal)** | `principal@ghss.edu` | `Admin@12345` | Higher secondary administration, executive oversight, academic reports |
| **Faculty Mentor (High School)** | `kathalanx@gmail.com` | `Teacher@123` | Class 10-A daily roll-call, KYC document reviews, Continuous Evaluation (CE) marks entry |
| **Quick Demo Teacher** | `teacher@ghss.edu` | `Teacher@123` | Secondary teacher login for rapid grading and attendance verification |
| **Faculty Mentor (Higher Secondary)** | `manoj.p@ghssrajakkad.kerala.gov.in` | `Teacher@123` | Class 12-Science physics lab records, Plus Two attendance, internal marks |
| **Student Scholar (High School)** | `student@ghss.edu` | `Student@123` | Class 10-A academic dashboard, hall ticket, fee ledger with active due & Razorpay checkout |
| **Student Scholar (Higher Secondary)**| `hss_student@ghss.edu` | `Student@123` | Class 12-Science portal, Plus Two board schedule, laboratory evaluation marks |

---

## 4. Quick Start & Setup Instructions

### Prerequisites
- Node.js v18+ (tested and verified on Node.js v24)
- MongoDB instance (local standalone `mongodb://localhost:27017` or MongoDB Atlas URI)
- Git

### Option A: Standard Local Development

1. **Install dependencies across root, server, and client:**
   ```bash
   npm run setup
   ```

2. **Configure environment variables:**
   - Copy `server/.env.example` to `server/.env`
   - Copy `client/.env.example` to `client/.env`

3. **Seed the database with all 26 divisions and master records:**
   ```bash
   npm run seed
   ```

4. **Start the development servers:**
   ```bash
   # Terminal 1: Backend API (Port 5000)
   npm run server

   # Terminal 2: Frontend Client (Port 5173)
   npm run client
   ```

5. **Access the portal:**
   - Client Web UI: `http://localhost:5173`
   - API Backend: `http://localhost:5000/api`
   - Health Probe: `http://localhost:5000/api/health`

---

### Option B: Single-Port Production Mode

To run both client and server as a single compiled production process on Port 5000:

```bash
# 1. Build the production React frontend bundle
npm run build

# 2. Start the unified production server
npm run start
```
*The Express server will automatically serve the built SPA from Port 5000 with client routing fallback.*

---

### Option C: Docker & Docker Compose Deployment

To deploy the entire stack including MongoDB in isolated containers:

```bash
# 1. Build and run containers
docker-compose up -d --build

# 2. View running containers
docker-compose ps

# 3. Access the portal at http://localhost:5000
```

---

## 5. Razorpay Online Payment Gateway Integration

The student portal features end-to-end integration with the Razorpay payment gateway:

1. **Online Order Generation:**
   - Endpoint: `POST /api/student/create-razorpay-order`
   - Dynamically calculates outstanding dues (e.g., ₹4,300 total pending or individual fee items).
   - Generates an official Razorpay Order ID in currency subunits (paise = ₹ $\times$ 100).

2. **Cryptographic Signature Verification:**
   - Endpoint: `POST /api/student/verify-razorpay-payment`
   - Verifies the HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET`.
   - Records the transaction in the database, updates student fee balance, marks status as `Paid`, and updates the admin payments ledger.

3. **Deterministic Sandbox / Offline Simulation Mode:**
   - When running in an offline or restricted testing sandbox where external CDN `checkout.js` cannot be reached, the UI presents an interactive test simulation button.
   - Exercises the exact same backend signature verification and MongoDB fee ledger update flow with zero external network dependency.

---

## 6. Page Architecture & Route Matrix

| Route Path | Page Title | Key Capabilities |
| :--- | :--- | :--- |
| `/login` | Unified Login Gateway | Role-based authentication, Google OAuth 2.0, 5-attempt brute-force protection (15-min lockout) |
| `/forgot-password` | Password Recovery | 6-digit OTP delivery via email with 5-minute security countdown |
| `/reset-password` | Password Reset | Token-based secure password reset with bcrypt hashing |
| `/admin/dashboard` | Admin Overview | Real-time student census, wing turnouts, faculty on duty, quick action launcher |
| `/admin/attendance` | Division Attendance | 26-division muster rolls, daily roll-call register modal with present/absent counters |
| `/admin/teachers` | Teachers Records | SPARK PEN tracking, cadre statistics, qualification dossier, weekly period allotment |
| `/admin/students` | Students Records | Pupil admission console, age validation, Sampoorna ID generation, Aadhaar masking, KYC files |
| `/admin/exams` | Exam Timetables | SSLC & Plus Two board schedules, halls, invigilator PEN resolver, seating plans |
| `/admin/payments` | Fee & Payment Console | Multi-category tuition/bus/PTA tracking, partial/full payment logging, Razorpay order IDs |
| `/teacher/dashboard` | Teacher Terminal | Class 10-A daily roll-call, KYC document reviews, CE internal marks (A+ to E), timetable |
| `/dashboard` | Student Portal | Morning schedule, notices, monthly attendance ledger, printable SSLC Hall Ticket, fee vouchers with Razorpay checkout |

---

## 7. Git Branch Organization for Submission

Dedicated feature branches have been created and synchronized for each major functional page and capability:

| Branch Name | Functional Scope |
| :--- | :--- |
| `Main` | Production-ready main branch containing all merged, fully tested code |
| `Week-three` | Active milestone development and consolidation branch |
| `feature/razorpay-integration` | Dedicated feature branch for Razorpay online payment integration |
| `page/login-auth` | Authentication subsystem (`/login`, `/forgot-password`, `/reset-password`) |
| `page/admin-dashboard` | Executive overview, live headcounts, and wing turnouts (`/admin/dashboard`) |
| `page/admin-attendance` | Division muster rolls and interactive attendance register (`/admin/attendance`) |
| `page/admin-teachers` | Faculty records, SPARK PEN numbers, age rules, and allotment (`/admin/teachers`) |
| `page/admin-students` | Student admissions, age limits, Sampoorna IDs, and KYC dossiers (`/admin/students`) |
| `page/admin-exams` | Board exam schedules, halls, invigilators, and seating plans (`/admin/exams`) |
| `page/admin-payments` | Fee ledger, multi-wing accounting, dues, and payment receipts (`/admin/payments`) |
| `page/teacher-portal` | Teacher terminal, daily roll-call, internal marks, and timetable (`/teacher/*`) |
| `page/student-portal` | Student self-service dashboard, hall ticket, and fee clearance (`/dashboard`) |

---

## 8. Regulatory & Security Compliance

1. **Kerala Pareeksha Bhavan 9-Point Grading:** Implements automated score-to-grade mapping ($A^+$, $A$, $B^+$, $B$, $C^+$, $C$, $D^+$, $E$, $AB$).
2. **Statutory Document Protection:** Route `/uploads/documents` enforces JWT authentication to prevent unauthenticated access to Aadhaar and birth certificate files.
3. **Account Security:** 5 consecutive failed login attempts trigger an automatic 15-minute lockout.
4. **Session Management:** Client automatically evicts expired sessions after 1 hour and redirects to login.
5. **Real Human Name Validation:** Strict regex rules prohibit numbers, special symbols, and synthetic test names across all input fields.
6. **Zero Emojis:** Strictly professional, government-compliant UI typography and badges (`₹`, `✓`, `•`) with zero conversational emojis.

---

*(c) 2026 Government Higher Secondary School Rajakkad &bull; General Education Department, Govt. of Kerala*
