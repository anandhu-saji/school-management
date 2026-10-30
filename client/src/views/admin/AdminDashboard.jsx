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
          <div className="school-code-label">School Code: 06042</div>
          <div className="sampoorna-live-pill">
            <span className="dot"></span> SAMPOORNA 2.0 LIVE
          </div>
          <nav className="console-nav-list">
            <button className="console-nav-item active">
              Overview and Dashboard
            </button>
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/attendance")}
            >
              Division Attendance
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          style={{
            margin: "20px 16px",
            padding: "10px",
            background: "#ffebe6",
            color: "#de350b",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Sign Out
        </button>
      </aside>

      <div className="admin-main-wrapper">
        <header className="admin-top-header">
          <span>
            Kerala General Education Dept. • Sampoorna Admin Console • School Code:
            06042
          </span>
        </header>

        <main className="admin-content-area">
          <section className="headmaster-hero-card">
            <div className="badge-row">
              <span className="badge-governance">HEADMASTER GOVERNANCE DECK</span>
              <span className="badge-sync">
                🟢 Sampoorna Core 2.0 Live Synchronized
              </span>
            </div>
            <h1>Good morning, Headmaster</h1>
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