export default function StudentHeader({
  activeTab,
  displayClass,
  displayName,
  onOpenDossier,
  getInitials,
}) {
  return (
    <header className="topbar admin-header">
      <div className="header-breadcrumbs">
        <span>Student Portal</span> / <span>Academics</span> /{" "}
        <strong>
          {activeTab === "overview" && "Overview & Dashboard"}
          {activeTab === "attendance" && "Monthly Attendance & Muster"}
          {activeTab === "timetable" && "Exam Timetable & Seating Pass"}
          {activeTab === "fees" && "Fee Ledger & Official Receipts"}
        </strong>
      </div>

      <div className="student-header-right" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span
          className="header-class-pill"
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
          {displayClass}
        </span>
        <span
          className="header-scert-pill"
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
          🟢 SCERT Active
        </span>

        {/* Profile Avatar Trigger in Header */}
        <button
          className="topbar-profile-btn"
          onClick={onOpenDossier}
          title="Click to view My Identity &amp; Documents"
        >
          <div className="topbar-avatar-circle">
            {getInitials(displayName)}
          </div>
          <div className="topbar-profile-info">
            <span className="topbar-profile-name">{displayName.split(" ")[0]}</span>
            <span className="topbar-profile-badge">🪪 My ID</span>
          </div>
        </button>
      </div>
    </header>
  );
}
