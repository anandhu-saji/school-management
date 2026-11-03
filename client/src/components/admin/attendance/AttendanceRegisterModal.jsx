export default function AttendanceRegisterModal({
  isOpen,
  onClose,
  selectedDivision,
  registerDate,
  onDateChange,
  registerMentor,
  registerFeedback,
  registerStats,
  registerSearch,
  setRegisterSearch,
  registerFilter,
  setRegisterFilter,
  registerStudents,
  filteredRegisterStudents,
  registerLoading,
  registerSaving,
  onToggleStatus,
  onMarkAll,
  onSaveRegister,
  onExportCSV,
}) {
  if (!isOpen || !selectedDivision) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-card modal-lg"
        style={{ maxWidth: "980px", maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header-row">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  background: "#1d4ed8",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: "800",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  letterSpacing: "0.5px",
                }}
              >
                LIVE REGISTER
              </span>
              <h3 style={{ margin: 0 }}>
                {selectedDivision.standardDivision} Attendance Register
              </h3>
            </div>
            <p
              style={{
                fontSize: "12.5px",
                color: "#64748b",
                margin: "4px 0 0 0",
              }}
            >
              Class Mentor:{" "}
              <strong>{registerMentor || selectedDivision.mentor}</strong> •
              School Code: 06042
            </p>
          </div>

          {/* Date Picker & Close Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="attendance-date-picker-box">
              <span style={{ fontSize: "14px" }}>📅</span>
              <input
                type="date"
                className="attendance-date-input"
                value={registerDate}
                onChange={(e) => onDateChange(e.target.value)}
              />
            </div>
            <button
              className="modal-close-btn"
              onClick={onClose}
              title="Close Register"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="allotment-modal-body" style={{ maxHeight: "74vh", overflowY: "auto" }}>
          {/* Feedback Alerts */}
          {registerFeedback.message && (
            <div
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "13px",
                fontWeight: "600",
                background:
                  registerFeedback.type === "error"
                    ? "#fee2e2"
                    : "#dcfce7",
                color:
                  registerFeedback.type === "error"
                    ? "#b91c1c"
                    : "#15803d",
              }}
            >
              {registerFeedback.message}
            </div>
          )}

          {/* Top 4 Summary Cards Grid */}
          <div className="attendance-summary-pills-row">
            <div className="attendance-summary-mini-card">
              <span className="attendance-mini-label">Total Enrolled</span>
              <span className="attendance-mini-value">
                {registerStats.totalEnrolled} Students
              </span>
            </div>
            <div className="attendance-summary-mini-card">
              <span className="attendance-mini-label">Present Today</span>
              <span className="attendance-mini-value" style={{ color: "#16a34a" }}>
                {registerStats.presentCount} Students
              </span>
            </div>
            <div className="attendance-summary-mini-card">
              <span className="attendance-mini-label">Absent Today</span>
              <span className="attendance-mini-value" style={{ color: "#dc2626" }}>
                {registerStats.absentCount} Students
              </span>
            </div>
            <div className="attendance-summary-mini-card">
              <span className="attendance-mini-label">Turnout Rate</span>
              <span className="attendance-mini-value" style={{ color: "#2563eb" }}>
                {registerStats.turnoutRate}
              </span>
            </div>
          </div>

          {/* Toolbar: Search, Filters & Bulk Actions */}
          <div className="attendance-register-toolbar">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "240px" }}>
              <input
                type="text"
                placeholder="Search by Roll No, Student Name, Adm No..."
                value={registerSearch}
                onChange={(e) => setRegisterSearch(e.target.value)}
                className="search-box"
                style={{ margin: 0, width: "100%", maxWidth: "340px", padding: "8px 14px" }}
              />

              {/* Filter Pills */}
              <div className="attendance-filter-tabs">
                <button
                  type="button"
                  className={`att-tab-btn ${
                    registerFilter === "All" ? "active" : ""
                  }`}
                  onClick={() => setRegisterFilter("All")}
                >
                  All ({registerStudents.length})
                </button>
                <button
                  type="button"
                  className={`att-tab-btn ${
                    registerFilter === "Present" ? "active" : ""
                  }`}
                  onClick={() => setRegisterFilter("Present")}
                >
                  Present ({registerStats.presentCount})
                </button>
                <button
                  type="button"
                  className={`att-tab-btn ${
                    registerFilter === "Absent" ? "active" : ""
                  }`}
                  onClick={() => setRegisterFilter("Absent")}
                >
                  Absent ({registerStats.absentCount})
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="attendance-bulk-actions">
              <button
                type="button"
                className="btn-bulk-present"
                onClick={() => onMarkAll("Present")}
                title="Mark all enrolled students as Present"
              >
                ✓ Mark All Present
              </button>
              <button
                type="button"
                className="btn-bulk-absent"
                onClick={() => onMarkAll("Absent")}
                title="Mark all enrolled students as Absent"
              >
                ✕ Mark All Absent
              </button>
            </div>
          </div>

          {/* Students Register Table */}
          {registerLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#64748b",
                fontWeight: "600",
              }}
            >
              Loading student roster &amp; attendance marks...
            </div>
          ) : filteredRegisterStudents.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#64748b",
              }}
            >
              No matching students found in this division.
            </div>
          ) : (
            <div className="allotment-table-wrapper">
              <table className="allotment-schedule-table">
                <thead>
                  <tr>
                    <th style={{ width: "65px" }}>Roll #</th>
                    <th style={{ width: "120px" }}>Adm No</th>
                    <th>Student Name</th>
                    <th style={{ width: "90px" }}>Gender</th>
                    <th style={{ width: "210px", textAlign: "center" }}>
                      Attendance Status
                    </th>
                    <th style={{ width: "130px", textAlign: "center" }}>
                      Monthly Leaves
                    </th>
                    <th style={{ width: "110px", textAlign: "right" }}>
                      Turnout
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegisterStudents.map((s) => {
                    const isPresent = s.status === "Present";
                    const isAbsent = s.status === "Absent";
                    const isLeave =
                      s.status === "Leave" ||
                      s.status === "On Leave" ||
                      s.status === "Half Day";

                    return (
                      <tr
                        key={s._id}
                        style={{
                          background: isAbsent ? "#fff7f7" : "#ffffff",
                        }}
                      >
                        <td>
                          <strong style={{ color: isAbsent ? "#b91c1c" : "#0f172a" }}>
                            #{String(s.rollNumber).padStart(2, "0")}
                          </strong>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "#475569", fontFamily: "monospace" }}>
                            {s.admissionNumber}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                background: isAbsent ? "#fee2e2" : "#e0e7ff",
                                color: isAbsent ? "#b91c1c" : "#3730a3",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: "800",
                              }}
                            >
                              {s.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <span style={{ fontWeight: "700", color: "#0f172a" }}>
                              {s.name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            {s.gender}
                          </span>
                        </td>

                        {/* Segmented Status Toggle */}
                        <td style={{ textAlign: "center" }}>
                          <div className="reg-segmented-toggle">
                            <button
                              type="button"
                              className={`reg-segment-btn ${
                                isPresent ? "active-present" : ""
                              }`}
                              onClick={() => onToggleStatus(s._id, "Present")}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              className={`reg-segment-btn ${
                                isAbsent ? "active-absent" : ""
                              }`}
                              onClick={() => onToggleStatus(s._id, "Absent")}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              className={`reg-segment-btn ${
                                isLeave ? "active-leave" : ""
                              }`}
                              onClick={() => onToggleStatus(s._id, "On Leave")}
                            >
                              Leave
                            </button>
                          </div>
                        </td>

                        <td style={{ textAlign: "center" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              padding: "3px 8px",
                              borderRadius: "12px",
                              background:
                                s.monthlyLeavesTaken > 0
                                  ? "#fef3c7"
                                  : "#f1f5f9",
                              color:
                                s.monthlyLeavesTaken > 0
                                  ? "#b45309"
                                  : "#475569",
                            }}
                          >
                            {s.monthlyLeavesTaken || 0} Days Taken
                          </span>
                        </td>

                        <td style={{ textAlign: "right" }}>
                          <strong style={{ color: "#059669" }}>
                            {s.overallAttendance}
                          </strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Statutory Note Box */}
          <div
            style={{
              marginTop: "16px",
              background: "#f8fafc",
              border: "1px dashed #cbd5e1",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "12px",
              color: "#475569",
              lineHeight: "1.5",
            }}
          >
            <strong>Kerala Education Rules (K.E.R) Ch. XIV-A:</strong>{" "}
            Attendance muster must be recorded for each session. Saving this
            register synchronizes records directly to the Sampoorna 2.0
            state academic database.
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer-row">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
          >
            Close Register
          </button>
          <button
            type="button"
            className="btn-seating-action"
            onClick={onExportCSV}
            title="Export this division register to CSV"
          >
            Export Register (CSV) ⤓
          </button>
          <button
            type="button"
            className="btn-modal-save"
            onClick={onSaveRegister}
            disabled={registerSaving}
          >
            {registerSaving
              ? "Saving & Locking..."
              : "Save & Lock Register ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
