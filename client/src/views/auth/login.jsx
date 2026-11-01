import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../../api/axiosclient";
import { saveAuthSession, getRoleDashboardPath } from "../../utils/auth";
import "./../../Styles/login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [connectionMessage, setConnectionMessage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("session") === "expired"
      ? "Your session expired after 1 hour. Please log in again."
      : "";
  });
  const [isLoading, setIsLoading] = useState(false);

  const [lockoutModal, setLockoutModal] = useState({
    isOpen: false,
    message: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("session") === "expired") {
      setConnectionMessage(
        "Your session expired after 1 hour. Please log in again."
      );
    }
  }, [location.search]);

  async function handleSignIn(e) {
    e.preventDefault();
    setConnectionMessage("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
      });

      if (response.data.success === true) {
        saveAuthSession(
          response.data.token,
          response.data.user,
          response.data.expiresInMs || 60 * 60 * 1000
        );

        setConnectionMessage("Login successful! Redirecting...");
        const targetPath = getRoleDashboardPath(response.data.user.role);
        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 400);
      }
    } catch (error) {
      console.error("Login error:", error);
      const data = error.response?.data;

      if (data?.isLocked) {
        setLockoutModal({
          isOpen: true,
          message:
            data.message ||
            "You have entered wrong details 5 times. Your account has been temporarily blocked for 1 hour.",
        });
      } else {
        setConnectionMessage(
          data?.message || "Invalid credentials. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setConnectionMessage("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      if (response.data.success === true) {
        saveAuthSession(
          response.data.token,
          response.data.user,
          response.data.expiresInMs || 60 * 60 * 1000
        );

        setConnectionMessage("Google login successful! Redirecting...");
        const targetPath = getRoleDashboardPath(response.data.user.role);
        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 400);
      }
    } catch (error) {
      console.error("Google authentication error:", error);
      setConnectionMessage(
        error.response?.data?.message || "Google authentication failed."
      );
    } finally {
      setIsLoading(false);
    }
  }

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
        <form onSubmit={handleSignIn}>
          <label htmlFor="email">Email Address</label>
          <div className="input-box">
            <span className="input-icon">✉</span>
            <input
              id="email"
              type="email"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="input-box">
            <span className="input-icon">♙</span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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

          <div className="form-options">
            <label className="remember-option">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="sign-in-button" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
            {!isLoading && <span> →</span>}
          </button>

          {connectionMessage && (
            <p
              role="status"
              aria-live="polite"
              style={{
                marginTop: "12px",
                color: connectionMessage.includes("successful")
                  ? "#087c54"
                  : "#d32f2f",
                fontSize: "13px",
                textAlign: "center",
              }}
            >
              {connectionMessage}
            </p>
          )}

          <div className="divider">
            <span>OR CONNECT WITH</span>
          </div>

          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setConnectionMessage("Google login popup failed or was closed.")
              }
              theme="outline"
              shape="rectangular"
              text="signin_with"
            />
          </div>
        </form>
      </div>

      {lockoutModal.isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(11, 31, 58, 0.65)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "26px",
              borderRadius: "14px",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "#ffebe6",
                color: "#de350b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                margin: "0 auto 14px",
              }}
            >
              🔒
            </div>
            <h3 style={{ margin: "0 0 10px", color: "#bf2600", fontSize: "18px" }}>
              Access Blocked
            </h3>
            <p style={{ margin: "0 0 20px", color: "#505f79", fontSize: "13px", lineHeight: 1.5 }}>
              {lockoutModal.message}
            </p>
            <button
              type="button"
              onClick={() => setLockoutModal({ isOpen: false, message: "" })}
              style={{
                width: "100%",
                padding: "10px",
                background: "#1c385f",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Understood
            </button>
          </div>
        </div>
      )}

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

export default Login;