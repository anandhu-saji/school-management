import { useState, useMemo } from "react";

export default function TeacherAttendanceTab({
  teacherProfile,
  selectedDivision,
  selectedDate,
  students,
  setStudents,
  saving,
  onSaveAttendance,
  feedback,
}) {
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const setStatus = (studentId, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === studentId ? { ...s, status: newStatus } : s))
    );
  };

  const markAll = (status) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (filter === "All") return true;
      return s.status === filter;
    });
  }, [students, filter]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const presentCount = students.filter((s) => s.status === "Present").length;
  const absentCount = students.filter((s) => s.status === "Absent").length;
  const totalCount = students.length;
  const attendanceRate = totalCount
    ? Math.round((presentCount / totalCount) * 100)
    : 0;

  // KER Sunday Holiday detection
  const isSunday = useMemo(() => {
    if (!selectedDate) return false;
    const [y, m, d] = selectedDate.split("-");
    const dt = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
    return dt.getUTCDay() === 0;
  }, [selectedDate]);

  const displayDivision = useMemo(() => {
    return (
      (selectedDivision || "Class 10-A")
        .replace(/\s*(Mentor|Class Teacher|In-charge|Teacher)\s*$/i, "")
        .replace(/\s*\(.*?\)\s*$/, "")
        .trim() || "Class 10-A"
    );
  }, [selectedDivision]);

  return (
    <div>
      {/* Hero Banner Card */}
      <section className="headmaster-hero-card" style={{ marginBottom: "20px" }}>
        <div className="badge-row">
          <span className="badge-governance">CLASS MENTOR ATTENDANCE TERMINAL</span>
          <span className="badge-sync">Kerala Pareeksha Bhavan Integrated</span>
        </div>
        <h1>Good day, {teacherProfile.name || "Mrs. Indu B Nair"}</h1>
        <p>
          GHSS Rajakkad • {displayDivision} Daily Attendance Register for{" "}
          <strong>{selectedDate}</strong>. Record roll-call attendance per Kerala Education Rules (KER).
        </p>
      </section>

      {/* Sunday Holiday Notice */}
      {isSunday && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "10px",
            padding: "14px 18px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#92400e",
          }}
        >
          <span style={{ fontSize: "20px" }}></span>
          <div>
            <strong>KER Sunday Weekly Holiday:</strong> Attendance cannot be marked or locked for Sundays in statutory registers per Kerala Education Rules Chapter VII.
          </div>
        </div>
      )}

      {/* 4 KPI Overview Stats Grid */}
      <div className="overview-stats-grid" style={{ marginBottom: "20px" }}>
        <div className="overview-stat-card">
          <span className="card-label">TOTAL ENROLLED</span>
          <div className="overview-number">{totalCount} Pupils</div>
          <div className="sub-text">{displayDivision} Official Roster</div>
        </div>
        <div className="overview-stat-card">
          <span className="card-label">TODAY'S PRESENT</span>
          <div className="overview-number text-green">{presentCount} Present</div>
          <div className="sub-text text-green">Marked in class roll-call</div>
        </div>
        <div className="overview-stat-card">
          <span className="card-label">TODAY'S ABSENT</span>
          <div className="overview-number text-red">{absentCount} Absent</div>
          <div className="sub-text text-red">Auto-SMS alert pending</div>
        </div>
        <div className="overview-stat-card">
          <span className="card-label">CLASS TURNOUT</span>
          <div className="overview-number text-teal">{attendanceRate}%</div>
          <div className="sub-text">Pareeksha Bhavan Synced</div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback.message && (
        <div className={`feedback-alert ${feedback.type}`} style={{ marginBottom: "16px" }}>
          {feedback.message}
        </div>
      )}

      {/* Actions & Filters */}
      <div className="table-controls-card">
        <div className="filter-group">
          <button
            className={`filter-btn ${filter === "All" ? "active" : ""}`}
            onClick={() => {
              setFilter("All");
              setCurrentPage(1);
            }}
          >
            All ({totalCount})
          </button>
          <button
            className={`filter-btn green ${filter === "Present" ? "active" : ""}`}
            onClick={() => {
              setFilter("Present");
              setCurrentPage(1);
            }}
          >
            Present ({presentCount})
          </button>
          <button
            className={`filter-btn red ${filter === "Absent" ? "active" : ""}`}
            onClick={() => {
              setFilter("Absent");
              setCurrentPage(1);
            }}
          >
            Absent ({absentCount})
          </button>
        </div>

        <div className="bulk-actions">
          <button
            className="btn-mark-all present"
            onClick={() => markAll("Present")}
            disabled={isSunday}
          >
            Mark All Present
          </button>
          <button
            className="btn-mark-all absent"
            onClick={() => markAll("Absent")}
            disabled={isSunday}
          >
            Mark All Absent
          </button>
          <button
            className="btn-save-attendance"
            disabled={saving || isSunday}
            onClick={onSaveAttendance}
          >
            {saving ? "Saving..." : "Save Register"}
          </button>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="roster-card">
        <table className="roster-table">
          <thead>
            <tr>
              <th>Roll #</th>
              <th>Student Name</th>
              <th>Adm. Number</th>
              <th>Gender</th>
              <th>Monthly Leaves</th>
              <th style={{ textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                  No student records found for {displayDivision}.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((std) => (
                <tr
                  key={std._id}
                  className={std.status === "Absent" ? "row-absent" : ""}
                >
                  <td>{std.rollNumber}</td>
                  <td>
                    <strong>{std.name}</strong>
                  </td>
                  <td>{std.admissionNumber}</td>
                  <td>{std.gender}</td>
                  <td>
                    <span
                      className={`leave-badge ${
                        std.monthlyLeavesTaken >= 3 ? "warning" : ""
                      }`}
                    >
                      {std.monthlyLeavesTaken} / 3 Days
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div className="status-toggle-group">
                      <button
                        type="button"
                        className={`toggle-btn present ${
                          std.status === "Present" ? "active" : ""
                        }`}
                        onClick={() => setStatus(std._id, "Present")}
                        disabled={isSunday}
                        title="Mark Present"
                      >
                        P
                      </button>
                      <button
                        type="button"
                        className={`toggle-btn absent ${
                          std.status === "Absent" ? "active" : ""
                        }`}
                        onClick={() => setStatus(std._id, "Absent")}
                        disabled={isSunday}
                        title="Mark Absent"
                      >
                        A
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-bar">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
