import { ACADEMIC_WINGS } from "../../utils/classData";

export default function TeacherHeader({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  selectedDivision,
  onDivisionChange,
  selectedDate,
  onDateChange,
}) {
  const getTabTitle = () => {
    switch (activeTab) {
      case "academics":
        return "Class Student Directory & Statutory KYC Registry";
      case "marks":
        return "Continuous Evaluation (CE) & Terminal Marks Portal";
      case "timetable":
        return "Weekly Teaching Schedule & Exam Duties";
      case "profile":
        return "SPARK Government Cadre & Service Profile";
      case "attendance":
      default:
        return "Daily Attendance Register";
    }
  };

  return (
    <header className="teacher-header">
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
        <div className="header-breadcrumbs">
          <span>Teacher Console</span> / <span>Academics</span> /{" "}
          <strong>
            {selectedDivision} {getTabTitle()}
          </strong>
        </div>
      </div>

      <div className="header-controls" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Division:</label>
          <select
            className="teacher-class-select"
            value={selectedDivision}
            onChange={(e) => onDivisionChange(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              fontWeight: "600",
              color: "#0f172a",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            {ACADEMIC_WINGS.map((wing) => (
              <optgroup key={wing.code} label={wing.wing}>
                {wing.classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.stream})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {activeTab === "attendance" && (
          <input
            type="date"
            className="date-input"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              fontWeight: "600",
              color: "#0f172a",
              background: "#ffffff",
            }}
          />
        )}

        <button
          type="button"
          onClick={() => window.print()}
          className="btn-print-screen"
          style={{
            padding: "7px 14px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#334155",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          title="Print official report"
        >
          🖨️ <span>Print View</span>
        </button>
      </div>
    </header>
  );
}
