export default function StudentStatsCards({ stats }) {
  return (
    <div className="overview-stats-grid">
      {/* Card 1 */}
      <div className="overview-stat-card">
        <div className="stat-card-header">
          <span className="card-label">TOTAL ENROLLED</span>
          <div className="stat-icon-circle blue"></div>
        </div>
        <div className="overview-number">
          {stats.totalEnrolled.toLocaleString()}
        </div>
        <div className="sub-text">
          Boys: {stats.boysCount} | Girls: {stats.girlsCount}
        </div>
      </div>

      {/* Card 2 */}
      <div className="overview-stat-card">
        <div className="stat-card-header">
          <span className="card-label">CLASS 10 (SSLC CADRE)</span>
          <div className="stat-icon-circle green"></div>
        </div>
        <div className="overview-number stat-number-green">
          {stats.class10Candidates} Candidates
        </div>
        <div className="sub-text">5 Divisions (A to E)</div>
      </div>

      {/* Card 3 */}
      <div className="overview-stat-card">
        <div className="stat-card-header">
          <span className="card-label">PLUS ONE &amp; PLUS TWO</span>
          <div className="stat-icon-circle purple"></div>
        </div>
        <div className="overview-number">
          {stats.plusTwoCount} Students
        </div>
        <div className="sub-text">Science, Commerce, Humanities</div>
      </div>

      {/* Card 4 */}
      <div className="overview-stat-card">
        <div className="stat-card-header">
          <span className="card-label">SAMPOORNA ID LINKED</span>
          <div className="stat-icon-circle emerald"></div>
        </div>
        <div className="overview-number stat-number-emerald">
          {stats.sampoornaVerified} Verified
        </div>
        <div className="sub-text">Aadhaar &amp; UID seeded</div>
      </div>
    </div>
  );
}
