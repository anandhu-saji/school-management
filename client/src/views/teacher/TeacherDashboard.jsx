import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosclient";
import { clearAuthSession } from "../../utils/auth";
import "../../Styles/TeacherDash.css";
import { ACADEMIC_WINGS } from "../../utils/classData";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedDivision, setSelectedDivision] = useState("Class 10-A");
  const [teacherProfile, setTeacherProfile] = useState({
    name: "Indu B Nair",
    email: "kathalanx@gmail.com",
    assignedClass: "Class 10-A",
    department: "Mathematics",
  });
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchRoster = async (divisionToFetch = selectedDivision, dateToFetch = selectedDate) => {
    try {
      const res = await api.get(
        `/teacher/students?division=${encodeURIComponent(divisionToFetch)}&date=${dateToFetch}`
      );

      if (res.data.success) {
        setStudents(res.data.students || []);
        if (res.data.teacher) {
          setTeacherProfile(res.data.teacher);
        }
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadRoster = async () => {
      try {
        const res = await api.get(
          `/teacher/students?division=${encodeURIComponent(selectedDivision)}&date=${selectedDate}`
        );
        if (isMounted && res.data.success) {
          setStudents(res.data.students || []);
          if (res.data.teacher) {
            setTeacherProfile(res.data.teacher);
          }
        }
      } catch (err) {
        console.error("Failed to load students:", err);
      }
    };
    loadRoster();
    return () => { isMounted = false; };
  }, [selectedDivision, selectedDate]);

  const setStatus = (studentId, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === studentId ? { ...s, status: newStatus } : s))
    );
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      setFeedback({ message: "", type: "" });

      const [y, m, d] = selectedDate.split("-");
      const checkDate = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
      if (checkDate.getUTCDay() === 0) {
        setFeedback({
          message: "Sundays are weekly holidays. Attendance cannot be recorded.",
          type: "error",
        });
        setSaving(false);
        return;
      }

      const payload = {
        date: selectedDate,
        classDivision: selectedDivision,
        records: students.map((s) => ({
          studentId: s._id,
          rollNumber: s.rollNumber,
          name: s.name,
          status: s.status,
        })),
      };

      const res = await api.post("/teacher/attendance", payload);

      if (res.data.success) {
        setFeedback({
          message: `Attendance for ${selectedDate} saved to DB!`,
          type: "success",
        });
        setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
        fetchRoster(selectedDivision, selectedDate);
      }
    } catch (err) {
      setFeedback({
        message: err.response?.data?.message || "Failed to save attendance.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const markAll = (status) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const filteredStudents = students.filter((s) => {
    if (filter === "All") return true;
    return s.status === filter;
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const presentCount = students.filter((s) => s.status === "Present").length;
  const absentCount = students.filter((s) => s.status === "Absent").length;
  const totalCount = students.length;
  const attendanceRate = totalCount
    ? Math.round((presentCount / totalCount) * 100)
    : 0;

  return (
    <div className="teacher-layout">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`teacher-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-badge">GHSS RAJAKKAD</div>
          <h2>Sampoorna 2.0</h2>
          <span className="portal-sub">Teacher Console</span>
        </div>

        <nav className="teacher-nav">
          <button className="nav-btn active">
            <span>📅</span> Mark Daily Attendance
          </button>
          <button className="nav-btn" onClick={() => navigate("/dashboard")}>
            <span>📊</span> Academic Records
          </button>
          <button className="nav-btn" onClick={() => navigate("/dashboard")}>
            <span>📝</span> Internal Marks
          </button>
          <button className="nav-btn" onClick={() => navigate("/dashboard")}>
            <span>🗓️</span> Timetable
          </button>
        </nav>

        <div className="sidebar-teacher-card">
          <div className="teacher-avatar">
            {teacherProfile.name ? teacherProfile.name.charAt(0) : "T"}
          </div>
          <div className="teacher-info">
            <strong>{teacherProfile.name}</strong>
            <span>{teacherProfile.department}</span>
            <span className="mentor-pill">{teacherProfile.assignedClass}</span>
          </div>
        </div>

        <button className="sidebar-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="teacher-main-wrapper">
        <header className="teacher-header">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="header-breadcrumbs">
            <span>Academics</span> / <span>Attendance Register</span> /{" "}
            <strong>{selectedDivision}</strong>
          </div>
          <div className="header-controls" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Division:</label>
              <select
                className="teacher-class-select"
                value={selectedDivision}
                onChange={(e) => {
                  const newClass = e.target.value;
                  setSelectedDivision(newClass);
                  fetchRoster(newClass, selectedDate);
                }}
                style={{
                  padding: "7px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f172a",
                  background: "#ffffff",
                  cursor: "pointer",
                }}
              >
                {ACADEMIC_WINGS.map((wing) => (
                  <optgroup key={wing.code} label={wing.wing}>
                    {wing.classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.stream})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <input
              type="date"
              className="date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </header>

        <main className="teacher-content">
          {/* Quick Metrics Bar */}
          <div className="stats-row">
            <div className="stat-pill">
              <span className="stat-label">Enrolled:</span>
              <strong>{totalCount}</strong>
            </div>
            <div className="stat-pill green">
              <span className="stat-label">Present:</span>
              <strong>{presentCount}</strong>
            </div>
            <div className="stat-pill red">
              <span className="stat-label">Absent:</span>
              <strong>{absentCount}</strong>
            </div>
            <div className="stat-pill blue">
              <span className="stat-label">Turnout:</span>
              <strong>{attendanceRate}%</strong>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedback.message && (
            <div className={`feedback-alert ${feedback.type}`}>
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
              >
                Mark All Present
              </button>
              <button
                className="btn-mark-all absent"
                onClick={() => markAll("Absent")}
              >
                Mark All Absent
              </button>
              <button
                className="btn-save-attendance"
                disabled={saving}
                onClick={handleSaveAttendance}
              >
                {saving ? "Saving..." : "💾 Save Register"}
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
                    <td colSpan="6" style={{ textAlign: "center", padding: "24px" }}>
                      No student records found.
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
                          >
                            P
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn absent ${
                              std.status === "Absent" ? "active" : ""
                            }`}
                            onClick={() => setStatus(std._id, "Absent")}
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
        </main>
      </div>
    </div>
  );
}