import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./views/auth/login.jsx";
import ForgotPassword from "./views/auth/ForgotPassword.jsx";
import ResetPassword from "./views/auth/ResetPassword.jsx";
import AdminDashboard from "./views/admin/AdminDashboard.jsx";
import DivisionAttendance from "./views/admin/DivisionAttendance.jsx";
import TeachersRecords from "./views/admin/TeachersRecords.jsx";
import StudentsRecords from "./views/admin/StudentsRecords.jsx";
import ExamTimetables from "./views/admin/ExamTimetables.jsx";
import PaymentConsole from "./views/admin/PaymentConsole.jsx";
import TeacherDashboard from "./views/teacher/TeacherDashboard.jsx";
import Dashboard from "./views/student/Dashboard.jsx";
import { isSessionValid, getRoleDashboardPath, clearAuthSession } from "./utils/auth";

// Public route: If already logged in, route to role dashboard
function PublicRoute({ children }) {
  if (isSessionValid()) {
    let role = "student";
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        role = parsed.role || role;
      }
    } catch {
      // ignore JSON parse error
    }
    return <Navigate to={getRoleDashboardPath(role)} replace />;
  }
  return children;
}

// Protected route: Restrict by allowed roles
function ProtectedRoute({ children, allowedRoles }) {
  if (!isSessionValid()) {
    clearAuthSession();
    return <Navigate to="/login?session=expired" replace />;
  }

  if (allowedRoles) {
    let userRole = "student";
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        userRole = parsed.role || userRole;
      }
    } catch {
      return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to={getRoleDashboardPath(userRole)} replace />;
    }
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Forgot Password Flow */}
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* Student Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student", "user"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DivisionAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TeachersRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <StudentsRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/exams"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ExamTimetables />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PaymentConsole />
            </ProtectedRoute>
          }
        />

        {/* Teacher Dashboard */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
