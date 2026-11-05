import { useState, useMemo } from "react";

export default function TeacherAcademicsTab({
  selectedDivision,
  students,
  onViewDossier,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalBoys = students.filter((s) => s.gender === "Male").length;
  const totalGirls = students.filter((s) => s.gender === "Female").length;

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Gender filter
      if (genderFilter !== "All" && s.gender !== genderFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = s.name?.toLowerCase().includes(q);
        const matchesRoll = String(s.rollNumber).includes(q);
        const matchesAdm = s.admissionNumber?.toLowerCase().includes(q);
        const matchesSmp = s.sampoornaId?.toLowerCase().includes(q);
        const matchesGuardian = s.guardian?.toLowerCase().includes(q);
        return matchesName || matchesRoll || matchesAdm || matchesSmp || matchesGuardian;
      }
      return true;
    });
  }, [students, genderFilter, searchQuery]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const displayDivision = useMemo(() => {
    return (
      (selectedDivision || "Class 10-A")
        .replace(/\s*(Mentor|Class Teacher|In-charge|Teacher)\s*$/i, "")
        .replace(/\s*\(.*?\)\s*$/, "")
        .trim() || "Class 10-A"
    );
  }, [selectedDivision]);

  return (
    <div>
      {/* Overview Metric Cards */}
      <div className="overview-stats-grid" style={{ marginBottom: "20px" }}>
        <div className="overview-stat-card">
          <span className="card-label">CLASS STRENGTH</span>
          <div className="overview-number">{students.length} Students</div>
          <div className="sub-text">{displayDivision} Active Roll</div>
        </div>
        <div className="overview-stat-card">
          <span className="card-label">BOYS CANDIDATES</span>
          <div className="overview-number text-blue">{totalBoys} Boys</div>
          <div className="sub-text">General &amp; Reserved Cadre</div>
        </div>
        <div className="overview-stat-card">
          <span className="card-label">GIRLS CANDIDATES</span>
          <div className="overview-number text-purple">{totalGirls} Girls</div>
          <div className="sub-text">Inclusive School Enrolment</div>
        </div>
        <div className="overview-stat-card">
          <span className="card-label">SAMPOORNA STATUS</span>
          <div className="overview-number text-green">100% Verified</div>
          <div className="sub-text">SCERT Kerala UID Linked</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        className="table-controls-card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search by student name, roll #, admission #, or parent..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: "100%",
              padding: "9px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
            }}
          />
        </div>

        <div className="filter-group">
          <button
            className={`filter-btn ${genderFilter === "All" ? "active" : ""}`}
            onClick={() => {
              setGenderFilter("All");
              setCurrentPage(1);
            }}
          >
            All Pupils ({students.length})
          </button>
          <button
            className={`filter-btn ${genderFilter === "Male" ? "active" : ""}`}
            onClick={() => {
              setGenderFilter("Male");
              setCurrentPage(1);
            }}
          >
            Boys ({totalBoys})
          </button>
          <button
            className={`filter-btn ${genderFilter === "Female" ? "active" : ""}`}
            onClick={() => {
              setGenderFilter("Female");
              setCurrentPage(1);
            }}
          >
            Girls ({totalGirls})
          </button>
        </div>
      </div>

      {/* Student Academic Directory Table */}
      <div className="roster-card">
        <table className="roster-table">
          <thead>
            <tr>
              <th style={{ width: "60px" }}>Roll #</th>
              <th>Student &amp; Sampoorna ID</th>
              <th>Adm. No</th>
              <th>Blood Grp</th>
              <th>Parent / Guardian</th>
              <th>Contact Phone</th>
              <th>Turnout %</th>
              <th style={{ textAlign: "center" }}>KYC &amp; Dossier</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "28px", color: "#64748b" }}>
                  No students match your query in {displayDivision}.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((std) => (
                <tr key={std._id}>
                  <td>
                    <span
                      style={{
                        fontWeight: "700",
                        display: "inline-block",
                        width: "28px",
                        height: "28px",
                        lineHeight: "28px",
                        textAlign: "center",
                        background: "#f1f5f9",
                        borderRadius: "50%",
                        fontSize: "12px",
                      }}
                    >
                      {std.rollNumber}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          background: std.gender === "Female" ? "#ec4899" : "#2563eb",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "14px",
                          flexShrink: 0,
                        }}
                      >
                        {std.name?.charAt(0) || "S"}
                      </div>
                      <div>
                        <div style={{ fontWeight: "700", color: "#0f172a" }}>{std.name}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          {std.sampoornaId || `SMP-06042-${std.rollNumber}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: "12.5px", fontFamily: "monospace", color: "#475569" }}>
                    {std.admissionNumber}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        fontSize: "11px",
                        fontWeight: "700",
                      }}
                    >
                      {std.bloodGroup || "O+"}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>
                      {std.guardian || std.fatherName || "Parent"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      {std.guardianRelation || "Father"}
                    </div>
                  </td>
                  <td>
                    {std.parentContact ? (
                      <a
                        href={`tel:${std.parentContact}`}
                        style={{
                          color: "#2563eb",
                          textDecoration: "none",
                          fontSize: "12px",
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span>📞</span> {std.parentContact}
                      </a>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>N/A</span>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: "700",
                        fontSize: "12.5px",
                        color:
                          parseFloat(std.overallAttendance) >= 85
                            ? "#16a34a"
                            : parseFloat(std.overallAttendance) >= 75
                            ? "#d97706"
                            : "#dc2626",
                      }}
                    >
                      {std.overallAttendance || "98.4%"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={() => onViewDossier(std)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "7px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#0f172a",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#eff6ff";
                        e.currentTarget.style.borderColor = "#93c5fd";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.borderColor = "#cbd5e1";
                      }}
                    >
                      <span>🛡️</span> View Dossier
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="pagination-bar">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
