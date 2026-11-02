import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosclient";
import { isSessionValid, clearAuthSession } from "../../utils/auth";
import "./../../Styles/StudentDash.css";

const lessons = [
  {
    time: "09:30 - 10:45 AM",
    subject: "Mathematics Revision",
    teacher: "Mr. George Varghese",
    room: "Room 14 (Lab Wing)",
    type: "blue",
  },
  {
    time: "11:00 - 12:15 PM",
    subject: "Physics Practical Test",
    teacher: "Mrs. Lakshmi S.",
    room: "Science Laboratory",
    type: "green",
  },
  {
    time: "01:30 - 02:45 PM",
    subject: "Malayalam Model Paper",
    teacher: "Mrs. Priya Nair",
    room: "Class 10-A Room",
    type: "purple",
  },
  {
    time: "03:00 - 04:00 PM",
    subject: "Social Science Quiz",
    teacher: "Sri. K. R. Suresh",
    room: "Room 10 (Main Block)",
    type: "orange",
  },
];

const notices = [
  {
    date: "02 NOV 2026",
    title: "SSLC Board Examination Model Papers Released",
    description:
      "All candidates can download model question papers and verified answer keys from SCERT Kerala repository.",
    tag: "Exam",
    type: "urgent",
  },
  {
    date: "28 OCT 2026",
    title: "Second Terminal Examination Timetable Finalized",
    description:
      "Terminal exam commences from 12 March 2026. Hall tickets verified by respective Class Mentors.",
    tag: "Urgent",
    type: "urgent",
  },
  {
    date: "15 OCT 2026",
    title: "Transport & Special Lab Fee Dues Clearance",
    description:
      "Parents are advised to clear term lab and bus pass contributions at the counter or via online UPI.",
    tag: "Accounts",
    type: "holiday",
  },
];

