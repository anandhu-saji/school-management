import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./views/auth/login.jsx";
import ForgotPassword from "./views/auth/ForgotPassword.jsx";
import ResetPassword from "./views/auth/ResetPassword.jsx";
import AdminDashboard from "./views/admin/AdminDashboard.jsx";
import TeacherDashboard from "./views/teacher/TeacherDashboard.jsx";
import Dashboard from "./views/student/Dashboard.jsx";
import { isSessionValid, getRoleDashboardPath, clearAuthSession } from "./utils/auth";

// Public route: If already logged in, route to role dashboard
function PublicRoute({ children }) {
  if (isSessionValid()) {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return <Navigate to={getRoleDashboardPath(user.role)} replace />;
    } catch {
      return <Navigate to="/dashboard" replace />;
    }
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
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!allowedRoles.includes(user.role)) {
        return <Navigate to={getRoleDashboardPath(user.role)} replace />;
      }
    } catch {
      return <Navigate to="/login" replace />;
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
            <ProtectedRoute allowedRoles={["user"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
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