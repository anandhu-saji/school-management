import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isSessionValid, clearAuthSession } from "../../utils/auth";
import "./../../Styles/StudentDash.css";

const metrics = [
  {
    title: "ATTENDANCE RATE",
    value: "96.2%",
    extra: "+1.4%",
    description: "21 Present out of 22 Working Days",
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
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Verify 1-hour session validity on mount
    if (!isSessionValid()) {
      clearAuthSession();
      navigate("/login?session=expired", { replace: true });
      return;
    }

    // 2. Read stored user profile
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error reading user data:", err);
      }
    }

    // 3. Block browser back button from returning to login
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);

    // 4. Auto-logout timer if 1 hour passes while tab remains open
    const interval = setInterval(() => {
      if (!isSessionValid()) {
        clearAuthSession();
        navigate("/login?session=expired", { replace: true });
      }
    }, 10000);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      clearInterval(interval);
    };
  }, [navigate]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const getDisplayName = (username) => {
    if (!username) return "Student";
    return username
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

  const displayName = getDisplayName(user?.username);

  return (
    <div className="portal">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="school-brand">
          <h2>G.H.S.S Rajakkad</h2>
          <p>School Code: 06042</p>

          <div className="sampoorna-badge">
            <span className="live-dot" />
            SAMPOORNA 2.0 LIVE
          </div>

          <span className="govt-label">Govt. of Kerala</span>
        </div>

        <nav className="sidebar-nav">
          <a className="nav-item active" href="#overview">
            <span>▦</span> Overview &amp; Dashboard
          </a>
          <a className="nav-item" href="#attendance">
            <span>◷</span> Monthly Attendance
          </a>
          <a className="nav-item" href="#timetable">
            <span>▤</span> Exam Timetable
          </a>
          <a className="nav-item" href="#results">
            <span>☆</span> Result
          </a>
        </nav>

        <div className="sidebar-profile">
          <div className="avatar small-avatar">{getInitials(user?.username)}</div>
          <div className="profile-info">
            <strong>{displayName}</strong>
            <span>{user?.email || "student@school.edu"}</span>
            <span className="profile-role">
              {user?.role ? user.role.toUpperCase() : "STUDENT"} · Class 10-A
            </span>
          </div>
          <button
            className="logout-button"
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
          >
            ⇥
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="portal-main">
        <header className="topbar">
          <div className="topbar-class">
            <strong>Class 10-A</strong>
            <span>•</span>
            <span>SSLC Board Batch 2025-26</span>
            <span className="topbar-divider">|</span>
            <span className="department-badge">
              Kerala General Education Dept.
            </span>
            <span className="portal-name">Sampoorna Student Portal</span>
          </div>

          <div className="topbar-right">
            <span>Malayalam Medium</span>
            <span className="division-badge">Div A</span>
          </div>
        </header>

        <main className="dashboard-content" id="overview">
          {/* Welcome Card */}
          <section className="welcome-card">
            <div className="avatar main-avatar">{getInitials(user?.username)}</div>

            <div className="welcome-info">
              <h1>Welcome back, {displayName}!</h1>
              <span className="active-badge">Active Scholar</span>

              <p>
                Class 10-A (Malayalam Medium)
                <span>•</span>
                Class Mentor: Mrs. Priya Nair
              </p>

              <p>
                Email: <strong>{user?.email || "student@school.edu"}</strong>
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