export default function StudentDashboard() {
  const navigate = useNavigate();

  // Navigation tab state: "overview" | "attendance" | "timetable" | "fees"
  const [activeTab, setActiveTab] = useState("overview");

  // User session
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Data states from backend
  const [dashboardData, setDashboardData] = useState(null);
  const [exams, setExams] = useState([]);
  const [feesData, setFeesData] = useState(null);
  const [, setLoadingMetrics] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [, setLoadingFees] = useState(false);

  // Modals state
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [viewingHallTicket, setViewingHallTicket] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  // Helper to resolve full document URL
  const getDocumentUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const backendBase = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
      : "http://localhost:5000";
    return `${backendBase}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // Copy to clipboard helper
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2000);
  };

  useEffect(() => {
    // 1. Verify session validity
    if (!isSessionValid()) {
      clearAuthSession();
      navigate("/login?session=expired", { replace: true });
      return;
    }

    // 2. Prevent browser back to login
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);

    // 3. Periodic session check
    const interval = setInterval(() => {
      if (!isSessionValid()) {
        clearAuthSession();
        navigate("/login?session=expired", { replace: true });
      }
    }, 10000);

    // 4. Fetch student dashboard data
    async function fetchDashboardMetrics() {
      try {
        setLoadingMetrics(true);
        const res = await api.get("/student/dashboard-data");
        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load student dashboard metrics:", err);
      } finally {
        setLoadingMetrics(false);
      }
    }

    // 5. Fetch published exams
    async function fetchExams() {
      try {
        setLoadingExams(true);
        const res = await api.get("/student/exams");
        if (res.data.success) {
          setExams(res.data.exams || []);
        }
      } catch (err) {
        console.error("Failed to load student exams:", err);
      } finally {
        setLoadingExams(false);
      }
    }

    // 6. Fetch fees ledger
    async function fetchFees() {
      try {
        setLoadingFees(true);
        const res = await api.get("/student/fees");
        if (res.data.success) {
          setFeesData(res.data);
        }
      } catch (err) {
        console.error("Failed to load student fees:", err);
      } finally {
        setLoadingFees(false);
      }
    }

    fetchDashboardMetrics();
    fetchExams();
    fetchFees();

    return () => {
      window.removeEventListener("popstate", handlePopState);
      clearInterval(interval);
    };
  }, [navigate]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const getDisplayName = (name) => {
    if (!name) return "Student Scholar";
    return name
      .replace(/[._-]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const getInitials = (name) => {
    const formatted = getDisplayName(name);
    return formatted
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const studentProfile = dashboardData?.student;
  const mentorProfile = dashboardData?.mentor;
  const attendanceStats = dashboardData?.attendance;

  const displayName = getDisplayName(
    studentProfile?.name || user?.name || user?.username || user?.email
  );

  const displayClass = studentProfile?.className || "Class 10-A";
  const totalFeeDue = feesData?.summary?.totalDue ?? 0;
  const nextExam = exams?.[0];

  return (
    <div className="portal">
      {/* ---------------- SIDEBAR NAVIGATION ---------------- */}
      <aside className="admin-sidebar sidebar">
        <div>
          <div className="sidebar-header">
            <div className="school-code-label">School Code: 06042</div>
            <div className="sampoorna-live-pill">
              <span className="dot"></span> SAMPOORNA 2.0 LIVE
            </div>
          </div>

          <div className="sidebar-section-title">STUDENT CONSOLE</div>
          <nav className="console-nav-list sidebar-nav">
            <button
              className={`console-nav-item ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <span>▦</span> Overview &amp; Dashboard
            </button>
            <button
              className={`console-nav-item ${activeTab === "attendance" ? "active" : ""}`}
              onClick={() => setActiveTab("attendance")}
            >
              <span>◷</span> Monthly Attendance &amp; Muster
            </button>
            <button
              className={`console-nav-item ${activeTab === "timetable" ? "active" : ""}`}
              onClick={() => setActiveTab("timetable")}
            >
              <span>▤</span> Exam Timetable &amp; Hall Pass
            </button>
            <button
              className={`console-nav-item ${activeTab === "fees" ? "active" : ""}`}
              onClick={() => setActiveTab("fees")}
            >
              <span>💳</span> Fee Ledger &amp; Receipts
            </button>
          </nav>
        </div>

        {/* Bottom Profile Card - Interactive Click to View ID & Dossier */}
        <div className="sidebar-bottom-profile">
          <button
            className="sidebar-bottom-profile-btn"
            onClick={() => setIsDossierModalOpen(true)}
            title="Click to view My ID &amp; Documents Dossier"
          >
            <div className="profile-avatar-circle" style={{ background: "#7c3aed" }}>
              <span>🪪</span>
            </div>
            <div className="profile-details-column">
              <div className="profile-name-row">
                <span title={displayName}>{displayName}</span>
                <span className="verified-badge-icon">✓</span>
              </div>
              <p className="profile-role-subtext">{displayClass} • Scholar</p>
              <p className="profile-id-code">
                Adm: {studentProfile?.admissionNumber || "ADM-14920"}
              </p>
            </div>
          </button>
          <button
            className="logout-icon-btn"
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign Out"
          >
            🚪
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT AREA ---------------- */}
      <div className="portal-main">
        {/* Top Header Bar */}
        <header className="topbar admin-header" style={{ padding: "0 28px" }}>
          <div className="header-breadcrumbs">
            <span>Student Portal</span> / <span>Academics</span> /{" "}
            <strong>
              {activeTab === "overview" && "Overview & Dashboard"}
              {activeTab === "attendance" && "Monthly Attendance & Muster"}
              {activeTab === "timetable" && "Exam Timetable & Seating Pass"}
              {activeTab === "fees" && "Fee Ledger & Official Receipts"}
            </strong>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                background: "#eff6ff",
                color: "#1d4ed8",
                padding: "5px 12px",
                borderRadius: "20px",
                fontWeight: "700",
                fontSize: "12px",
                border: "1px solid #bfdbfe",
              }}
            >
              {displayClass} (Malayalam Medium)
            </span>
            <span
              style={{
                background: "#dcfce7",
                color: "#15803d",
                padding: "5px 12px",
                borderRadius: "20px",
                fontWeight: "700",
                fontSize: "11px",
                border: "1px solid #bbf7d0",
              }}
            >
              🟢 SCERT Core Active
            </span>

            {/* Profile Avatar Trigger in Header */}
            <button
              className="topbar-profile-btn"
              onClick={() => setIsDossierModalOpen(true)}
              title="Click to view My Identity &amp; Documents"
            >
              <div className="topbar-avatar-circle">
                {getInitials(displayName)}
              </div>
              <div className="topbar-profile-info">
                <span className="topbar-profile-name">{displayName.split(" ")[0]}</span>
                <span className="topbar-profile-badge">🪪 My ID &amp; Docs</span>
              </div>
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          {/* ========================================================
              TAB 1: OVERVIEW & DASHBOARD
             ======================================================== */}
          {activeTab === "overview" && (
            <>
              {/* Welcome Card */}
              <section className="welcome-card">
                {/* Clickable Profile Avatar */}
                <div
                  className="avatar main-avatar avatar-clickable"
                  onClick={() => setIsDossierModalOpen(true)}
                  title="Click to view My ID &amp; Documents Dossier"
                >
                  {getInitials(displayName)}
                  <span className="avatar-id-badge" title="View Identity Dossier">🪪</span>
                </div>

                <div className="welcome-info">
                  <h1>Welcome back, {displayName}!</h1>
                  <span className="active-badge">Active Scholar • Form 6A Verified</span>

                  <p>
                    {displayClass} (Malayalam Medium)
                    {studentProfile?.rollNumber && (
                      <>
                        <span>•</span>
                        Roll No: {studentProfile.rollNumber}
                      </>
                    )}
                    {studentProfile?.admissionNumber && (
                      <>
                        <span>•</span>
                        Adm: {studentProfile.admissionNumber}
                      </>
                    )}
                    {studentProfile?.sampoornaId && (
                      <>
                        <span>•</span>
                        Sampoorna: {studentProfile.sampoornaId}
                      </>
                    )}
                  </p>

                  <p>
                    Email:{" "}
                    <strong>
                      {studentProfile?.email || user?.email || "scholar@ghssrajakkad.org"}
                    </strong>
                    &nbsp;• Blood Group:{" "}
                    <strong style={{ color: "#b91c1c" }}>
                      {studentProfile?.bloodGroup || "O+"}
                    </strong>
                  </p>
                </div>

                <div className="welcome-actions">
                  <button
                    className="secondary-button"
                    onClick={() => setIsDossierModalOpen(true)}
                    title="View Aadhaar, Birth Certificate, and Statutory Identity"
                  >
                    🪪 My ID &amp; Documents
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => setActiveTab("timetable")}
                  >
                    ▤ Exam Schedule
                  </button>
                  <button
                    className="primary-button"
                    onClick={() => setViewingHallTicket(true)}
                  >
                    🖨️ Hall Ticket
                  </button>
                </div>
              </section>

              {/* Metric Summary Cards */}
              <section className="metrics-grid" aria-label="Student summary">
                {/* Attendance Rate */}
                <article
                  className="metric-card metric-attendance"
                  onClick={() => setActiveTab("attendance")}
                  style={{ cursor: "pointer" }}
                >
                  <p className="metric-title">ATTENDANCE RATE</p>
                  <div className="metric-value-row">
                    <h2>{attendanceStats?.rate || "98.4%"}</h2>
                    <span className="metric-extra attendance">
                      {attendanceStats?.presentDays ?? 98} Present /{" "}
                      {attendanceStats?.absentDays ?? 2} Absent
                    </span>
                  </div>
                  <p className="metric-description">
                    {attendanceStats?.totalWorkingDays ?? 100} Working Days Recorded in Muster
                  </p>
                </article>

                {/* Upcoming Exam */}
                <article
                  className="metric-card metric-exam"
                  onClick={() => setActiveTab("timetable")}
                  style={{ cursor: "pointer" }}
                >
                  <p className="metric-title">UPCOMING EXAM</p>
                  <div className="metric-value-row">
                    <h2 style={{ fontSize: "19px" }}>
                      {nextExam ? nextExam.subject.split("-")[0] : "SSLC Board Exam"}
                    </h2>
                  </div>
                  <p className="metric-description">
                    {nextExam ? `${nextExam.date} • ${nextExam.startTime}` : "12 March 2026 • 09:30 AM"}
                  </p>
                </article>

                {/* Fee Status */}
                <article
                  className="metric-card metric-score"
                  onClick={() => setActiveTab("fees")}
                  style={{ cursor: "pointer" }}
                >
                  <p className="metric-title">FEE BALANCE STATUS</p>
                  <div className="metric-value-row">
                    <h2>
                      {totalFeeDue === 0 ? "₹0 Due" : `₹${totalFeeDue}`}
                    </h2>
                    <span
                      className="metric-extra"
                      style={{
                        background: totalFeeDue === 0 ? "#dcfce7" : "#fee2e2",
                        color: totalFeeDue === 0 ? "#15803d" : "#b91c1c",
                      }}
                    >
                      {totalFeeDue === 0 ? "All Cleared ✓" : "Pending Due"}
                    </span>
                  </div>
                  <p className="metric-description">
                    Billed: ₹{feesData?.summary?.totalBilled ?? 2800} • Paid: ₹{feesData?.summary?.totalPaid ?? 2300}
                  </p>
                </article>

                {/* Class Mentor */}
                <article className="metric-card metric-days">
                  <p className="metric-title">CLASS MENTOR</p>
                  <div className="metric-value-row">
                    <h2 style={{ fontSize: "17px" }}>
                      {mentorProfile?.name || "Mrs. Priya Nair"}
                    </h2>
                    <span className="metric-extra days">
                      {mentorProfile?.designation || "HSST"}
                    </span>
                  </div>
                  <p className="metric-description">
                    {mentorProfile?.department || "HSST Malayalam"} • {mentorProfile?.phone || "+91 94471 22334"}
                  </p>
                </article>
              </section>

              {/* Lower Schedule & Notices Grid */}
              <section className="lower-grid">
                <article className="schedule-panel">
                  <div className="panel-heading">
                    <div className="panel-title">
                      <span className="heading-marker blue-marker" />
                      <h2>Today's Class Schedule &amp; Routine</h2>
                    </div>
                    <span className="schedule-period">Monday • Period 1 to 7</span>
                  </div>

                  <div className="lesson-grid">
                    {lessons.map((lesson) => (
                      <div
                        className={`lesson-card lesson-${lesson.type}`}
                        key={lesson.subject}
                      >
                        <span className="lesson-time">{lesson.time}</span>
                        <h3>{lesson.subject}</h3>
                        <p>{lesson.teacher}</p>
                        <span className="lesson-room">{lesson.room}</span>
                      </div>
                    ))}
                  </div>

                  <div className="schedule-footer">
                    <span>
                      Class Mentor Sign-off for Terminal Exam Hall Pass:
                      <strong className="verified-text"> Verified &amp; Endorsed</strong>
                    </span>
                    <button
                      className="text-button"
                      onClick={() => setActiveTab("timetable")}
                    >
                      View full exam timetable →
                    </button>
                  </div>
                </article>

                <aside className="notices-panel">
                  <div className="panel-heading">
                    <div className="panel-title">
                      <span className="heading-marker gray-marker" />
                      <h2>Academic Notices</h2>
                    </div>
                    <span className="notice-source">SCERT</span>
                  </div>

                  <div className="notice-list">
                    {notices.map((notice) => (
                      <article className="notice-card" key={notice.title}>
                        <div className="notice-topline">
                          <span>{notice.date}</span>
                          <span className={`notice-tag ${notice.type}`}>
                            {notice.tag}
                          </span>
                        </div>
                        <h3>{notice.title}</h3>
                        <p>{notice.description}</p>
                      </article>
                    ))}
                  </div>

                  <div className="notice-footer">
                    Principal's Office
                    <span>Notice Ref #GHSS-26/042</span>
                  </div>
                </aside>
              </section>
            </>
          )}

          {/* ========================================================
              TAB 2: MONTHLY ATTENDANCE & MUSTER
             ======================================================== */}
          {activeTab === "attendance" && (
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
                    Overall Turnout: {attendanceStats?.rate || "98.4%"}
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
                    {attendanceStats?.totalWorkingDays ?? 100} Days
                  </h3>
                </div>

                <div className="dossier-card" style={{ padding: "16px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#15803d" }}>
                    DAYS PRESENT
                  </span>
                  <h3 style={{ fontSize: "24px", margin: "6px 0 0", color: "#15803d" }}>
                    {attendanceStats?.presentDays ?? 98} Days
                  </h3>
                </div>

                <div className="dossier-card" style={{ padding: "16px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#dc2626" }}>
                    DAYS ABSENT
                  </span>
                  <h3 style={{ fontSize: "24px", margin: "6px 0 0", color: "#dc2626" }}>
                    {attendanceStats?.absentDays ?? 2} Days
                  </h3>
                </div>

                <div className="dossier-card" style={{ padding: "16px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb" }}>
                    AUTHENTICATED MENTOR
                  </span>
                  <h3 style={{ fontSize: "16px", margin: "6px 0 0", color: "#1d4ed8" }}>
                    {mentorProfile?.name || "Mrs. Priya Nair"}
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
                    {(
                      attendanceStats?.monthlyBreakdown || [
                        { month: "October 2026", total: 24, present: 23, absent: 1, rate: "95.8%" },
                        { month: "September 2026", total: 22, present: 22, absent: 0, rate: "100.0%" },
                        { month: "August 2026", total: 21, present: 21, absent: 0, rate: "100.0%" },
                        { month: "July 2026", total: 25, present: 24, absent: 1, rate: "96.0%" },
                        { month: "June 2026", total: 20, present: 20, absent: 0, rate: "100.0%" },
                      ]
                    ).map((m) => (
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
                    ))}
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
                  {(
                    attendanceStats?.absentDates || [
                      "28 Oct 2026 (Leave intimation sanctioned by Class Mentor)",
                    ]
                  ).map((dateStr, idx) => (
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
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: EXAM TIMETABLE & HALL PASS
             ======================================================== */}
          {activeTab === "timetable" && (
            <div>
              <div className="student-section-header">
                <div className="student-section-title-group">
                  <h2>Official Examination Timetables &amp; Seating Plan</h2>
                  <p>
                    Published by Pareeksha Bhavan / SCERT Kerala for Standard 10 &amp; Plus Two
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    className="primary-button"
                    onClick={() => setViewingHallTicket(true)}
                  >
                    🖨️ View &amp; Print Hall Ticket
                  </button>
                </div>
              </div>

              {/* Exam Cards List */}
              {loadingExams ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  Loading examination timetables...
                </div>
              ) : exams.length === 0 ? (
                <div className="dossier-card" style={{ textAlign: "center", padding: "40px" }}>
                  <p>No exams currently published for your standard.</p>
                </div>
              ) : (
                exams.map((exam) => (
                  <div className="exam-item-card" key={exam._id}>
                    <div className="exam-item-top">
                      <div>
                        <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700" }}>
                          {exam.term} • {exam.standard}
                        </div>
                        <h3 className="exam-subject-title">{exam.subject}</h3>
                      </div>
                      <span className="badge-status paid">
                        ✓ {exam.status || "Approved & Published"}
                      </span>
                    </div>

                    <div className="exam-meta-row">
                      <span className="exam-meta-pill">📅 {exam.date}</span>
                      <span className="exam-meta-pill">
                        ⏰ {exam.startTime} - {exam.endTime} ({exam.duration})
                      </span>
                      <span className="exam-meta-pill">🏷️ QP Code: {exam.qpCode}</span>
                      <span className="exam-meta-pill">🏛️ Hall: {exam.hall}</span>
                      <span>
                        Max: <strong>{exam.maxMarks}</strong> / Pass:{" "}
                        <strong>{exam.passMarks}</strong>
                      </span>
                    </div>

                    {exam.instructions && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "10px 14px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "#475569",
                        }}
                      >
                        📌 <strong>Instructions:</strong> {exam.instructions}
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Examination Guidelines Box */}
              <div
                className="dossier-card"
                style={{ marginTop: "20px", background: "#f8fafc" }}
              >
                <h4 style={{ margin: "0 0 8px", fontSize: "14px", color: "#0f172a" }}>
                  📋 Mandatory Kerala Pareeksha Bhavan Exam Guidelines:
                </h4>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "20px",
                    fontSize: "12.5px",
                    color: "#475569",
                    lineHeight: "1.8",
                  }}
                >
                  <li>
                    Candidates must be seated in their designated hall 15 minutes before the
                    commencement of cool-off time.
                  </li>
                  <li>
                    15 minutes cool-off time is designated exclusively for reading question papers;
                    no writing is permitted during this window.
                  </li>
                  <li>
                    Carrying mobile phones, smartwatches, programmable calculators, or revision
                    sheets into the hall is strictly prohibited under Examination Discipline Act.
                  </li>
                  <li>
                    Candidates must display their authorized Photo Hall Ticket on their desk at all
                    times.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: FEE LEDGER & RECEIPTS
             ======================================================== */}
          {activeTab === "fees" && (
            <div>
              <div className="student-section-header">
                <div className="student-section-title-group">
                  <h2>Fee Payment Ledger &amp; Official Receipts</h2>
                  <p>
                    Real-time fee billing, dues clearance, and official receipt vouchers
                  </p>
                </div>
              </div>

              {/* Fee Highlights Summary */}
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
                    TOTAL BILLED FEES
                  </span>
                  <h3 style={{ fontSize: "24px", margin: "6px 0 0", color: "#0f172a" }}>
                    ₹{feesData?.summary?.totalBilled ?? 2800}
                  </h3>
                </div>

                <div className="dossier-card" style={{ padding: "16px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#15803d" }}>
                    TOTAL AMOUNT PAID
                  </span>
                  <h3 style={{ fontSize: "24px", margin: "6px 0 0", color: "#15803d" }}>
                    ₹{feesData?.summary?.totalPaid ?? 2300}
                  </h3>
                </div>

                <div className="dossier-card" style={{ padding: "16px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#dc2626" }}>
                    OUTSTANDING DUE
                  </span>
                  <h3 style={{ fontSize: "24px", margin: "6px 0 0", color: "#dc2626" }}>
                    ₹{feesData?.summary?.totalDue ?? 500}
                  </h3>
                </div>

                <div className="dossier-card" style={{ padding: "16px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb" }}>
                    LEDGER STATUS
                  </span>
                  <h3
                    style={{
                      fontSize: "16px",
                      margin: "6px 0 0",
                      color: totalFeeDue === 0 ? "#15803d" : "#b45309",
                    }}
                  >
                    {feesData?.summary?.status || (totalFeeDue === 0 ? "All Dues Cleared ✓" : "₹500 Pending Due")}
                  </h3>
                </div>
              </div>

              {/* Payments Table */}
              <div className="student-table-container">
                <table className="student-data-table">
                  <thead>
                    <tr>
                      <th>Receipt #</th>
                      <th>Fee Category</th>
                      <th>Term</th>
                      <th>Billed Amount</th>
                      <th>Paid Amount</th>
                      <th>Due Balance</th>
                      <th>Payment Date</th>
                      <th>Mode</th>
                      <th>Status</th>
                      <th>Voucher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feesData?.payments?.length > 0 ? (
                      feesData.payments.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <strong>{p.receiptNumber}</strong>
                          </td>
                          <td>
                            <strong>{p.feeCategory}</strong>
                          </td>
                          <td>{p.term}</td>
                          <td>₹{p.totalAmount}</td>
                          <td style={{ color: "#15803d", fontWeight: "700" }}>
                            ₹{p.amountPaid}
                          </td>
                          <td
                            style={{
                              color: p.dueAmount > 0 ? "#dc2626" : "#64748b",
                              fontWeight: "700",
                            }}
                          >
                            ₹{p.dueAmount}
                          </td>
                          <td>{p.paymentDate}</td>
                          <td style={{ fontSize: "12px", color: "#64748b" }}>
                            {p.paymentMode}
                          </td>
                          <td>
                            <span
                              className={`badge-status ${
                                p.status === "Paid"
                                  ? "paid"
                                  : p.status === "Partial"
                                  ? "partial"
                                  : "pending"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="dossier-copy-btn"
                              onClick={() => setViewingReceipt(p)}
                            >
                              Receipt ↗
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" style={{ textAlign: "center", padding: "30px" }}>
                          No fee payments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="dashboard-footer">
            <span>
              © 2026 G.H.S.S Rajakkad - General Education Dept., Govt. of Kerala
            </span>
            <span>
              Affiliation: SCERT Kerala • School Code: 06042 • Sampoorna 2.0
            </span>
          </footer>
        </main>
      </div>

      {/* ========================================================
          MODAL 1: MY IDENTITY & STATUTORY DOCUMENTS DOSSIER
          (TRIGGERED FROM PROFILE AVATAR / ICON)
         ======================================================== */}
      {isDossierModalOpen && (
        <div
          className="student-modal-overlay"
          onClick={() => setIsDossierModalOpen(false)}
        >
          <div
            className="student-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "860px" }}
          >
            <div className="student-modal-header">
              <div>
                <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🪪</span> My Identity &amp; Statutory Documents Dossier
                </h3>
                <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#64748b" }}>
                  Government of Kerala • General Education Dept. • Sampoorna 2.0 Form 6A
                </p>
              </div>
              <button
                className="btn-close-modal"
                onClick={() => setIsDossierModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Profile Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  fontWeight: "800",
                  flexShrink: 0,
                }}
              >
                {getInitials(displayName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>
                  {displayName}
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
                  {displayClass} • Roll #{studentProfile?.rollNumber || 14} •{" "}
                  <strong>{studentProfile?.email || user?.email}</strong>
                </p>
              </div>
              <span
                style={{
                  background: "#dcfce7",
                  color: "#15803d",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  border: "1px solid #bbf7d0",
                }}
              >
                ✓ Form 6A Certified
              </span>
            </div>

            {/* Dossier Grid */}
            <div className="student-dossier-grid" style={{ marginBottom: "16px" }}>
              {/* 1. Official Statutory Identification */}
              <div className="dossier-card">
                <div className="dossier-card-header">
                  <div className="dossier-card-title">
                    <span className="icon">🏛️</span>
                    Statutory Identification
                  </div>
                </div>

                <div className="dossier-field-list">
                  <div className="dossier-field-item">
                    <label>Sampoorna Student UID</label>
                    <div className="dossier-field-value">
                      {studentProfile?.sampoornaId || "SMP-06042-892"}
                      <button
                        className="dossier-copy-btn"
                        onClick={() =>
                          handleCopy(
                            studentProfile?.sampoornaId || "SMP-06042-892",
                            "sampoorna-modal"
                          )
                        }
                      >
                        {copiedField === "sampoorna-modal" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="dossier-field-item">
                    <label>Admission Number</label>
                    <div className="dossier-field-value">
                      {studentProfile?.admissionNumber || "ADM-14920"}
                      <button
                        className="dossier-copy-btn"
                        onClick={() =>
                          handleCopy(
                            studentProfile?.admissionNumber || "ADM-14920",
                            "adm-modal"
                          )
                        }
                      >
                        {copiedField === "adm-modal" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="dossier-field-item">
                    <label>Aadhaar UID Number</label>
                    <div className="dossier-field-value">
                      {studentProfile?.aadhaarNumber || "9482-1049-2810"}
                    </div>
                  </div>

                  <div className="dossier-field-item">
                    <label>Birth Certificate No</label>
                    <div className="dossier-field-value">
                      {studentProfile?.birthCertificateNumber || "BC/IDK/2010/8812"}
                    </div>
                  </div>

                  <div className="dossier-field-item">
                    <label>Date of Birth</label>
                    <div className="dossier-field-value">
                      {studentProfile?.dob || "14 May 2010"}
                    </div>
                  </div>

                  <div className="dossier-field-item">
                    <label>Gender &amp; Blood Group</label>
                    <div className="dossier-field-value">
                      {studentProfile?.gender || "Male"} •{" "}
                      <span style={{ color: "#dc2626", fontWeight: "700" }}>
                        {studentProfile?.bloodGroup || "O+"}
                      </span>
                    </div>
                  </div>

                  <div className="dossier-field-item">
                    <label>Category &amp; Caste</label>
                    <div className="dossier-field-value">
                      {studentProfile?.category || "General"}{" "}
                      {studentProfile?.caste ? `(${studentProfile.caste})` : ""}
                    </div>
                  </div>

                  <div className="dossier-field-item">
                    <label>Transfer Certificate</label>
                    <div className="dossier-field-value">
                      {studentProfile?.tcNumber || "TC/2024/0912"}
                    </div>
                  </div>

                  <div className="dossier-field-item dossier-field-full">
                    <label>Identification Marks (As in TC)</label>
                    <div className="dossier-field-value">
                      {studentProfile?.identificationMarks || "Mole on left collarbone"}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Attached Government Documents */}
              <div className="dossier-card">
                <div className="dossier-card-header">
                  <div className="dossier-card-title">
                    <span className="icon">📁</span>
                    Attached Identity Documents
                  </div>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    PDF / High-Res Image
                  </span>
                </div>

                {/* Aadhaar Card Box */}
                <div
                  className={`student-doc-card ${
                    studentProfile?.idProofUrl ? "attached" : ""
                  }`}
                >
                  <div className="student-doc-info">
                    <div className="student-doc-icon-circle">🪪</div>
                    <div className="student-doc-text">
                      <h4>Aadhaar Card Copy (UIDAI)</h4>
                      <p>
                        {studentProfile?.idProofFileName ||
                          (studentProfile?.idProofUrl
                            ? "Scanned_Aadhaar_UID.pdf"
                            : "Verified UID Record on File")}
                      </p>
                    </div>
                  </div>
                  <div className="student-doc-actions">
                    {studentProfile?.idProofUrl ? (
                      <a
                        href={getDocumentUrl(studentProfile.idProofUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-doc-view"
                      >
                        View Document ↗
                      </a>
                    ) : (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#059669",
                          background: "#ecfdf5",
                          padding: "4px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        ✓ Seeded via Aadhaar
                      </span>
                    )}
                  </div>
                </div>

                {/* Birth Certificate Box */}
                <div
                  className={`student-doc-card ${
                    studentProfile?.birthCertificateUrl ? "attached" : ""
                  }`}
                >
                  <div className="student-doc-info">
                    <div className="student-doc-icon-circle">📜</div>
                    <div className="student-doc-text">
                      <h4>Birth Certificate Copy</h4>
                      <p>
                        {studentProfile?.birthCertificateFileName ||
                          (studentProfile?.birthCertificateUrl
                            ? "Birth_Certificate.pdf"
                            : "Civil Registrar Copy Verified")}
                      </p>
                    </div>
                  </div>
                  <div className="student-doc-actions">
                    {studentProfile?.birthCertificateUrl ? (
                      <a
                        href={getDocumentUrl(studentProfile.birthCertificateUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-doc-view"
                      >
                        View Document ↗
                      </a>
                    ) : (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#059669",
                          background: "#ecfdf5",
                          padding: "4px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        ✓ Official Record
                      </span>
                    )}
                  </div>
                </div>

                {/* Prior School */}
                <div
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      color: "#64748b",
                      marginBottom: "4px",
                    }}
                  >
                    Prior School &amp; Transfer Record
                  </label>
                  <div style={{ fontSize: "13px", color: "#1e293b", fontWeight: "600" }}>
                    {studentProfile?.previousSchool || "Govt. U.P. School Rajakkad"}
                  </div>
                </div>
              </div>

              {/* 3. Family & Contacts */}
              <div className="dossier-card">
                <div className="dossier-card-header">
                  <div className="dossier-card-title">
                    <span className="icon">👨‍👩‍👦</span>
                    Family &amp; Guardian Details
                  </div>
                </div>

                <div className="dossier-field-list">
                  <div className="dossier-field-item">
                    <label>Father's Full Name</label>
                    <div className="dossier-field-value">
                      {studentProfile?.fatherName || "Mr. S. K. Pillai"}
                    </div>
                  </div>

                  <div className="dossier-field-item">
                    <label>Mother's Full Name</label>
                    <div className="dossier-field-value">
                      {studentProfile?.motherName || "Mrs. Lakshmi Pillai"}
                    </div>
                  </div>

                  <div className="dossier-field-item">
                    <label>Official Guardian</label>
                    <div className="dossier-field-value">
                      {studentProfile?.guardian || "Mr. S. K. Pillai"} (
                      {studentProfile?.guardianRelation || "Father"})
                    </div>
                  </div>

                  <div className="dossier-field-item">
                    <label>Primary Phone</label>
                    <div className="dossier-field-value">
                      {studentProfile?.parentContact || "+91 94471 22334"}
                    </div>
                  </div>

                  <div className="dossier-field-item dossier-field-full">
                    <label>Alternate / Emergency Contact</label>
                    <div className="dossier-field-value">
                      {studentProfile?.altContact || "+91 94471 55667"}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Residential Address */}
              <div className="dossier-card">
                <div className="dossier-card-header">
                  <div className="dossier-card-title">
                    <span className="icon">🏡</span>
                    Residential Address
                  </div>
                </div>

                <div style={{ fontSize: "13.5px", lineHeight: "1.7", color: "#1e293b" }}>
                  <div style={{ fontWeight: "700", color: "#0f172a" }}>
                    {studentProfile?.address?.houseName || "Thiruvonam Nilayam"}
                  </div>
                  <div>
                    {studentProfile?.address?.street || "Munnar Road"},{" "}
                    {studentProfile?.address?.postOffice || "Rajakkad P.O"}
                  </div>
                  <div>
                    {studentProfile?.address?.district || "Idukki"},{" "}
                    {studentProfile?.address?.state || "Kerala"} -{" "}
                    <strong>{studentProfile?.address?.pincode || "685566"}</strong>
                  </div>

                  <div
                    style={{
                      marginTop: "12px",
                      padding: "8px 10px",
                      background: "#f1f5f9",
                      borderRadius: "6px",
                      fontSize: "11.5px",
                      color: "#475569",
                    }}
                  >
                    📍 Postal Address: {studentProfile?.fullAddress}
                  </div>
                </div>
              </div>
            </div>

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
                className="secondary-button"
                onClick={() => setIsDossierModalOpen(false)}
              >
                Close
              </button>
              <button
                className="primary-button"
                onClick={() => window.print()}
              >
                🖨️ Print Dossier (Form 6A)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: OFFICIAL HALL TICKET / ADMIT CARD
         ======================================================== */}
      {viewingHallTicket && (
        <div className="student-modal-overlay" onClick={() => setViewingHallTicket(false)}>
          <div
            className="student-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "760px" }}
          >
            <div className="student-modal-header">
              <h3>Kerala Board Examination - Official Hall Ticket</h3>
              <button
                className="btn-close-modal"
                onClick={() => setViewingHallTicket(false)}
              >
                ✕
              </button>
            </div>

            <div className="hall-ticket-container" id="printable-hall-ticket">
              <div className="hall-ticket-header">
                <h2>GOVERNMENT OF KERALA • GENERAL EDUCATION DEPARTMENT</h2>
                <h4>PAREEKSHA BHAVAN, THIRUVANANTHAPURAM</h4>
                <div style={{ fontSize: "12px", fontWeight: "700", marginTop: "4px" }}>
                  SSLC BOARD EXAMINATION MARCH 2026 • ADMISSION TICKET
                </div>
              </div>

              <div className="hall-ticket-grid">
                <div className="hall-ticket-details">
                  <div>
                    <strong>Candidate Name:</strong>
                    <div>{displayName}</div>
                  </div>
                  <div>
                    <strong>Sampoorna UID:</strong>
                    <div>{studentProfile?.sampoornaId || "SMP-06042-892"}</div>
                  </div>
                  <div>
                    <strong>Roll Number:</strong>
                    <div>#{studentProfile?.rollNumber || 14}</div>
                  </div>
                  <div>
                    <strong>Admission No:</strong>
                    <div>{studentProfile?.admissionNumber || "ADM-14920"}</div>
                  </div>
                  <div>
                    <strong>Exam Center:</strong>
                    <div>G.H.S.S Rajakkad (Code: 06042)</div>
                  </div>
                  <div>
                    <strong>Class &amp; Division:</strong>
                    <div>{displayClass}</div>
                  </div>
                  <div>
                    <strong>Date of Birth:</strong>
                    <div>{studentProfile?.dob || "14 May 2010"}</div>
                  </div>
                  <div>
                    <strong>Assigned Exam Hall:</strong>
                    <div style={{ color: "#1d4ed8", fontWeight: "700" }}>
                      Hall 02 (Room 102 - Science Block)
                    </div>
                  </div>
                </div>

                <div className="candidate-photo-box">
                  <div style={{ fontSize: "28px" }}>🎓</div>
                  <div>Affix Attested Photo</div>
                </div>
              </div>

              <table className="student-data-table" style={{ fontSize: "11.5px" }}>
                <thead>
                  <tr>
                    <th>Date &amp; Day</th>
                    <th>Time</th>
                    <th>Subject</th>
                    <th>QP Code</th>
                    <th>Invigilator Initial</th>
                  </tr>
                </thead>
                <tbody>
                  {(exams.length > 0 ? exams : [
                    { date: "12 Mar 2026, Thu", startTime: "09:30 AM", subject: "Malayalam Part I", qpCode: "MAL-101" },
                    { date: "16 Mar 2026, Mon", startTime: "09:30 AM", subject: "English", qpCode: "ENG-102" },
                    { date: "19 Mar 2026, Thu", startTime: "09:30 AM", subject: "Mathematics", qpCode: "MAT-103" },
                    { date: "23 Mar 2026, Mon", startTime: "09:30 AM", subject: "Physics", qpCode: "PHY-104" },
                  ]).map((e, idx) => (
                    <tr key={idx}>
                      <td>{e.date}</td>
                      <td>{e.startTime}</td>
                      <td>
                        <strong>{e.subject}</strong>
                      </td>
                      <td>{e.qpCode}</td>
                      <td style={{ borderBottom: "1px dashed #cbd5e1" }}></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="hall-ticket-footer">
                <div>
                  <div className="sign-line">Candidate Signature</div>
                </div>
                <div>
                  <div className="sign-line">Headmaster / Chief Supdt.</div>
                  <div style={{ fontSize: "10px", color: "#64748b", textAlign: "center" }}>
                    Official Seal of G.H.S.S Rajakkad
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <button
                className="secondary-button"
                onClick={() => setViewingHallTicket(false)}
              >
                Close
              </button>
              <button
                className="primary-button"
                onClick={() => window.print()}
              >
                🖨️ Print Hall Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: FEE RECEIPT VOUCHER
         ======================================================== */}
      {viewingReceipt && (
        <div className="student-modal-overlay" onClick={() => setViewingReceipt(null)}>
          <div
            className="student-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "600px" }}
          >
            <div className="student-modal-header">
              <h3>Official Fee Receipt Voucher</h3>
              <button
                className="btn-close-modal"
                onClick={() => setViewingReceipt(null)}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                border: "2px solid #0f172a",
                borderRadius: "8px",
                padding: "20px",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  borderBottom: "1px solid #e2e8f0",
                  paddingBottom: "12px",
                  marginBottom: "14px",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "16px", textTransform: "uppercase" }}>
                  GOVERNMENT HIGHER SECONDARY SCHOOL RAJAKKAD
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>
                  School Code: 06042 • Idukki District, Kerala
                </p>
                <div
                  style={{
                    display: "inline-block",
                    background: "#0f172a",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "2px 10px",
                    borderRadius: "4px",
                    marginTop: "6px",
                  }}
                >
                  FEE PAYMENT RECEIPT (STUDENT COPY)
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  fontSize: "12.5px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <strong>Receipt Number:</strong> {viewingReceipt.receiptNumber}
                </div>
                <div>
                  <strong>Payment Date:</strong> {viewingReceipt.paymentDate}
                </div>
                <div>
                  <strong>Student Name:</strong> {viewingReceipt.studentName}
                </div>
                <div>
                  <strong>Admission No:</strong> {viewingReceipt.admissionNumber}
                </div>
                <div>
                  <strong>Class &amp; Division:</strong> {viewingReceipt.classDivision}
                </div>
                <div>
                  <strong>Academic Term:</strong> {viewingReceipt.term}
                </div>
                <div>
                  <strong>Payment Mode:</strong> {viewingReceipt.paymentMode}
                </div>
                <div>
                  <strong>Transaction Ref:</strong>{" "}
                  {viewingReceipt.transactionReference || "COUNTER-CASH"}
                </div>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "14px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "13px",
                  }}
                >
                  <span>Fee Category:</span>
                  <strong>{viewingReceipt.feeCategory}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "13px",
                  }}
                >
                  <span>Total Amount Billed:</span>
                  <span>₹{viewingReceipt.totalAmount}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px dashed #cbd5e1",
                    paddingTop: "8px",
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#15803d",
                  }}
                >
                  <span>Amount Paid:</span>
                  <span>₹{viewingReceipt.amountPaid}</span>
                </div>
                {viewingReceipt.dueAmount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "6px",
                      fontSize: "12.5px",
                      color: "#dc2626",
                    }}
                  >
                    <span>Remaining Balance:</span>
                    <span>₹{viewingReceipt.dueAmount}</span>
                  </div>
                )}
              </div>

              {viewingReceipt.remarks && (
                <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 14px" }}>
                  Note: {viewingReceipt.remarks}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  paddingTop: "14px",
                  borderTop: "1px dashed #cbd5e1",
                  fontSize: "11px",
                }}
              >
                <div>Collected By: {viewingReceipt.collectedBy}</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ borderTop: "1px solid #0f172a", width: "120px", paddingTop: "3px" }}>
                    Authorized Cashier
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "16px",
              }}
            >
              <button
                className="secondary-button"
                onClick={() => setViewingReceipt(null)}
              >
                Close
              </button>
              <button
                className="primary-button"
                onClick={() => window.print()}
              >
                🖨️ Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
