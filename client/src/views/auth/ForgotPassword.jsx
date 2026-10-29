import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Styles/ForgotPassword.css";

const OTP_TOTAL_DURATION = 120; // 5 minutes (in seconds)
const RESEND_AVAILABLE_AT = 30; // 4.5 minutes elapsed = 30s remaining

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility toggle states
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [timeLeft, setTimeLeft] = useState(OTP_TOTAL_DURATION);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (step !== 2 || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email: email.trim(),
      });

      if (res.data.success) {
        setTimeLeft(OTP_TOTAL_DURATION);
        setSuccessMessage("Verification code has been dispatched to your email.");
        setStep(2);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to dispatch recovery code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      setIsLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email: email.trim(),
      });

      if (res.data.success) {
        setTimeLeft(OTP_TOTAL_DURATION);
        setOtp("");
        setSuccessMessage("A fresh verification code has been dispatched.");
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Could not resend verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (timeLeft <= 0) {
      setErrorMessage("This code has expired. Please request a new one.");
      return;
    }

    if (otp.length !== 6) {
      setErrorMessage("Please provide the full 6-digit verification code.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: email.trim(),
        otp: otp.trim(),
      });

      if (res.data.success) {
        setSuccessMessage("Code verified! Set your new password.");
        setStep(3);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });

      if (res.data.success) {
        setSuccessMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Password reset failed. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const canResend = timeLeft <= RESEND_AVAILABLE_AT;

  // Inline SVG Eye & EyeOff Icons
  const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <div className="auth-page-container">
      <div className="auth-header">
        <div className="auth-logo-badge">⭐</div>
        <p className="auth-subtitle">State University</p>
        <h1 className="auth-title">Campus Gateway</h1>
      </div>

      <div className="auth-card">
        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <h2 className="card-heading">Forgot Password</h2>
            <p className="card-description">
              Enter your registered email to receive a 6-digit recovery code.
            </p>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {errorMessage && <p className="feedback-error">{errorMessage}</p>}
            {successMessage && <p className="feedback-success">{successMessage}</p>}

            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? "Sending..." : "Send OTP →"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <h2 className="card-heading">Enter Verification Code</h2>
            <p className="card-description">
              A 6-digit code was sent to <strong>{email}</strong>
            </p>

            <div className="form-group">
              <input
                type="text"
                maxLength="6"
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                disabled={timeLeft <= 0 || isLoading}
                className="otp-box-input"
                autoFocus
              />
            </div>

            <div className="timer-wrapper">
              {timeLeft > 0 ? (
                <span className={timeLeft <= 30 ? "timer-warning" : "timer-active"}>
                  Expires in: {formatTime(timeLeft)}
                </span>
              ) : (
                <span className="timer-expired">Code expired. Please request a new one.</span>
              )}
            </div>

            {errorMessage && <p className="feedback-error">{errorMessage}</p>}
            {successMessage && <p className="feedback-success">{successMessage}</p>}

            <button
              type="submit"
              disabled={otp.length !== 6 || timeLeft <= 0 || isLoading}
              className="btn-primary"
            >
              {isLoading ? "Verifying..." : "Verify Code →"}
            </button>

            <div className="resend-container">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="resend-button"
                >
                  Resend OTP
                </button>
              ) : (
                <span className="resend-wait-text">
                  Resend available in {timeLeft - RESEND_AVAILABLE_AT}s
                </span>
              )}
            </div>
          </form>
        )}

        {/* Step 3: Set New Password with Eye Toggle Buttons */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <h2 className="card-heading">Reset Password</h2>
            <p className="card-description">
              Enter and confirm your new account password below.
            </p>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="password-field-input"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  tabIndex="-1"
                  aria-label="Toggle password visibility"
                >
                  {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="password-field-input"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  tabIndex="-1"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {errorMessage && <p className="feedback-error">{errorMessage}</p>}
            {successMessage && <p className="feedback-success">{successMessage}</p>}

            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? "Updating..." : "Update Password →"}
            </button>
          </form>
        )}

        <div className="footer-link-group">
          <Link to="/login" className="back-to-login">
            ← Back to Sign In
          </Link>
        </div>
      </div>

      <footer className="page-legal-footer">
        <Link to="#" className="legal-item">Privacy</Link>
        <span style={{ color: "#cbd5e1" }}>•</span>
        <Link to="#" className="legal-item">Terms</Link>
        <span style={{ color: "#cbd5e1" }}>•</span>
        <Link to="#" className="legal-item">Help</Link>
      </footer>
    </div>
  );
}