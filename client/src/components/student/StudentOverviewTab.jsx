import { useState, useEffect } from "react";
import { getDocumentUrl } from "../../utils/documentUrl";

const defaultWeeklyTimetable = [
  {
    time: "8:00–8:45",
    monday: "Mathematics",
    tuesday: "Science",
    wednesday: "English",
    thursday: "Social Studies",
    friday: "Mathematics",
  },
  {
    time: "8:45–9:30",
    monday: "Mathematics",
    tuesday: "Science",
    wednesday: "English",
    thursday: "Social Studies",
    friday: "Mathematics",
  },
  {
    time: "9:30–10:15",
    monday: "Science",
    tuesday: "English",
    wednesday: "Mathematics",
    thursday: "Science",
    friday: "English",
  },
  {
    time: "10:15–10:30",
    isBreak: true,
  },
  {
    time: "10:30–11:15",
    monday: "Social Studies",
    tuesday: "Art",
    wednesday: "Computer",
    thursday: "Mathematics",
    friday: "Science",
  },
  {
    time: "11:15–12:00",
    monday: "Computer",
    tuesday: "Social Studies",
    wednesday: "Art",
    thursday: "Computer",
    friday: "Social Studies",
  },
  {
    time: "12:00–12:45",
    monday: "Physical Education",
    tuesday: "Computer",
    wednesday: "Physical Education",
    thursday: "Art",
    friday: "Physical Education",
  },
];

const getSubjectClass = (subject) => {
  if (!subject) return "general";
  const s = subject.toLowerCase();
  if (s.includes("math")) return "math";
  if (s.includes("science")) return "science";
  if (s.includes("english")) return "english";
  if (s.includes("social")) return "social";
  if (s.includes("computer")) return "computer";
  if (s.includes("art")) return "art";
  if (s.includes("physical") || s.includes("pe") || s.includes("education")) return "pe";
  return "general";
};

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
  const [avatarError, setAvatarError] = useState(false);
  const userAvatar = user?.avatarUrl || studentProfile?.avatarUrl;
  const avatarUrl = userAvatar ? getDocumentUrl(userAvatar) : null;

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  return (
    <>
      {/* Welcome Card */}
      <section className="welcome-card">
        {/* Clickable Profile Avatar */}
        <div
          className="avatar main-avatar avatar-clickable"
          onClick={onOpenDossier}
          title="Click to view My ID &amp; Documents Dossier"
          style={{ overflow: "hidden", position: "relative" }}
        >
          {avatarUrl && !avatarError ? (
            <img
              src={avatarUrl}
              alt=""
              onError={() => setAvatarError(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
            />
          ) : (
            getInitials(displayName)
          )}
          <span className="avatar-id-badge" title="View Identity Dossier">ID</span>
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
            My ID &amp; Documents
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
            Hall Ticket
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
            <h2>{attendanceStats?.rate || "100.0%"}</h2>
            <span className="metric-extra attendance">
              {attendanceStats?.presentDays ?? 0} Present /{" "}
              {attendanceStats?.absentDays ?? 0} Absent
            </span>
          </div>
          <p className="metric-description">
            {attendanceStats?.totalWorkingDays ?? 0} Working Days Recorded in Muster
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
              {nextExam ? nextExam.subject.split("-")[0] : "Academic Exams"}
            </h2>
          </div>
          <p className="metric-description">
            {nextExam ? `${nextExam.date} • ${nextExam.startTime}` : "Schedule will be announced"}
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
            Billed: ₹{feesData?.summary?.totalBilled ?? 0} • Paid: ₹{feesData?.summary?.totalPaid ?? 0}
          </p>
        </article>

        {/* Class Mentor */}
        <article className="metric-card metric-days">
          <p className="metric-title">CLASS MENTOR</p>
          <div className="metric-value-row">
            <h2 style={{ fontSize: "17px" }}>
              {mentorProfile?.name || "Assigned Class Mentor"}
            </h2>
            <span className="metric-extra days">
              {mentorProfile?.designation || "Faculty"}
            </span>
          </div>
          <p className="metric-description">
            {mentorProfile?.department || "General Education"}{mentorProfile?.phone ? ` • ${mentorProfile.phone}` : ""}
          </p>
        </article>
      </section>

      {/* Lower Schedule & Notices Grid */}
      <section className="lower-grid">
        <article className="schedule-panel">
          <div className="panel-heading">
            <div className="panel-title">
              <span className="heading-marker blue-marker" />
              <h2>Weekly Class Timetable</h2>
            </div>
            <span className="schedule-period">
              {displayClass ? `${displayClass} • ` : ""}Monday to Friday
            </span>
          </div>

          <div className="weekly-timetable-container">
            <table className="weekly-timetable-table">
              <thead>
                <tr>
                  <th className="time-col-header">Time</th>
                  <th>Monday</th>
                  <th>Tuesday</th>
                  <th>Wednesday</th>
                  <th>Thursday</th>
                  <th>Friday</th>
                </tr>
              </thead>
              <tbody>
                {defaultWeeklyTimetable.map((row, idx) => (
                  <tr key={idx}>
                    <td className="time-cell">{row.time}</td>
                    {row.isBreak ? (
                      <td colSpan={5} className="break-cell">
                        — BREAK —
                      </td>
                    ) : (
                      <>
                        <td>
                          <span className={`timetable-subject-pill ${getSubjectClass(row.monday)}`}>
                            {row.monday}
                          </span>
                        </td>
                        <td>
                          <span className={`timetable-subject-pill ${getSubjectClass(row.tuesday)}`}>
                            {row.tuesday}
                          </span>
                        </td>
                        <td>
                          <span className={`timetable-subject-pill ${getSubjectClass(row.wednesday)}`}>
                            {row.wednesday}
                          </span>
                        </td>
                        <td>
                          <span className={`timetable-subject-pill ${getSubjectClass(row.thursday)}`}>
                            {row.thursday}
                          </span>
                        </td>
                        <td>
                          <span className={`timetable-subject-pill ${getSubjectClass(row.friday)}`}>
                            {row.friday}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
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
