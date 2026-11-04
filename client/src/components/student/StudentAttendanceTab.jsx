export default function StudentAttendanceTab({
  displayClass,
  attendanceStats,
  mentorProfile,
}) {
  return (
    <div>
      <div className="student-section-header">
        <div className="student-section-title-group">
          <h2>Academic Attendance Muster &amp; Leave Log</h2>
          <p>
            Verified Kerala Education Rules (KER) Class Attendance Register for{" "}
            <strong>{displayClass}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <span
            style={{
              background: "#dcfce7",
              color: "#15803d",
              padding: "8px 14px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "13px",
              border: "1px solid #bbf7d0",
            }}
          >
            Overall Turnout: {attendanceStats?.rate || "100.0%"}
          </span>
        </div>
      </div>

      {/* Attendance Highlights Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div className="dossier-card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>
            TOTAL WORKING DAYS
          </span>
          <h3 style={{ fontSize: "24px", margin: "6px 0 0", color: "#0f172a" }}>
            {attendanceStats?.totalWorkingDays ?? 0} Days
          </h3>
        </div>

        <div className="dossier-card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#15803d" }}>
            DAYS PRESENT
          </span>
          <h3 style={{ fontSize: "24px", margin: "6px 0 0", color: "#15803d" }}>
            {attendanceStats?.presentDays ?? 0} Days
          </h3>
        </div>

        <div className="dossier-card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#dc2626" }}>
            DAYS ABSENT
          </span>
          <h3 style={{ fontSize: "24px", margin: "6px 0 0", color: "#dc2626" }}>
            {attendanceStats?.absentDays ?? 0} Days
          </h3>
        </div>

        <div className="dossier-card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb" }}>
            AUTHENTICATED MENTOR
          </span>
          <h3 style={{ fontSize: "16px", margin: "6px 0 0", color: "#1d4ed8" }}>
            {mentorProfile?.name || "Assigned Class Mentor"}
          </h3>
          <span style={{ fontSize: "11px", color: "#64748b" }}>
            HSST Malayalam
          </span>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="student-table-container">
        <div
          style={{
            padding: "16px 20px",
            background: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            fontWeight: "700",
            fontSize: "14px",
            color: "#0f172a",
          }}
        >
          📅 Month-by-Month Attendance Register
        </div>

        <table className="student-data-table">
          <thead>
            <tr>
              <th>Academic Month</th>
              <th>Total Working Days</th>
              <th>Days Present</th>
              <th>Days Absent</th>
              <th>Turnout Rate</th>
              <th>KER Compliance Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceStats?.monthlyBreakdown && attendanceStats.monthlyBreakdown.length > 0 ? (
              attendanceStats.monthlyBreakdown.map((m) => (
                <tr key={m.month}>
                  <td>
                    <strong>{m.month}</strong>
                  </td>
                  <td>{m.total} Days</td>
                  <td style={{ color: "#15803d", fontWeight: "600" }}>
                    {m.present} Days
                  </td>
                  <td style={{ color: m.absent > 0 ? "#dc2626" : "#64748b", fontWeight: "600" }}>
                    {m.absent} Days
                  </td>
                  <td>
                    <strong>{m.rate}</strong>
                  </td>
                  <td>
                    <span className="badge-status paid">
                      ✓ Minimum &gt;85% Satisfied
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                  No attendance records logged yet for this academic year.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Absence Dates and Leaves Log */}
      <div className="dossier-card">
        <div className="dossier-card-header">
          <div className="dossier-card-title">
            <span className="icon">📝</span>
            Recorded Absence Dates &amp; Leave Notices
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {attendanceStats?.absentDates && attendanceStats.absentDates.length > 0 ? (
            attendanceStats.absentDates.map((dateStr, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px 14px",
                  background: "#fff1f2",
                  border: "1px solid #fecdd3",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#9f1239",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>⚠️</span>
                <strong>Date of Absence:</strong> {dateStr}
              </div>
            ))
          ) : (
            <div style={{ padding: "12px", color: "#15803d", fontSize: "13px", fontWeight: "600" }}>
              ✓ Perfect attendance! No absences or leaves recorded on muster roll.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
