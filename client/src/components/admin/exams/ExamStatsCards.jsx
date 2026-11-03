export default function ExamStatsCards({ stats }) {
  return (
    <div className="overview-stats-grid">
      {/* Card 1 */}
      <div className="overview-stat-card">
        <div className="stat-card-header">
          <span className="card-label">TOTAL SCHEDULES</span>
          <div className="stat-icon-circle blue">📅</div>
        </div>
        <div className="overview-number">
          {stats.totalSchedules} Sessions
        </div>
        <div className="sub-text">SSLC &amp; Higher Secondary</div>
      </div>

      {/* Card 2 */}
      <div className="overview-stat-card">
        <div className="stat-card-header">
          <span className="card-label">PUBLISHED PAPERS</span>
          <div className="stat-icon-circle emerald">✓</div>
        </div>
        <div className="overview-number stat-number-emerald">
          {stats.upcomingCount} Approved
        </div>
        <div className="sub-text">First Paper: 12 March 2026</div>
      </div>

      {/* Card 3 */}
      <div className="overview-stat-card">
        <div className="stat-card-header">
          <span className="card-label">EXAMINATION HALLS</span>
          <div className="stat-icon-circle purple">🏛️</div>
        </div>
        <div className="overview-number">
          {stats.hallsAllocated} Halls
        </div>
        <div className="sub-text">Auditorium &amp; Main Block</div>
      </div>

      {/* Card 4 */}
      <div className="overview-stat-card">
        <div className="stat-card-header">
          <span className="card-label">INVIGILATION CADRE</span>
          <div className="stat-icon-circle blue">👥</div>
        </div>
        <div className="overview-number stat-number-blue">
          {stats.invigilatorCadre} Staff
        </div>
        <div className="sub-text">Assigned Chief &amp; Observers</div>
      </div>
    </div>
  );
}
