import { useState } from "react";
import { useNavigate, useLocation, Link, Navigate } from "react-router-dom";
import api from "../../api/axiosclient";
import "./../../Styles/login.css";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const otp = location.state?.otp;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  if (!email || !otp) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ text: "", isError: false });

    if (newPassword.length < 6) {
      setMessage({ text: "Password must be at least 6 characters long.", isError: true });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: "Passwords do not match. Please re-enter.", isError: true });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      if (response.data.success) {
        setMessage({
          text: "Password updated successfully! Redirecting to login...",
          isError: false,
        });
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1200);
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Failed to reset password. Please try again.",
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <div className="university-logo">
          <div className="shield">⚝</div>
          <span className="verified">✿</span>
        </div>
        <p className="university-name">STATE UNIVERSITY</p>
        <h1>Campus Gateway</h1>
      </div>

      <div className="login-card">
        <div className="auth-card-heading">
          <h2>Change Password</h2>
          <p>
            Create a new password for <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleResetPassword}>
          <label htmlFor="newPassword">New Password</label>
          <div className="input-box">
            <span className="input-icon">♙</span>
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="eye-button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "◉" : "◎"}
            </button>
          </div>

          <label htmlFor="confirmPassword">Confirm New Password</label>
          <div className="input-box">
            <span className="input-icon">✓</span>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="sign-in-button" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Password →"}
          </button>

          {message.text && (
            <p
              className={`auth-status-message ${
                message.isError ? "status-error" : "status-success"
              }`}
            >
              {message.text}
            </p>
          )}

          <div className="back-to-login-row">
            <Link to="/login" className="back-to-login-link">
              ← Cancel &amp; Back to Sign In
            </Link>
          </div>
        </form>
      </div>

      <footer className="login-footer">
        <a href="#privacy">Privacy</a>
        <span>•</span>
        <a href="#terms">Terms</a>
        <span>•</span>
        <a href="#help">Help</a>
      </footer>
    </div>
  );
}

export default ResetPassword;