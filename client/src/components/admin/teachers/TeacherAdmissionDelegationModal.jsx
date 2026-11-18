import { useState, useEffect } from "react";
import api from "../../../api/axiosclient";
import { useConfirm } from "../../../context/ConfirmContext";
import TeacherDelegationStatusCard from "./tabs/TeacherDelegationStatusCard";
import "../../../Styles/AdminDash.css";

export default function TeacherAdmissionDelegationModal({
  teacher,
  isOpen,
  onClose,
  onSaved,
}) {
  const confirm = useConfirm();
  const [isAdmissionAdmin, setIsAdmissionAdmin] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    if (teacher) {
      setIsAdmissionAdmin(Boolean(teacher.isAdmissionAdmin));
      setStartDate(
        teacher.admissionAdminStartDate
          ? new Date(teacher.admissionAdminStartDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setEndDate(
        teacher.admissionAdminEndDate
          ? new Date(teacher.admissionAdminEndDate).toISOString().split("T")[0]
          : ""
      );
      setNote(teacher.admissionAdminNote || "");
      setFeedback({ type: "", message: "" });
    }
  }, [teacher]);

  if (!isOpen || !teacher) return null;

  // Determine current live status
  const now = new Date();
  const start = teacher.admissionAdminStartDate ? new Date(teacher.admissionAdminStartDate) : null;
  const end = teacher.admissionAdminEndDate ? new Date(teacher.admissionAdminEndDate) : null;
  if (end) end.setHours(23, 59, 59, 999);
  if (start) start.setHours(0, 0, 0, 0);

  const isCurrentlyActive =
    teacher.isAdmissionAdmin &&
    (!start || now >= start) &&
    (!end || now <= end);

  const isExpired = teacher.isAdmissionAdmin && end && now > end;
  const isUpcoming = teacher.isAdmissionAdmin && start && now < start;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFeedback({ type: "", message: "" });

      if (isAdmissionAdmin && !endDate) {
        setFeedback({
          type: "error",
          message: "Please specify an End Date for the temporary admission period.",
        });
        setSaving(false);
        return;
      }

      if (isAdmissionAdmin && startDate && endDate && new Date(startDate) > new Date(endDate)) {
        setFeedback({
          type: "error",
          message: "Admission period End Date cannot be earlier than Start Date.",
        });
        setSaving(false);
        return;
      }

      const payload = {
        isAdmissionAdmin,
        startDate: isAdmissionAdmin ? startDate : null,
        endDate: isAdmissionAdmin ? endDate : null,
        note: isAdmissionAdmin ? note : "",
      };

      const res = await api.put(`/admin/teachers/${teacher._id}/admission-admin`, payload);

      if (res.data?.success) {
        if (onSaved) onSaved(res.data.teacher);
        onClose();
      }
    } catch (err) {
      console.error("Failed to update admission delegation:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to save admission delegation.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async () => {
    const isConfirmed = await confirm({
      title: "Revoke Admission Admin Rights?",
      message: `Are you sure you want to revoke temporary admission admin rights for ${teacher.name} immediately?`,
      subMessage: "This faculty member will immediately lose access to student registration privileges.",
      confirmText: "Revoke Rights",
      cancelText: "Keep Rights",
      type: "danger",
    });

    if (!isConfirmed) {
      return;
    }

    try {
      setSaving(true);
      const payload = {
        isAdmissionAdmin: false,
        startDate: null,
        endDate: null,
        note: "Revoked by Headmaster",
      };

      const res = await api.put(`/admin/teachers/${teacher._id}/admission-admin`, payload);
      if (res.data?.success) {
        if (onSaved) onSaved(res.data.teacher);
        onClose();
      }
    } catch (err) {
      console.error("Failed to revoke admission delegation:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to revoke admission delegation.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-card"
        style={{
          maxWidth: "600px",
          width: "100%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          padding: "24px 28px",
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header-row" style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>🎓</span>
              <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Temporary Admission Admin Delegation
              </h3>
            </div>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>
              Authorize designated faculty members to handle student admission records during the admission period.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback.message && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: "600",
              marginBottom: "14px",
              background: feedback.type === "error" ? "#fef2f2" : "#f0fdf4",
              color: feedback.type === "error" ? "#991b1b" : "#166534",
              border: `1px solid ${feedback.type === "error" ? "#fecaca" : "#bbf7d0"}`,
            }}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
          <TeacherDelegationStatusCard
            teacher={teacher}
            isCurrentlyActive={isCurrentlyActive}
            isExpired={isExpired}
            isUpcoming={isUpcoming}
            handleRevokeNow={handleRevoke}
            saving={saving}
          />

          {/* Delegation Switch */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
            }}
          >
            <div>
              <strong style={{ fontSize: "13.5px", color: "#0f172a", display: "block" }}>
                Enable Temporary Admission Admin Privileges
              </strong>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Grants temporary access to the Student Admissions &amp; Registry console
              </span>
            </div>
            <input
              type="checkbox"
              id="delegationToggle"
              checked={isAdmissionAdmin}
              onChange={(e) => setIsAdmissionAdmin(e.target.checked)}
              style={{
                width: "18px",
                height: "18px",
                cursor: "pointer",
                accentColor: "#2563eb",
              }}
            />
          </div>

          {/* Dates Configuration (Only if enabled) */}
          {isAdmissionAdmin && (
            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#1e3a8a",
                      marginBottom: "4px",
                    }}
                  >
                    Admission Period Start Date <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #93c5fd",
                      fontSize: "13px",
                      background: "#ffffff",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#1e3a8a",
                      marginBottom: "4px",
                    }}
                  >
                    Admission Period End Date <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #93c5fd",
                      fontSize: "13px",
                      background: "#ffffff",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#1e3a8a",
                    marginBottom: "4px",
                  }}
                >
                  Delegation Order / Administrative Note:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Authorized under Order GHSS/ADM/2026/04 for Secondary Admissions"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #93c5fd",
                    fontSize: "13px",
                    background: "#ffffff",
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: "11.5px",
                  color: "#1e40af",
                  background: "#dbeafe",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  lineHeight: "1.45",
                }}
              >
                🔒 <strong>Statutory Scope Notice:</strong> The teacher will only be granted access to
                handle <em>Students Admission records</em> (admit students, edit KYC details, verify documents). All other Chief Admin consoles (Staff, Finance, Exams, Trash) remain strictly locked. Access automatically expires after the specified End Date.
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "10px",
              paddingTop: "14px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
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
              disabled={saving}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#2563eb",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Delegation Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
