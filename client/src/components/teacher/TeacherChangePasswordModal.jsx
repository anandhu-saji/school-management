import { useState } from "react";
import api from "../../api/axiosclient";

export default function TeacherChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", message: "" });

    if (!currentPassword) {
      setFeedback({ type: "error", message: "Please enter your current password." });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setFeedback({
        type: "error",
        message: "New custom password must be at least 6 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({
        type: "error",
        message: "New password and confirmation password do not match.",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await api.put("/teacher/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.data.success) {
        setFeedback({
          type: "success",
          message: res.data.message || "Password updated successfully!",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to update password. Please verify your current password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: "16px",
      }}
    >
      <div
        className="modal-content-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontSize: "17px", color: "#0f172a", fontWeight: "800" }}>
              <span>🔐</span> Customize Password
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
              Teaching Faculty SPARK &amp; Account Security
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Informative Alert about Default Primary Password */}
        <div
          style={{
            margin: "16px 20px 0",
            padding: "12px 14px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "10px",
            fontSize: "12.5px",
            color: "#1e40af",
            lineHeight: "1.5",
          }}
        >
          <strong>Notice:</strong> Your initial primary password was set to{" "}
          <code
            style={{
              background: "#dbeafe",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: "700",
            }}
          >
            Teacher@123
          </code>
          . Use the form below to customize it to a personal, secure password.
        </div>

        {feedback.message && (
          <div
            style={{
              margin: "14px 20px 0",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              background: feedback.type === "error" ? "#fee2e2" : "#dcfce7",
              color: feedback.type === "error" ? "#b91c1c" : "#15803d",
              border: feedback.type === "error" ? "1px solid #fecaca" : "1px solid #bbf7d0",
            }}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          {/* 1. Current Password */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: "700",
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              Current Password *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showCurrent ? "text" : "password"}
                required
                placeholder="Enter current password (Default: Teacher@123)"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 42px 10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13.5px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#64748b",
                  padding: "4px",
                }}
                title={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? "👁️" : "🙈"}
              </button>
            </div>
            <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
              Enter your current or default primary password to authenticate.
            </span>
          </div>

          {/* 2. New Custom Password */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: "700",
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              New Custom Password *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showNew ? "text" : "password"}
                required
                minLength={6}
                placeholder="Enter new custom password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 42px 10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13.5px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#64748b",
                  padding: "4px",
                }}
                title={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? "👁️" : "🙈"}
              </button>
            </div>
            <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
              Minimum 6 characters. Use letters, numbers, and symbols.
            </span>
          </div>

          {/* 3. Confirm Password */}
          <div style={{ marginBottom: "22px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: "700",
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              Confirm New Password *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                required
                placeholder="Re-enter new custom password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 42px 10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13.5px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#64748b",
                  padding: "4px",
                }}
                title={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              borderTop: "1px solid #f1f5f9",
              paddingTop: "16px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#475569",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#2563eb",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {loading ? "Updating..." : "Save Custom Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
