export default function StudentSidebar({
  activeTab,
  setActiveTab,
  displayName,
  displayClass,
  studentProfile,
  onOpenDossier,
  handleLogout,
}) {
  return (
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
          onClick={onOpenDossier}
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
  );
}
