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
    totalPresent: 1203,
    totalAbsent: 45,
  });

  // 4 Academic Wing Attendance Blocks Requested by User
  const [sections, setSections] = useState([
    {
      id: "high_school",
      title: "High School Section Attendance",
      classes: "Classes 8–10",
      divisionsText: "Classes 8–10 (6 Divisions)",
      description:
        "Classes 8–10 consolidated roll-call sync from teacher terminals with Kerala Pareeksha Bhavan portal.",
      turnout: "96.4%",
      turnoutDiff: "+1.2% vs yesterday",
      totalEnrolled: 364,
      totalPresent: 351,
      totalAbsent: 13,
      divisionsLocked: "6 / 6",
      syncStatus: "100% High School Synced",
      presentStatus: "Marked in class",
      absentStatus: "Auto-SMS dispatched",
    },
    {
      id: "up_school",
      title: "UP School Attendance",
      classes: "Classes 5–7",
      divisionsText: "Classes 5–7 (6 Divisions)",
      description:
        "Classes 5–7 consolidated roll-call sync from teacher terminals with Kerala Pareeksha Bhavan portal.",
      turnout: "96.7%",
      turnoutDiff: "+0.8% vs yesterday",
      totalEnrolled: 276,
      totalPresent: 267,
      totalAbsent: 9,
      divisionsLocked: "6 / 6",
      syncStatus: "100% UP School Synced",
      presentStatus: "Marked in class",
      absentStatus: "Auto-SMS dispatched",
    },
    {
      id: "lp_school",
      title: "LP School Attendance",
      classes: "Classes 1–4",
      divisionsText: "Classes 1–4 (8 Divisions)",
      description:
        "Classes 1–4 consolidated roll-call sync from teacher terminals with General Education Department portal.",
      turnout: "96.5%",
      turnoutDiff: "+1.5% vs yesterday",
      totalEnrolled: 312,
      totalPresent: 301,
      totalAbsent: 11,
      divisionsLocked: "8 / 8",
      syncStatus: "100% LP School Synced",
      presentStatus: "Marked in class",
      absentStatus: "Auto-SMS dispatched",
    },
    {
      id: "higher_secondary",
      title: "Higher Secondary Attendance",
      classes: "Classes 11–12",
      divisionsText: "Classes 11–12 (6 Divisions)",
      description:
        "Classes 11–12 (Plus One & Plus Two) consolidated roll-call sync with Kerala DHSE portal.",
      turnout: "95.9%",
      turnoutDiff: "+0.5% vs yesterday",
      totalEnrolled: 296,
      totalPresent: 284,
      totalAbsent: 12,
      divisionsLocked: "6 / 6",
      syncStatus: "100% Higher Secondary Synced",
      presentStatus: "Marked in class",
      absentStatus: "Auto-SMS dispatched",
    },
  ]);

  useEffect(() => {
    api
      .get("/admin/overview-stats")
      .then((res) => {
        if (res.data.success) {
          if (res.data.stats) setStats(res.data.stats);
          if (res.data.sections && res.data.sections.length > 0) {
            setSections(res.data.sections);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load admin stats:", err);
      });
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const handleOpenMuster = (sectionId) => {
    navigate("/admin/attendance", { state: { section: sectionId } });
  };

  return (
    <div className="admin-layout">
      {/* ---------------- SIDEBAR NAVIGATION ---------------- */}
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

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
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

          {/* 4 Cards Grid - Top Summary KPI Cards */}
          <div className="overview-stats-grid">
            <div className="overview-stat-card">
              <span className="card-label">PUPIL CENSUS</span>
              <div className="overview-number">
                {(stats.totalPupils || 1248).toLocaleString()} Pupils
              </div>
              <div className="sub-text">48 in 10-A • 26 Academic Divisions</div>
            </div>
            <div className="overview-stat-card">
              <span className="card-label">TEACHERS</span>
              <div className="overview-number">
                {stats.totalStaff || 64} Staff Members
              </div>
              <div className="sub-text text-green">
                58 Present Today • 6 On Leave
              </div>
            </div>
            <div className="overview-stat-card">
              <span className="card-label">TODAY'S STUDENT MUSTER</span>
              <div className="overview-number">{stats.turnout || "96.4%"} Turnout</div>
              <div className="sub-text text-green">
                {(stats.totalPresent || 1203).toLocaleString()} Present •{" "}
                <span className="text-red">{(stats.totalAbsent || 45)} Absent</span>
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

          {/* ---------------- 4 SECTION ATTENDANCE BLOCKS ---------------- */}
          <div className="section-attendance-wrapper">
            <div className="section-attendance-heading-bar">
              <div>
                <h2 className="section-att-main-heading">
                  Academic Wing Section Attendance
                </h2>
                <p className="section-att-main-subtext">
                  Consolidated roll-call sync from teacher terminals with Kerala Pareeksha Bhavan and DHSE portals.
                </p>
              </div>
              <button
                type="button"
                className="section-att-all-muster-btn"
                onClick={() => navigate("/admin/attendance")}
              >
                View Full Division Muster Register 📋
              </button>
            </div>

            <div className="section-attendance-stack">
              {sections.map((sec) => (
                <div key={sec.id} className="section-attendance-card">
                  {/* Card Header Row */}
                  <div className="section-att-header">
                    <div className="section-att-title-group">
                      <div className="section-att-title-row">
                        <span className="section-att-icon-badge">
                          <svg
                            width="21"
                            height="21"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1d4ed8"
                            strokeWidth="2.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <polyline points="16 11 18 13 22 9" />
                          </svg>
                        </span>
                        <h3 className="section-att-heading">{sec.title}</h3>
                      </div>
                      <p className="section-att-subtitle">{sec.description}</p>
                    </div>

                    <button
                      type="button"
                      className="section-att-btn-muster"
                      onClick={() => handleOpenMuster(sec.id)}
                      title={`Open Full Muster Register for ${sec.title}`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      Full Muster Register
                    </button>
                  </div>

                  {/* 5 Metric Boxes Grid */}
                  <div className="section-att-metrics-grid">
                    {/* 1. Overall Turnout */}
                    <div className="section-att-metric-pill">
                      <span className="section-att-pill-label">OVERALL TURNOUT</span>
                      <div className="section-att-pill-value val-turnout">
                        {sec.turnout}
                      </div>
                      <div className="section-att-pill-subtext sub-turnout">
                        {sec.turnoutDiff}
                      </div>
                    </div>

                    {/* 2. Total Enrolled */}
                    <div className="section-att-metric-pill">
                      <span className="section-att-pill-label">TOTAL ENROLLED</span>
                      <div className="section-att-pill-value val-enrolled">
                        {sec.totalEnrolled}
                      </div>
                      <div className="section-att-pill-subtext sub-enrolled">
                        {sec.divisionsText}
                      </div>
                    </div>

                    {/* 3. Total Present */}
                    <div className="section-att-metric-pill">
                      <span className="section-att-pill-label">TOTAL PRESENT</span>
                      <div className="section-att-pill-value val-present">
                        {sec.totalPresent}
                      </div>
                      <div className="section-att-pill-subtext sub-present">
                        {sec.presentStatus}
                      </div>
                    </div>

                    {/* 4. Total Absent */}
                    <div className="section-att-metric-pill">
                      <span className="section-att-pill-label">TOTAL ABSENT</span>
                      <div className="section-att-pill-value val-absent">
                        {sec.totalAbsent}
                      </div>
                      <div className="section-att-pill-subtext sub-absent">
                        {sec.absentStatus}
                      </div>
                    </div>

                    {/* 5. Divisions Locked */}
                    <div className="section-att-metric-pill">
                      <span className="section-att-pill-label">DIVISIONS LOCKED</span>
                      <div className="section-att-pill-value val-locked">
                        {sec.divisionsLocked}
                      </div>
                      <div className="section-att-pill-subtext sub-locked">
                        {sec.syncStatus}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
