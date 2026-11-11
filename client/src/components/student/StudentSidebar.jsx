import { useState } from "react";

export default function StudentSidebar({
  activeTab,
  setActiveTab,
  displayName,
  displayClass,
  studentProfile,
  onOpenDossier,
  handleLogout,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header Bar for Student Portal */}
      <div className="student-mobile-bar">
        <button
          className="student-hamburger-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
        <div className="student-mobile-title">
          <strong>STUDENT PORTAL</strong>
          <span>{displayClass} • Code: 06042</span>
        </div>
        <button
          className="student-mobile-logout-btn"
          onClick={handleLogout}
          title="Sign Out"
          aria-label="Sign Out"
        >
          ⇥
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {mobileOpen && (
        <div
          className="student-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`admin-sidebar sidebar ${mobileOpen ? "open" : ""}`}>
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
              onClick={() => {
                setActiveTab("overview");
                setMobileOpen(false);
              }}
            >
              <span>▦</span> Overview &amp; Dashboard
            </button>
            <button
              className={`console-nav-item ${activeTab === "attendance" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("attendance");
                setMobileOpen(false);
              }}
            >
              <span>◷</span> Monthly Attendance &amp; Muster
            </button>
            <button
              className={`console-nav-item ${activeTab === "timetable" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("timetable");
                setMobileOpen(false);
              }}
            >
              <span>▤</span> Exam Timetable &amp; Hall Pass
            </button>
            <button
              className={`console-nav-item ${activeTab === "fees" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("fees");
                setMobileOpen(false);
              }}
            >
              <span>•</span> Fee Ledger &amp; Receipts
            </button>
            
          </nav>
        </div>

        {/* Bottom Profile Card - Interactive Click to View ID & Dossier */}
        <div className="sidebar-bottom-profile">
          <button
            className="sidebar-bottom-profile-btn"
            onClick={() => {
              onOpenDossier();
              setMobileOpen(false);
            }}
            title="Click to view My ID &amp; Documents Dossier"
          >
            <div className="profile-avatar-circle" style={{ background: "#7c3aed" }}>
              <span>ID</span>
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
            ⇥
          </button>
        </div>
      </aside>
    </>
  );
}
