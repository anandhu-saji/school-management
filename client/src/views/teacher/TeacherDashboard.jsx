import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Styles/TeacherDash.css";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState("2026-10-26");
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState("All"); // All | Present | Absent
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchRoster = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/teacher/students?division=Class 10-A&date=${selectedDate}`
      );

      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
      setFeedback({
        message: err.response?.data?.message || "Failed to load class roster.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [selectedDate]);

  const setStatus = (studentId, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === studentId ? { ...s, status: newStatus } : s))
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
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
          message: "Sundays are designated weekly holidays. Attendance cannot be recorded.",
          type: "error",
        });
        setSaving(false);
        return;
      }

      const payload = {
        date: selectedDate,
        classDivision: "Class 10-A",
        records: students.map((s) => ({
          studentId: s._id,
          rollNumber: s.rollNumber,
          name: s.name,
          status: s.status,
        })),
      };

      const res = await axios.post("http://localhost:5000/api/teacher/attendance", payload);

      if (res.data.success) {
        setFeedback({
          message: `Attendance for ${selectedDate} saved to DB!`,
          type: "success",
        });
        setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
        fetchRoster();
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

  const totalEnrolled = students.length;
  const presentCount = students.filter((s) => s.status === "Present").length;
  const absentCount = students.filter((s) => s.status === "Absent").length;
  const attendanceRate = totalEnrolled > 0 ? ((presentCount / totalEnrolled) * 100).toFixed(1) : "0.0";

  const filteredStudents = students.filter((s) => {
    if (filter === "Present") return s.status === "Present";
    if (filter === "Absent") return s.status === "Absent";
    return true;
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + pageSize);

  const getInitials = (name) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="teacher-layout">
      {/* Mobile Top App Bar */}
      <div className="mobile-topbar">
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open Sidebar Menu"
        >
          ☰
        </button>
        <span className="mobile-brand-title">G.H.S.S Rajakkad</span>
        <span className="live-dot"></span>
      </div>

      {/* Backdrop for Mobile Drawer */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "drawer-open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar Drawer */}
      <aside className={`teacher-sidebar ${sidebarOpen ? "drawer-open" : ""}`}>
        <div>
          <div className="school-header">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>G.H.S.S Rajakkad</h2>
              {sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                    color: "#64748b",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <p className="school-code">SCHOOL CODE: 06042</p>
            <div className="live-badge">
              <span className="live-dot"></span> Sampoorna 2.0 Live{" "}
              <span style={{ color: "#065f46" }}>IDUKKI DIST</span>
            </div>
          </div>

          <nav className="nav-links">
            <button className="nav-item active">📑 Daily Attendance</button>
            <button className="nav-item">👥 Student Management</button>
            <button className="nav-item">📅 Scheduled Exams</button>
            <button className="nav-item">📝 Marks &amp; Grade</button>
          </nav>
        </div>

        {/* Teacher Bottom Profile Widget */}
        <div className="teacher-profile-widget">
          <div className="profile-card">
            <div className="profile-avatar">👤</div>
            <div className="profile-info">
              <p className="profile-name">Mrs. Priya Nair</p>
              <p className="profile-role">HSST Malayalam • Class 10-A Mentor</p>
            </div>

            <button
              type="button"
              className="btn-profile-logout"
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>

          <div className="sync-status">
            <span>ID: GHSS-RJK-0428</span>
            <span>•</span>
            <span className="sync-dot"></span>
            <span style={{ color: "#059669", fontWeight: 600 }}>Synced 08:42 AM</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="teacher-main">
        {/* Header with Print & Save Buttons */}
        <div className="dashboard-header-card">
          <div>
            <h1 className="greeting-text">Good morning, Mrs. Priya Nair</h1>
            <p className="greeting-sub">
              Class 10-A Mentor • Daily Muster &amp; Biometric Attendance Portal
            </p>
          </div>
          <div className="header-action-buttons">
            <button className="btn-action-print" onClick={() => window.print()}>
              🖨️ Print
            </button>
            <button
              className="btn-action-save"
              onClick={handleSaveAttendance}
              disabled={saving || totalEnrolled === 0}
            >
              💾 {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback.message && (
          <div
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "13px",
              fontWeight: 700,
              backgroundColor: feedback.type === "success" ? "#ecfdf5" : "#fef2f2",
              color: feedback.type === "success" ? "#065f46" : "#b91c1c",
              border: `1px solid ${feedback.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            }}
          >
            {feedback.message}
          </div>
        )}

        {/* Metric Cards Row */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">CLASS 10-A STRENGTH</div>
            <div className="stat-value-group">
              <span className="stat-number">{totalEnrolled}</span>
              <span className="stat-unit">Enrolled</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">TODAY'S ATTENDANCE</div>
            <div className="stat-value-group">
              <span className="stat-number">{attendanceRate}%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">ABSENT TODAY</div>
            <div className="stat-value-group">
              <span className="stat-number" style={{ color: "#c5221f" }}>
                {absentCount}
              </span>
              <span className="stat-unit" style={{ color: "#c5221f" }}>
                Students
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">PROFILE UPDATES PENDING</div>
            <div className="stat-value-group">
              <span className="stat-number">3</span>
              <span className="stat-unit">Pupils</span>
            </div>
            <p className="stat-subtext">Aadhaar / Blood Group</p>
          </div>
        </div>

        {/* Daily Register Section */}
        <div className="register-container">
          <div className="register-header">
            <h2 className="register-title">Daily Attendance Register &amp; History</h2>
            <p className="register-subtitle">Kerala State Education Sampoorna Portal Live Sync</p>
          </div>

          {/* Filters Bar */}
          <div className="filter-bar">
            <div className="date-picker-box">
              <span className="date-label">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-native-input"
              />
            </div>

            <div className="filter-pills-group">
              <button
                className={`filter-pill ${filter === "All" ? "active-all" : ""}`}
                onClick={() => {
                  setFilter("All");
                  setCurrentPage(1);
                }}
              >
                All ({totalEnrolled})
              </button>
              <button
                className={`filter-pill ${filter === "Present" ? "active-present" : ""}`}
                onClick={() => {
                  setFilter("Present");
                  setCurrentPage(1);
                }}
              >
                Present ({presentCount})
              </button>
              <button
                className={`filter-pill ${filter === "Absent" ? "active-absent" : ""}`}
                onClick={() => {
                  setFilter("Absent");
                  setCurrentPage(1);
                }}
              >
                Absent ({absentCount})
              </button>
              <button className="filter-pill" onClick={() => setFilter("All")}>
                Medical (1)
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="table-responsive-wrapper">
            <table className="roster-table">
              <thead>
                <tr className="table-head">
                  <th>ROLL</th>
                  <th>STUDENT NAME</th>
                  <th>STUDENT ID</th>
                  <th style={{ textAlign: "center" }}>ATTENDANCE STATUS TOGGLE</th>
                  <th style={{ textAlign: "center" }}>REMAINING LEAVE</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((std) => {
                  const isAbsent = std.status === "Absent";
                  const initials = getInitials(std.name);

                  // 3-day monthly quota logic
                  const leavesUsed = std.monthlyLeavesTaken || 0;
                  const leavesRemaining = Math.max(0, 3 - leavesUsed);

                  let pillClass = "leave-green";
                  if (leavesRemaining <= 1) pillClass = "leave-amber";
                  if (leavesRemaining === 0) pillClass = "leave-red";

                  return (
                    <tr
                      key={std._id}
                      className={`student-row ${isAbsent ? "is-absent" : ""}`}
                    >
                      <td>
                        <span className="roll-text">
                          {String(std.rollNumber).padStart(2, "0")}
                        </span>
                      </td>
                      <td>
                        <div className="student-identity-cell">
                          <div
                            className={`avatar-circle ${isAbsent ? "avatar-absent" : ""}`}
                          >
                            {initials}
                          </div>
                          <span className="student-full-name">{std.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="student-id-text">
                          {std.admissionNumber || `KL-2022-${1080 + std.rollNumber}`}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div className="segmented-toggle">
                          <button
                            type="button"
                            className={`segment-btn ${!isAbsent ? "active-green" : ""}`}
                            onClick={() => setStatus(std._id, "Present")}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            className={`segment-btn ${isAbsent ? "active-red" : ""}`}
                            onClick={() => setStatus(std._id, "Absent")}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`remaining-leave-pill ${pillClass}`}>
                          {leavesRemaining === 1
                            ? "1 Day Left"
                            : `${leavesRemaining} Days Left`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="register-bottom-bar">
            <p className="pagination-counter">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + pageSize, filteredStudents.length)} of{" "}
              {filteredStudents.length} students
            </p>
            <div className="pagination-controls">
              <button
                className="btn-page"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                &lt; Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  className={`btn-page ${currentPage === pg ? "active" : ""}`}
                  onClick={() => setCurrentPage(pg)}
                >
                  {pg}
                </button>
              ))}
              <button
                className="btn-page"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                Next &gt;
              </button>
            </div>
          </div>

          <p className="muster-verified-note">
            Daily Muster verified against Kerala Biometric &amp; Sampoorna portal database.
          </p>
        </div>
      </main>
    </div>
  );
}