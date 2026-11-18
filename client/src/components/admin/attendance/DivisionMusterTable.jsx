export default function DivisionMusterTable({
  divisions,
  filteredDivisions,
  search,
  setSearch,
  activeSection,
  setActiveSection,
  loading,
  onOpenRegister,
}) {
  return (
    <div className="muster-card">
      <div className="muster-header">
        <h2>Division Muster Verification Register</h2>
        <input
          type="text"
          placeholder="Search Division, Mentor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-box"
        />
      </div>

      {/* Academic Wing Section Filter Pills */}
      <div className="section-filter-pills-row">
        <button
          type="button"
          className={`section-tab-pill ${activeSection === "all" ? "active" : ""}`}
          onClick={() => setActiveSection("all")}
        >
          All Wings ({divisions.length || 26} Divisions)
        </button>
        <button
          type="button"
          className={`section-tab-pill ${
            activeSection === "high_school" ? "active" : ""
          }`}
          onClick={() => setActiveSection("high_school")}
        >
          High School (Classes 8–10)
        </button>
        <button
          type="button"
          className={`section-tab-pill ${
            activeSection === "up_school" ? "active" : ""
          }`}
          onClick={() => setActiveSection("up_school")}
        >
          UP School (Classes 5–7)
        </button>
        <button
          type="button"
          className={`section-tab-pill ${
            activeSection === "lp_school" ? "active" : ""
          }`}
          onClick={() => setActiveSection("lp_school")}
        >
          LP School (Classes 1–4)
        </button>
        <button
          type="button"
          className={`section-tab-pill ${
            activeSection === "higher_secondary" ? "active" : ""
          }`}
          onClick={() => setActiveSection("higher_secondary")}
        >
          Higher Secondary (Classes 11–12)
        </button>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: "#64748b",
            fontWeight: "600",
          }}
        >
          Loading Division Muster records...
        </div>
      ) : (
        <table className="muster-table">
          <thead>
            <tr>
              <th>Standard &amp; Division</th>
              <th>Class Mentor</th>
              <th>Enrolled</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Turnout Rate</th>
              <th>Sampoorna Sync</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDivisions.map((div) => (
              <tr key={div.id}>
                <td>
                  <strong>{div.standardDivision}</strong> <br />
                  <small>{div.stream}</small>
                </td>
                <td>{div.mentor}</td>
                <td>{div.enrolled}</td>
                <td className="text-green">{div.present}</td>
                <td className="text-red">{div.absent}</td>
                <td>
                  <span className="pill-turnout">{div.turnoutRate}</span>
                </td>
                <td>
                  <span className="pill-synced">✓ Verified &amp; Locked</span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-register"
                    onClick={() => onOpenRegister(div)}
                    title={`Open ${div.standardDivision} Class Attendance Register`}
                  >
                    Register
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
