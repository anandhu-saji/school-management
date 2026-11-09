# GHSS Student Portal &bull; Sampoorna 2.0

> **Government Higher Secondary School, Rajakkad (School Code: 06042)**  
> General Education Department, Government of Kerala  
> An institutional-grade full-stack School ERP and Academic Lifecycle Management Platform.

---

## 1. Project Overview

The **GHSS Student Portal** is an integrated academic management system developed for GHSS Rajakkad under the Kerala Sampoorna 2.0 standards. The system unifies school governance across all **4 academic wings** (LP School, UP School, High School, and Higher Secondary) spanning **26 consolidated academic divisions**.

### Technology Stack
- **Frontend:** React 19, Vite 8, React Router v7, Axios, `@react-oauth/google`
- **Backend:** Node.js 24, Express 5, Mongoose 9, JWT, bcryptjs, Multer
- **Database:** MongoDB with compound indexing and TTL auto-expirations
- **Services:** AWS S3 (with automatic local storage fallback), Nodemailer (6-digit OTP verification)

---

## 2. Demo Login Credentials

For quick evaluation, click the demo role buttons on the login page or use the credentials below:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Chief Admin (Headmaster)** | `admin@ghss.edu` | `Admin@12345` | Full administrative console, census, staff, student admissions, exams, fees |
| **Faculty Mentor (Teacher)** | `kathalanx@gmail.com` | `Teacher@123` | Class 10-A daily roll-call, KYC inspection, CE marks entry, timetable |
| **Student Scholar** | `student@ghss.edu` | `Student@123` | Academic dashboard, attendance ledger, SSLC hall ticket, fee receipts |

---

## 3. Quick Start & Setup Instructions

### Prerequisites
- Node.js v18+ (tested on Node.js v24)
- MongoDB running locally on `mongodb://localhost:27017` or MongoDB Atlas URI

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd "School  portal"
   ```

2. **Install dependencies:**
   ```bash
   # Root workspace
   npm install

   # Client dependencies
   cd client && npm install && cd ..

   # Server dependencies
   cd server && npm install && cd ..
   ```

3. **Configure Environment Variables:**
   - `server/.env`:
     ```env
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/ghss_student_portal
     JWT_SECRET=super_secret_school_portal_key_2026
     JWT_EXPIRES_IN=7d
     GOOGLE_CLIENT_ID=32761059022-844p29bnje7l77fh1cb1hpavlq72h07u.apps.googleusercontent.com
     EMAIL_USER=sajianandhu043@gmail.com
     EMAIL_PASS=pvlhamnnpqfwenzs
     RAZORPAY_KEY_ID=rzp_test_school_gateway_2026
     RAZORPAY_KEY_SECRET=rzp_test_secret_key_2026
     ```
   - `client/.env`:
     ```env
     VITE_API_URL=http://localhost:5000/api
     VITE_GOOGLE_CLIENT_ID=32761059022-844p29bnje7l77fh1cb1hpavlq72h07u.apps.googleusercontent.com
     VITE_RAZORPAY_KEY_ID=rzp_test_school_gateway_2026
     ```

4. **Seed the Database with Baseline Records:**
   ```bash
   npm run seed
   ```

5. **Start Development Servers:**
   ```bash
   # Start backend API (Port 5000)
   npm run server

   # Start frontend client (Port 5173) in a new terminal
   npm run client
   ```

---

## 4. Page Architecture & Routing Matrix

| Route Path | Page Title | Key Capabilities |
| :--- | :--- | :--- |
| `/login` | Unified Login Gateway | Credentials login, Google OAuth 2.0, 5-attempt brute-force protection (15-min lockout) |
| `/forgot-password` | Password Recovery | 6-digit OTP delivery via email with 5-minute security countdown |
| `/reset-password` | Reset Password | Verifies reset token and updates bcrypt password hash |
| `/admin/dashboard` | Admin Overview | Real-time pupil census, wing turnouts, faculty on duty, quick action launcher |
| `/admin/attendance` | Division Attendance | 26-division muster rolls, daily roll-call register modal with present/absent counters |
| `/admin/teachers` | Teachers Records | SPARK PEN tracking, cadre statistics, qualification dossier, weekly period allotment |
| `/admin/students` | Students Records | Pupil admission console, age validation, Sampoorna ID generation, Aadhaar masking, KYC files |
| `/admin/exams` | Exam Timetables | SSLC schedule management, hall allocations, invigilator PEN resolver, seating plan generator |
| `/admin/payments` | Fee & Payment Console | Multi-category tuition/bus/PTA tracking, partial/full payment logging, receipt generation |
| `/teacher/dashboard` | Teacher Terminal | Class 10-A daily roll-call, KYC document reviews, CE internal marks (A+ to E), timetable |
| `/dashboard` | Student Portal | Morning schedule, notices, monthly attendance ledger, printable SSLC Hall Ticket, fee vouchers |

---

## 5. Git Branch Structure for Submission

In accordance with project submission guidelines, dedicated feature branches have been created for each major page and functional subsystem:

- `Main` &bull; Primary production-ready branch containing all merged, fully tested code.
- `Week-three` &bull; Active consolidation branch with zero-emoji clean UI and full validations.
- `page/login-auth` &bull; Authentication pages (`/login`, `/forgot-password`, `/reset-password`).
- `page/admin-dashboard` &bull; Executive overview, live headcounts, and wing turnouts (`/admin/dashboard`).
- `page/admin-attendance` &bull; Division muster rolls and interactive attendance register (`/admin/attendance`).
- `page/admin-teachers` &bull; Faculty records, SPARK PEN numbers, age rules, and allotment (`/admin/teachers`).
- `page/admin-students` &bull; Student admissions, age limits, Sampoorna IDs, and KYC dossiers (`/admin/students`).
- `page/admin-exams` &bull; SSLC Board exam schedules, halls, and seating plans (`/admin/exams`).
- `page/admin-payments` &bull; Fee ledger, multi-wing accounting, dues, and payment receipts (`/admin/payments`).
- `page/teacher-portal` &bull; Teacher terminal, daily roll-call, internal marks, and timetable (`/teacher/*`).
- `page/student-portal` &bull; Student self-service dashboard, hall ticket, and fee vouchers (`/dashboard`).

---

## 6. Regulatory & Security Standards

1. **Kerala Pareeksha Bhavan 9-Point Grading:** Implements automated score-to-grade mapping ($A^+$, $A$, $B^+$, $B$, $C^+$, $C$, $D^+$, $E$, $AB$).
2. **Statutory Document Protection:** Route `/uploads/documents` requires valid JWT token authentication to prevent unauthenticated access to Aadhaar and birth certificate proofs.
3. **Account Security:** 5 failed login attempts trigger an automatic 15-minute lockout.
4. **Session Management:** Client automatically evicts expired sessions after 1 hour and redirects to login.
5. **Real Human Name Validation:** Strict regex rules prohibit numbers, special symbols, and gibberish names across all forms.

---

*(c) 2026 Government Higher Secondary School Rajakkad &bull; General Education Department, Govt. of Kerala*
