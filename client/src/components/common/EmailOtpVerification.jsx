import { useState, useEffect } from "react";
import api from "../../api/axiosclient";

export default function EmailOtpVerification({
  email,
  purpose = "student_admission", // "student_admission" | "teacher_registration"
  isVerified,
  setIsVerified,
  disabled = false,
}) {
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Timer countdown
  useEffect(() => {
    if (!otpSent || timeLeft <= 0 || isVerified) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpSent, timeLeft, isVerified]);

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!email || !email.trim()) {
      setFeedback({ type: "error", message: "Please enter an email address first." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFeedback({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    try {
      setLoading(true);
      setFeedback({ type: "", message: "" });
      const res = await api.post("/auth/send-registration-otp", {
        email: email.trim(),
        purpose,
      });

      if (res.data.success) {
        setOtpSent(true);
        setTimeLeft(300);
        if (res.data.devOtp) {
          setOtpCode(res.data.devOtp);
        } else {
          setOtpCode("");
        }
        setFeedback({
          type: "success",
          message: res.data.devOtp
            ? `Verification code (${res.data.devOtp}) sent to ${email.trim()}.`
            : `Verification code dispatched to ${email.trim()}.`,
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to dispatch verification code.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setFeedback({ type: "error", message: "Please enter the complete 6-digit OTP code." });
      return;
    }

    try {
      setLoading(true);
      setFeedback({ type: "", message: "" });
      const res = await api.post("/auth/verify-registration-otp", {
        email: email.trim(),
        otp: otpCode.trim(),
        purpose,
      });

      if (res.data.success) {
        setIsVerified(true);
        setOtpSent(false);
        setFeedback({
          type: "success",
          message: "Email verified successfully! ✓",
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Invalid or expired OTP code.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset verification if user changes email
  const handleReset = () => {
    setIsVerified(false);
    setOtpSent(false);
    setOtpCode("");
    setTimeLeft(300);
    setFeedback({ type: "", message: "" });
  };

  if (disabled) return null;

  return (
    <div style={{ marginTop: "6px" }}>
      {isVerified ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              background: "#dcfce7",
              color: "#15803d",
              border: "1px solid #86efac",
              borderRadius: "6px",
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span>✓</span> Email Verified with 6-Digit OTP
          </span>
          <button
            type="button"
            onClick={handleReset}
            style={{
              fontSize: "11px",
              color: "#64748b",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Change Email
          </button>
        </div>
      ) : (
        <div>
          {!otpSent ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || !email}
                style={{
                  background: email ? "#1e40af" : "#94a3b8",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: email && !loading ? "pointer" : "not-allowed",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {loading ? "Sending OTP..." : "Verify Email with OTP"}
              </button>
              <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                Required before creating account
              </span>
            </div>
          ) : (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  style={{
                    width: "150px",
                    letterSpacing: "4px",
                    fontWeight: "700",
                    fontSize: "15px",
                    textAlign: "center",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #94a3b8",
                  }}
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || otpCode.length !== 6}
                  style={{
                    background: otpCode.length === 6 ? "#16a34a" : "#94a3b8",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "7px 14px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: otpCode.length === 6 && !loading ? "pointer" : "not-allowed",
                  }}
                >
                  {loading ? "Checking..." : "Verify Code"}
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || timeLeft > 240}
                  style={{
                    background: "none",
                    border: "none",
                    color: timeLeft <= 240 ? "#2563eb" : "#94a3b8",
                    fontSize: "11.5px",
                    cursor: timeLeft <= 240 && !loading ? "pointer" : "default",
                    textDecoration: "underline",
                  }}
                >
                  {timeLeft > 240 ? `Resend in ${formatTime(timeLeft)}` : "Resend OTP"}
                </button>
                <span style={{ fontSize: "11px", color: timeLeft < 60 ? "#dc2626" : "#64748b", fontWeight: "600" }}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          )}

          {feedback.message && (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "11.5px",
                color: feedback.type === "error" ? "#dc2626" : "#16a34a",
                fontWeight: "600",
              }}
            >
              {feedback.type === "error" ? "" : "✓ "}
              {feedback.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
