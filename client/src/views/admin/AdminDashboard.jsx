import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosclient";
import { clearAuthSession } from "../../utils/auth";
import "../../Styles/AdminDash.css";

export default function AdminOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPupils: 1248,
    totalStaff: 64,
    turnout: "96.4%",
  });

  useEffect(() => {
    api
      .get("/admin/overview-stats")
      .then((res) => {
        if (res.data.success) setStats(res.data.stats);
      })
      .catch((err) => {
        console.error("Failed to load admin stats:", err);
      });
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div>
          <div className="sidebar-header">
            <div className="school-code-label">School Code: 06042</div>
            <div className="sampoorna-live-pill">
              <span className="dot"></span> SAMPOORNA 2.0 LIVE
            </div>
          </div>

          <div className="sidebar-section-title">CONSOLE NAVIGATION</div>
          <nav className="console-nav-list">
            <button className="console-nav-item active">
              <span>▦</span> Overview and Dashboard
            </button>
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/attendance")}
            >
              <span>👥</span> Division wise Attendance
            </button>
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/teachers")}
            >
              <span>🗂</span> Teachers Records
            </button>
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/students")}
            >
              <span>🎓</span> Students Records
            </button>
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/exams")}
            >
              <span>📅</span> Exam Timetables
            </button>
          </nav>
        </div>

        {/* Bottom Profile Card */}
        <div className="sidebar-bottom-profile">
          <div className="profile-avatar-circle">
            <span>🛡</span>
          </div>
          <div className="profile-details-column">
            <div className="profile-name-row">
              <span>Sri. K. R. Madhavan</span>
              <span className="verified-badge-icon">✓</span>
            </div>
            <p className="profile-role-subtext">Headmaster / Chief Admin</p>
            <p className="profile-id-code">ADM-GHSS-01</p>
          </div>
          <button
            className="logout-icon-btn"
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign Out"
          >
            ⇥
          </button>
        </div>
      </aside>

      <div className="admin-main-wrapper">
        <header className="admin-top-header">
          <span>
            Kerala General Education Dept. •{" "}
            <strong>Sampoorna Admin Console</strong> • School Code: 06042
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="badge-sync">🟢 AY 2025–2026</span>
            <button
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#135bec",
                color: "#ffffff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              👤
            </button>
          </div>
        </header>

        <main className="admin-content-area">
          <section className="headmaster-hero-card">
            <div className="badge-row">
              <span className="badge-governance">HEADMASTER GOVERNANCE DECK</span>
              <span className="badge-sync">
                🟢 Sampoorna Core 2.0 Live Synchronized
              </span>
            </div>
            <h1>Good morning, Headmaster Madhavan</h1>
            <p>
              G.H.S.S Rajakkad • Institutional Governance, Staff Muster &amp;
              SCERT Repository Control Terminal.
            </p>
          </section>

          {/* 4 Cards Grid */}
          <div className="overview-stats-grid">
            <div className="overview-stat-card">
              <span className="card-label">PUPIL CENSUS</span>
              <div className="overview-number">
                {stats.totalPupils.toLocaleString()} Pupils
              </div>
              <div className="sub-text">48 in 10-A • 26 Academic Divisions</div>
            </div>
            <div className="overview-stat-card">
              <span className="card-label">TEACHERS</span>
              <div className="overview-number">
                {stats.totalStaff} Staff Members
              </div>
              <div className="sub-text text-green">58 Present Today • 6 On Leave</div>
            </div>
            <div className="overview-stat-card">
              <span className="card-label">TODAY'S STUDENT MUSTER</span>
              <div className="overview-number">{stats.turnout} Turnout</div>
              <div className="sub-text text-green">
                1,203 Present • <span className="text-red">45 Absent</span>
              </div>
            </div>
            <div className="overview-stat-card">
              <span className="card-label">SCERT COMPLIANCE</span>
              <div className="overview-number text-teal">100% Synced</div>
              <div className="sub-text">
                Biometric: <strong>Active</strong>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
