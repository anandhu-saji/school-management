export default function StudentOverviewTab({
  displayName,
  displayClass,
  studentProfile,
  user,
  mentorProfile,
  attendanceStats,
  totalFeeDue,
  feesData,
  nextExam,
  lessons,
  notices,
  onOpenDossier,
  onOpenHallTicket,
  setActiveTab,
  getInitials,
}) {
  return (
    <>
      {/* Welcome Card */}
      <section className="welcome-card">
        {/* Clickable Profile Avatar */}
        <div
          className="avatar main-avatar avatar-clickable"
          onClick={onOpenDossier}
          title="Click to view My ID &amp; Documents Dossier"
        >
          {getInitials(displayName)}
          <span className="avatar-id-badge" title="View Identity Dossier">🪪</span>
        </div>

        <div className="welcome-info">
          <h1>Welcome back, {displayName}!</h1>
          <span className="active-badge">Active Scholar • Form 6A Verified</span>

          <p>
            {displayClass} (Malayalam Medium)
            {studentProfile?.rollNumber && (
              <>
                <span>•</span>
                Roll No: {studentProfile.rollNumber}
              </>
            )}
            {studentProfile?.admissionNumber && (
              <>
                <span>•</span>
                Adm: {studentProfile.admissionNumber}
              </>
            )}
            {studentProfile?.sampoornaId && (
              <>
                <span>•</span>
                Sampoorna: {studentProfile.sampoornaId}
              </>
            )}
          </p>

          <p>
            Email:{" "}
            <strong>
              {studentProfile?.email || user?.email || "scholar@ghssrajakkad.org"}
            </strong>
            &nbsp;• Blood Group:{" "}
            <strong style={{ color: "#b91c1c" }}>
              {studentProfile?.bloodGroup || "O+"}
            </strong>
          </p>
        </div>

        <div className="welcome-actions">
          <button
            className="secondary-button"
            onClick={onOpenDossier}
            title="View Aadhaar, Birth Certificate, and Statutory Identity"
          >
            🪪 My ID &amp; Documents
          </button>
          <button
            className="secondary-button"
            onClick={() => setActiveTab("timetable")}
          >
            ▤ Exam Schedule
          </button>
          <button
            className="primary-button"
            onClick={onOpenHallTicket}
          >
            🖨️ Hall Ticket
          </button>
        </div>
      </section>

      {/* Metric Summary Cards */}
      <section className="metrics-grid" aria-label="Student summary">
        {/* Attendance Rate */}
        <article
          className="metric-card metric-attendance"
          onClick={() => setActiveTab("attendance")}
          style={{ cursor: "pointer" }}
        >
          <p className="metric-title">ATTENDANCE RATE</p>
          <div className="metric-value-row">
            <h2>{attendanceStats?.rate || "98.4%"}</h2>
            <span className="metric-extra attendance">
              {attendanceStats?.presentDays ?? 98} Present /{" "}
              {attendanceStats?.absentDays ?? 2} Absent
            </span>
          </div>
          <p className="metric-description">
            {attendanceStats?.totalWorkingDays ?? 100} Working Days Recorded in Muster
          </p>
        </article>

        {/* Upcoming Exam */}
        <article
          className="metric-card metric-exam"
          onClick={() => setActiveTab("timetable")}
          style={{ cursor: "pointer" }}
        >
          <p className="metric-title">UPCOMING EXAM</p>
          <div className="metric-value-row">
            <h2 style={{ fontSize: "19px" }}>
              {nextExam ? nextExam.subject.split("-")[0] : "SSLC Board Exam"}
            </h2>
          </div>
          <p className="metric-description">
            {nextExam ? `${nextExam.date} • ${nextExam.startTime}` : "12 March 2026 • 09:30 AM"}
          </p>
        </article>

        {/* Fee Status */}
        <article
          className="metric-card metric-score"
          onClick={() => setActiveTab("fees")}
          style={{ cursor: "pointer" }}
        >
          <p className="metric-title">FEE BALANCE STATUS</p>
          <div className="metric-value-row">
            <h2>
              {totalFeeDue === 0 ? "₹0 Due" : `₹${totalFeeDue}`}
            </h2>
            <span
              className="metric-extra"
              style={{
                background: totalFeeDue === 0 ? "#dcfce7" : "#fee2e2",
                color: totalFeeDue === 0 ? "#15803d" : "#b91c1c",
              }}
            >
              {totalFeeDue === 0 ? "All Cleared ✓" : "Pending Due"}
            </span>
          </div>
          <p className="metric-description">
            Billed: ₹{feesData?.summary?.totalBilled ?? 2800} • Paid: ₹{feesData?.summary?.totalPaid ?? 2300}
          </p>
        </article>

        {/* Class Mentor */}
        <article className="metric-card metric-days">
          <p className="metric-title">CLASS MENTOR</p>
          <div className="metric-value-row">
            <h2 style={{ fontSize: "17px" }}>
              {mentorProfile?.name || "Mrs. Priya Nair"}
            </h2>
            <span className="metric-extra days">
              {mentorProfile?.designation || "HSST"}
            </span>
          </div>
          <p className="metric-description">
            {mentorProfile?.department || "HSST Malayalam"} • {mentorProfile?.phone || "+91 94471 22334"}
          </p>
        </article>
      </section>

      {/* Lower Schedule & Notices Grid */}
      <section className="lower-grid">
        <article className="schedule-panel">
          <div className="panel-heading">
            <div className="panel-title">
              <span className="heading-marker blue-marker" />
              <h2>Today's Class Schedule &amp; Routine</h2>
            </div>
            <span className="schedule-period">Monday • Period 1 to 7</span>
          </div>

          <div className="lesson-grid">
            {lessons.map((lesson) => (
              <div
                className={`lesson-card lesson-${lesson.type}`}
                key={lesson.subject}
              >
                <span className="lesson-time">{lesson.time}</span>
                <h3>{lesson.subject}</h3>
                <p>{lesson.teacher}</p>
                <span className="lesson-room">{lesson.room}</span>
              </div>
            ))}
          </div>

          <div className="schedule-footer">
            <span>
              Class Mentor Sign-off for Terminal Exam Hall Pass:
              <strong className="verified-text"> Verified &amp; Endorsed</strong>
            </span>
            <button
              className="text-button"
              onClick={() => setActiveTab("timetable")}
            >
              View full exam timetable →
            </button>
          </div>
        </article>

        <aside className="notices-panel">
          <div className="panel-heading">
            <div className="panel-title">
              <span className="heading-marker gray-marker" />
              <h2>Academic Notices</h2>
            </div>
            <span className="notice-source">SCERT</span>
          </div>

          <div className="notice-list">
            {notices.map((notice) => (
              <article className="notice-card" key={notice.title}>
                <div className="notice-topline">
                  <span>{notice.date}</span>
                  <span className={`notice-tag ${notice.type}`}>
                    {notice.tag}
                  </span>
                </div>
                <h3>{notice.title}</h3>
                <p>{notice.description}</p>
              </article>
            ))}
          </div>

          <div className="notice-footer">
            Principal's Office
            <span>Notice Ref #GHSS-26/042</span>
          </div>
        </aside>
      </section>
    </>
  );
}
