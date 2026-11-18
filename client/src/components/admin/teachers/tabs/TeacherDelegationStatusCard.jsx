export default function TeacherDelegationStatusCard({
  teacher,
  isCurrentlyActive,
  isExpired,
  isUpcoming,
  handleRevokeNow,
  saving,
}) {
  return (
    <>
      {/* Teacher Summary Card */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "14px 18px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px 16px",
          fontSize: "12.5px",
        }}
      >
        <div>
          <span style={{ color: "#64748b", fontWeight: "600" }}>Faculty Member:</span>
          <div style={{ fontWeight: "700", color: "#0f172a" }}>{teacher.name}</div>
        </div>
        <div>
          <span style={{ color: "#64748b", fontWeight: "600" }}>Permanent Employee No:</span>
          <div style={{ fontWeight: "700", color: "#2563eb", fontFamily: "monospace" }}>
            {teacher.pen || teacher.penNumber || "—"}
          </div>
        </div>
        <div>
          <span style={{ color: "#64748b", fontWeight: "600" }}>Department:</span>
          <div style={{ fontWeight: "600", color: "#334155" }}>
            {teacher.department || "General"}
          </div>
        </div>
        <div>
          <span style={{ color: "#64748b", fontWeight: "600" }}>Institutional Email:</span>
          <div style={{ fontWeight: "600", color: "#334155", wordBreak: "break-all" }}>
            {teacher.email || "—"}
          </div>
        </div>
      </div>

      {/* Current Live Status Pill */}
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "13px",
          background: isCurrentlyActive
            ? "#ecfdf5"
            : isExpired
            ? "#fef2f2"
            : isUpcoming
            ? "#eff6ff"
            : "#f1f5f9",
          border: `1px solid ${
            isCurrentlyActive
              ? "#a7f3d0"
              : isExpired
              ? "#fecaca"
              : isUpcoming
              ? "#bfdbfe"
              : "#e2e8f0"
          }`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>
            {isCurrentlyActive ? "🟢" : isExpired ? "🔴" : isUpcoming ? "🔵" : "⚪"}
          </span>
          <div>
            <strong
              style={{
                color: isCurrentlyActive
                  ? "#065f46"
                  : isExpired
                  ? "#991b1b"
                  : isUpcoming
                  ? "#1e40af"
                  : "#475569",
              }}
            >
              {isCurrentlyActive
                ? "Currently Active Admission Administrator"
                : isExpired
                ? "Delegation Expired"
                : isUpcoming
                ? "Scheduled for Upcoming Admission Period"
                : "Standard Faculty Access (No Admission Rights)"}
            </strong>
            {teacher.isAdmissionAdmin && (teacher.admissionAdminStartDate || teacher.admissionAdminEndDate) && (
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Period:{" "}
                {teacher.admissionAdminStartDate
                  ? new Date(teacher.admissionAdminStartDate).toLocaleDateString("en-IN")
                  : "Start"}{" "}
                to{" "}
                {teacher.admissionAdminEndDate
                  ? new Date(teacher.admissionAdminEndDate).toLocaleDateString("en-IN")
                  : "Indefinite"}
              </div>
            )}
          </div>
        </div>

        {isCurrentlyActive && (
          <button
            type="button"
            onClick={handleRevokeNow}
            disabled={saving}
            style={{
              padding: "5px 12px",
              borderRadius: "6px",
              border: "1px solid #fca5a5",
              background: "#fee2e2",
              color: "#991b1b",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Revoke Now
          </button>
        )}
      </div>
    </>
  );
}
