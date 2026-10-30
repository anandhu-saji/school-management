// Stores session info with expiration timestamp
export function saveAuthSession(token, user, expiresInMs = 60 * 60 * 1000) {
  const expiresAt = Date.now() + expiresInMs;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("session_expires_at", String(expiresAt));
}

// Clears session storage
export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("session_expires_at");
}

// Returns true if session exists and has NOT passed expiration
export function isSessionValid() {
  const token = localStorage.getItem("token");
  const expiresAt = Number(localStorage.getItem("session_expires_at"));

  if (!token || !expiresAt) {
    clearAuthSession();
    return false;
  }

  if (Date.now() > expiresAt) {
    clearAuthSession();
    return false;
  }

  return true;
}

// Determines the correct dashboard route based on user role
export function getRoleDashboardPath(role) {
  const cleanRole = (role || "").toLowerCase();
  switch (cleanRole) {
    case "admin":
      return "/admin/dashboard";
    case "teacher":
      return "/teacher/dashboard";
    case "student": // <-- MISSING: Explicit student route resolution
    case "user":
    default:
      return "/dashboard";
  }
}