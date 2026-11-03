export default function TeacherStatsCards({ stats }) {
  return (
    <div className="overview-stats-grid">
      {/* Card 1 */}
      <div className="overview-stat-card">
        <div className="stat-card-header">
          <span className="card-label">TOTAL FACULTY</span>
          <div className="stat-icon-circle blue">👥</div>
        </div>
        <div className="overview-number">
          {stats.totalFaculty} Cadre
        </div>
        <div className="sub-text">LP/UP/HS/HSS approved</div>
      </div>

      {/* Card 2 */}
      <div className="overview-stat-card">
        <div className="stat-card-header">
          <span className="card-label">PERMANENT HSST/HST</span>
          <div className="stat-icon-circle emerald">🛡️</div>
        </div>
        <div className="overview-number stat-number-emerald">
          {stats.permanentPosts} Posts
        </div>
        <div className="sub-text">Assigned government PEN</div>
      </div>

      {/* Card 3 */}
      <div className="overview-stat-card">
        <div className="stat-card-header">
          <span className="card-label">ON DUTY / DEPUTATION</span>
          <div className="stat-icon-circle purple">💼</div>
        </div>
        <div className="overview-number">
          {stats.onDutyStaff} Staff
        </div>
        <div className="sub-text">SCERT &amp; Exam duties</div>
      </div>

      {/* Card 4 */}
      <div className="overview-stat-card">
        <div className="stat-card-header">
          <span className="card-label">VACANT SANCTIONED</span>
          <div className="stat-icon-circle blue">👤+</div>
        </div>
        <div className="overview-number stat-number-blue">
          {stats.vacantPosts} Posts
        </div>
        <div className="sub-text">UP / HST English requisitions</div>
      </div>
    </div>
  );
}
