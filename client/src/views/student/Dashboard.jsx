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
];

const notices = [
  {
    date: "DEC 12, 2025",
    title: "Second Terminal Hall Tickets Issued",
    description:
      "Collect signed admit cards from Mentor Mrs. Priya Nair before 17 Dec.",
    tag: "Urgent",
    type: "urgent",
  },
  {
    date: "DEC 10, 2025",
    title: "Christmas Vacation Schedule",
    description:
      "School closes on Dec 24, 2025 (1:00 PM) and reopens on Jan 02, 2026.",
    tag: "Holiday",
    type: "holiday",
  },
];

function StudentDashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // 1. Verify session validity
    if (!isSessionValid()) {
      clearAuthSession();
      navigate("/login?session=expired", { replace: true });
      return;
    }

    // 3. Block browser back button from navigating back to login
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);

    // 4. Auto-logout timer if session expires while tab is open
    const interval = setInterval(() => {
      if (!isSessionValid()) {
        clearAuthSession();
        navigate("/login?session=expired", { replace: true });
      }
    }, 10000);

    // 5. Fetch live student profile and attendance metrics from backend
    async function fetchDashboardMetrics() {
      try {
        const res = await api.get("/student/dashboard-data");
        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load student dashboard data:", err);
      }
    }

    fetchDashboardMetrics();

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
    if (!name) return "Student";
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
  const attendanceStats = dashboardData?.attendance;

  const displayName = getDisplayName(
    studentProfile?.name || user?.name || user?.username || user?.email
  );

  const displayClass =
    studentProfile?.className || "Class 10-A";

  const metrics = [
    {
      title: "ATTENDANCE RATE",
      value: attendanceStats?.rate || "100%",
      extra:
        attendanceStats && attendanceStats.totalWorkingDays > 0
          ? `${attendanceStats.presentDays} Present / ${attendanceStats.absentDays} Absent`
          : "Verified Muster",
      description: attendanceStats && attendanceStats.totalWorkingDays > 0
        ? `${attendanceStats.presentDays} Present out of ${attendanceStats.totalWorkingDays} Working Days`
        : "Complete Academic Attendance Record",
      type: "attendance",
    },
    {
      title: "UPCOMING EXAM",
      value: "Second Terminal",
      description: "Malayalam Paper I • 09:30 AM",
      type: "exam",
    },
    {
      title: "FIRST TERM SCORE",
      value: "88.5%",
      extra: "Grade A+",
      description: "Total 531 / 600 • Distinction",
      type: "score",
    },
    {
      title: "REMAINING DAYS",
      value: "14 Days",
      extra: "Term II",
      description: "Christmas Vacation: 24 Dec",
      type: "days",
    },
  ];

  return (
    <div className="portal">
      {/* Sidebar Navigation */}
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
            <a className="console-nav-item active nav-item" href="#overview">
              <span>▦</span> Overview &amp; Dashboard
            </a>
            <a className="console-nav-item nav-item" href="#attendance">
              <span>◷</span> Monthly Attendance
            </a>
            <a className="console-nav-item nav-item" href="#timetable">
              <span>▤</span> Exam Timetable
            </a>
            <a className="console-nav-item nav-item" href="#results">
              <span>☆</span> Term Results
            </a>
          </nav>
        </div>

        {/* Bottom Profile Card */}
        <div className="sidebar-bottom-profile">
          <div className="profile-avatar-circle" style={{ background: "#7c3aed" }}>
            <span>🎓</span>
          </div>
          <div className="profile-details-column">
            <div className="profile-name-row">
              <span>{displayName}</span>
              <span className="verified-badge-icon">✓</span>
            </div>
            <p className="profile-role-subtext">{displayClass} • Student</p>
            <p className="profile-id-code">Adm: {studentProfile?.studentId || "ADM-14920"}</p>
          </div>
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

      {/* Main Content Area */}
      <div className="portal-main">
        <header className="topbar admin-header" style={{ padding: "0 28px" }}>
          <div className="header-breadcrumbs">
            <span>Student Portal</span> / <span>Academics</span> / <strong>Overview &amp; Dashboard</strong>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "5px 12px", borderRadius: "20px", fontWeight: "700", fontSize: "12px", border: "1px solid #bfdbfe" }}>
              {displayClass} (Malayalam Medium)
            </span>
            <span style={{ background: "#dcfce7", color: "#15803d", padding: "5px 12px", borderRadius: "20px", fontWeight: "700", fontSize: "11px", border: "1px solid #bbf7d0" }}>
              🟢 SCERT Core Active
            </span>
          </div>
        </header>

        <main className="dashboard-content" id="overview">
          {/* Welcome Card */}
          <section className="welcome-card">
            <div className="avatar main-avatar">{getInitials(displayName)}</div>

            <div className="welcome-info">
              <h1>Welcome back, {displayName}!</h1>
              <span className="active-badge">Active Scholar</span>

              <p>
                {displayClass} (Malayalam Medium)
                {studentProfile?.rollNumber && (
                  <>
                    <span>•</span>
                    Roll No: {studentProfile.rollNumber}
                  </>
                )}
                {studentProfile?.studentId && (
                  <>
                    <span>•</span>
                    Adm: {studentProfile.studentId}
                  </>
                )}
              </p>

              <p>
                Email: <strong>{user?.email || studentProfile?.email || "student@school.edu"}</strong>
              </p>
            </div>

            <div className="welcome-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  document
                    .getElementById("timetable")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                ▦ Exam Timetable
              </button>

              <button
                className="primary-button"
                onClick={() => {
                  document
                    .getElementById("results")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                ☆ View Marksheet
              </button>
            </div>
          </section>

          {/* Metric Summary Cards */}
          <section className="metrics-grid" aria-label="Student summary">
            {metrics.map((metric) => (
              <article
                className={`metric-card metric-${metric.type}`}
                key={metric.title}
                id={
                  metric.type === "attendance"
                    ? "attendance"
                    : metric.type === "score"
                    ? "results"
                    : undefined
                }
              >
                <p className="metric-title">{metric.title}</p>

                <div className="metric-value-row">
                  <h2>{metric.value}</h2>
                  {metric.extra && (
                    <span className={`metric-extra ${metric.type}`}>
                      {metric.extra}
                    </span>
                  )}
                </div>

                <p className="metric-description">{metric.description}</p>
              </article>
            ))}
          </section>

          {/* Schedule and Academic Notices */}
          <section className="lower-grid">
            <article className="schedule-panel" id="timetable">
              <div className="panel-heading">
                <div className="panel-title">
                  <span className="heading-marker blue-marker" />
                  <h2>Today's Class Schedule &amp; Quick Glance</h2>
                </div>
                <span className="schedule-period">
                  Monday&nbsp; • &nbsp;Period 1 to 7
                </span>
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
                  <strong className="verified-text"> Verified</strong>
                </span>
                <button
                  className="text-button"
                  onClick={() =>
                    alert("Full class schedule will be available here.")
                  }
                >
                  View full exam hall schedule →
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
                <span>Notice Ref #GHSS-25/89</span>
              </div>
            </aside>
          </section>

          {/* Footer */}
          <footer className="dashboard-footer">
            <span>
              © 2026 G.H.S.S Rajakkad - General Education Dept., Govt. of
              Kerala
            </span>

            <span>
              Affiliation: SCERT Kerala&nbsp; • &nbsp;School Code: 06042
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;