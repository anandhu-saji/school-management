import { useState } from "react";
import api from "../../api/axiosclient";

export default function StudentChangePasswordModal({ isOpen, onClose }) {
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
      const res = await api.put("/student/change-password", {
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
          "Failed to update password. Please verify current password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-modal-overlay" onClick={onClose}>
      <div
        className="student-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "480px" }}
      >
        <div className="student-modal-header">
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <span>🔐</span> Customize Password
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
              Student Scholar Security &amp; Credentials
            </p>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close modal">
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
            Student@123
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
              background: feedback.type === "success" ? "#dcfce7" : "#fee2e2",
              color: feedback.type === "success" ? "#15803d" : "#b91c1c",
              border: `1px solid ${feedback.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            }}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          {/* Current Password */}
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
              Current Password (Primary: Student@123)
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
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
                }}
                aria-label="Toggle password visibility"
              >
                {showCurrent ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* New Custom Password */}
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
              New Custom Password (Min. 6 characters)
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new custom password"
                required
                minLength={6}
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
                }}
                aria-label="Toggle password visibility"
              >
                {showNew ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: "700",
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              Confirm New Custom Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new custom password"
                required
                minLength={6}
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
                }}
                aria-label="Toggle password visibility"
              >
                {showConfirm ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              borderTop: "1px solid #e2e8f0",
              paddingTop: "16px",
            }}
          >
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#1d4ed8",
                color: "#ffffff",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "700",
                fontSize: "13px",
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
