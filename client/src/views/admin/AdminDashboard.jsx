import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isSessionValid, clearAuthSession } from "../../utils/auth";
import "./../../Styles/AdminDash.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    // 1. Session check
    if (!isSessionValid()) {
      clearAuthSession();
      navigate("/login?session=expired", { replace: true });
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.role !== "admin") {
          navigate("/dashboard", { replace: true });
          return;
        }
        setAdminUser(parsed);
      } catch (err) {
        console.error("Error reading admin user data:", err);
      }
    }

    // 2. Prevent browser back to login
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);

    // 3. Auto logout on session expiry
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

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <p className="school-code-label">School Code: 06042</p>
          <div className="sampoorna-pill-badge">
            <span className="status-indicator-dot" />
            SAMPOORNA 2.0 LIVE
          </div>
        </div>

        <p className="sidebar-section-title">Console Navigation</p>
        <nav className="sidebar-menu">
          <a className="sidebar-menu-item active" href="#overview">
            <span>▦</span> Overview and Dashboard
          </a>
          <a className="sidebar-menu-item" href="#division-attendance">
            <span>👥</span> Division wise Attendance
          </a>
          <a className="sidebar-menu-item" href="#teachers-records">
            <span>🗂</span> Teachers Records
          </a>
          <a className="sidebar-menu-item" href="#students-records">
            <span>🎓</span> Students Records
          </a>
          <a className="sidebar-menu-item" href="#exam-timetables">
            <span>📅</span> Exam Timetables
          </a>
        </nav>

        {/* Bottom Profile card */}
        <div className="sidebar-bottom-profile">
          <div className="profile-avatar-circle">
            <span>🛡</span>
          </div>
          <div className="profile-details-column">
            <div className="profile-name-row">
              <span>{adminUser?.username || "Sri. K. R. Madhavan"}</span>
              <span className="verified-badge-icon">✓</span>
            </div>
            <p className="profile-role-subtext">Headmaster / Chief Admin</p>
            <p className="profile-id-code">ADM-GHSS-01</p>
          </div>
          <button
            className="logout-icon-btn"
            type="button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
          >
            ⇥
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="admin-main-container">
        {/* Topbar Header */}
        <header className="admin-header-bar">
          <div className="header-left-breadcrumbs">
            <span className="header-breadcrumb-highlight">Kerala General Education Dept.</span>
            <span>•</span>
            <span className="header-tag-pill">Sampoorna Admin Console</span>
            <span>•</span>
            <span className="header-tag-pill">School Code: 06042</span>
          </div>

          <div className="header-right-controls">
            <div className="academic-year-badge">
              <span className="academic-year-dot" />
              AY 2025–2026
            </div>
            <button className="header-user-btn" aria-label="User profile">
              👤
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="admin-dashboard-content">
          {/* Hero Banner */}
          <section className="governance-hero-banner">
            <div className="hero-tag-pills-row">
              <span className="hero-pill-blue">HEADMASTER GOVERNANCE DECK</span>
              <span className="hero-pill-green">
                <span className="status-indicator-dot" />
                Sampoorna Core 2.0 Live Synchronized
              </span>
              <span className="hero-district-sublabel">
                District: Idukki (Sub-Dist: Adimaly)
              </span>
            </div>

            <h1>Good morning, Headmaster Madhavan</h1>
            <p>
              G.H.S.S Rajakkad • Institutional Governance, Staff Muster &amp; SCERT
              Repository Control Terminal. All 26 academic divisions synchronized with
              Kerala Education Portal as of 08:45 AM today.
            </p>
          </section>

          {/* 4 Cards Grid */}
          <section className="primary-metrics-grid">
            {/* Card 1 */}
            <article className="admin-metric-card">
              <div className="card-top-row">
                <span className="card-section-label">PUPIL CENSUS</span>
                <span className="card-icon-badge badge-blue">👥</span>
              </div>
              <h2 className="card-main-stat-heading">1,248 Pupils</h2>
              <div className="card-inline-meta">
                <span className="meta-highlight-blue">48 in 10-A</span>
                <span>•</span>
                <span>26 Academic Divisions</span>
              </div>
              <div className="card-sub-box-strip">
                <span>High School: <strong>780</strong></span>
                <span className="strip-divider-line">|</span>
                <span>HSS Stream: <strong>468</strong></span>
              </div>
            </article>

            {/* Card 2 */}
            <article className="admin-metric-card">
              <div className="card-top-row">
                <span className="card-section-label">TEACHERS</span>
                <span className="card-icon-badge badge-teal">📋</span>
              </div>
              <h2 className="card-main-stat-heading">64 Staff Members</h2>
              <div className="card-inline-meta">
                <span className="meta-highlight-green">58 Present Today</span>
                <span>•</span>
                <span>6 On Deputation/Leave</span>
              </div>
              <div className="card-sub-box-strip">
                <span>42 HST / HSST</span>
                <span className="strip-divider-line">|</span>
                <span>22 Primary &amp; Admin</span>
              </div>
            </article>

            {/* Card 3 */}
            <article className="admin-metric-card">
              <div className="card-top-row">
                <span className="card-section-label">TODAY'S STUDENT MUSTER</span>
                <span className="card-icon-badge badge-indigo">📝</span>
              </div>
              <h2 className="card-main-stat-heading">96.4% Turnout</h2>
              <div className="card-inline-meta">
                <span className="meta-highlight-green">1,203 Present</span>
                <span>•</span>
                <span className="meta-highlight-red">45 Absent</span>
              </div>
              <div className="card-sub-box-strip">
                <span>Auto-SMS Sent: 45 Guard.</span>
                <span className="strip-divider-line">|</span>
                <span className="meta-highlight-green">98.2% HS Avg</span>
              </div>
            </article>

            {/* Card 4 */}
            <article className="admin-metric-card">
              <div className="card-top-row">
                <span className="card-section-label">SCERT COMPLIANCE</span>
                <span className="card-icon-badge badge-green">✓</span>
              </div>
              <h2 className="card-main-stat-heading" style={{ color: "#059669" }}>
                100% Synced
              </h2>
              <div className="card-inline-meta">
                <span className="meta-highlight-green">26 Divisions</span>
                <span>•</span>
                <span>Pareeksha Bhavan</span>
              </div>
              <div className="card-sub-box-strip">
                <span>Biometric: <strong>Active</strong></span>
                <span className="strip-divider-line">|</span>
                <span className="approved-text-badge">DDO Approved</span>
              </div>
            </article>
          </section>

          {/* High School Section Attendance */}
          <section className="secondary-section-card">
            <h3 className="section-title-with-icon">
              <span className="section-icon-symbol">👥</span>
              High School Section Attendance
            </h3>
            <p className="section-subtitle-description">
              Classes 8–10 consolidated roll-call sync from teacher terminals with Kerala
              Pareeksha Bhavan portal.
            </p>

            <div className="attendance-submetrics-grid">
              <div className="submetric-stat-box">
                <p className="submetric-header-title">OVERALL TURNOUT</p>
                <p className="submetric-number-display color-teal">96.4%</p>
                <span className="submetric-caption-text">+1.2% vs yesterday</span>
              </div>

              <div className="submetric-stat-box">
                <p className="submetric-header-title">TOTAL ENROLLED</p>
                <p className="submetric-number-display color-slate">364</p>
                <span className="submetric-caption-text">Classes 8–10 (6 Divisions)</span>
              </div>

              <div className="submetric-stat-box">
                <p className="submetric-header-title">TOTAL PRESENT</p>
                <p className="submetric-number-display color-blue">351</p>
                <span className="submetric-caption-text">Marked in class</span>
              </div>

              <div className="submetric-stat-box">
                <p className="submetric-header-title">TOTAL ABSENT</p>
                <p className="submetric-number-display color-red">13</p>
                <span className="submetric-caption-text">Auto-SMS dispatched</span>
              </div>

              <div className="submetric-stat-box">
                <p className="submetric-header-title">DIVISIONS LOCKED</p>
                <p className="submetric-number-display color-green">6 / 6</p>
                <span className="submetric-caption-text">100% High School Synced</span>
              </div>
            </div>
          </section>
        </main>

        {/* Global Footer */}
        <footer className="admin-platform-footer">
          <div className="footer-school-identity">
            <strong>Government Higher Secondary School Rajakkad • School Code: 06042</strong>
            <p style={{ marginTop: "2px", color: "#94a3b8" }}>
              Affiliated to General Education Department &amp; SCERT Kerala • State Academic Governance Cluster
            </p>
          </div>
          <div className="footer-system-status">
            <span>Sampoorna Academic Management Platform v2.0</span>
            <span>•</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#059669", fontWeight: 700 }}>
              <span className="footer-status-dot" />
              Operational
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AdminDashboard;