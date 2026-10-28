// Stores session info with an explicit 1-hour expiration timestamp
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

// Returns true if session exists and has NOT passed 1 hour
export function isSessionValid() {
  const token = localStorage.getItem("token");
  const expiresAt = Number(localStorage.getItem("session_expires_at"));

  if (!token || !expiresAt) {
    clearAuthSession();
    return false;
  }

  // If more than 1 hour has elapsed since login
  if (Date.now() > expiresAt) {
    clearAuthSession();
    return false;
  }

  return true;
}

// Determines the correct dashboard route based on user role
export function getRoleDashboardPath(role) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "teacher":
      return "/teacher/dashboard";
    case "user":
    default:
      return "/dashboard";
  }
}