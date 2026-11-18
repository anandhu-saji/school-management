export default function SectionAttendanceBlock({
  sections,
  navigate,
  handleOpenMuster,
}) {
  return (
    <div className="section-attendance-wrapper">
      <div className="section-attendance-heading-bar">
        <div>
          <h2 className="section-att-main-heading">
            Academic Wing Section Attendance
          </h2>
          <p className="section-att-main-subtext">
            Consolidated roll-call sync from teacher terminals with Kerala
            Pareeksha Bhavan and DHSE portals.
          </p>
        </div>
        <button
          type="button"
          className="section-att-all-muster-btn"
          onClick={() => navigate("/admin/attendance")}
        >
          View Full Division Muster Register
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
                  {sec.absentNote}
                </div>
              </div>

              {/* 5. Teacher Verification Sync */}
              <div className="section-att-metric-pill">
                <span className="section-att-pill-label">
                  TEACHER VERIFICATION
                </span>
                <div className="section-att-pill-value val-status">
                  <span className="section-att-sync-dot"></span>
                  {sec.syncStatus}
                </div>
                <div className="section-att-pill-subtext sub-status">
                  {sec.syncStatusSub}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
