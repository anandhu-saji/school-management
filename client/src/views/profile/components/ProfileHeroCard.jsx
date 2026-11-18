export default function ProfileHeroCard({
  role,
  roleData,
  profileData,
  feedback,
  setFeedback,
  notifications,
  handleDismissNotification,
}) {
  return (
    <>
      {/* Header Banner */}
      <section className="profile-hero-card">
        <div className="profile-badge-row">
          <span className="profile-pill-badge">
            KERALA GENERAL EDUCATION DEPT. • GHSS RAJAKKAD
          </span>
          <span className="profile-pill-sync">SAMPOORNA ID VERIFIED</span>
          {role === "admin" && (
            <span
              className="profile-pill-badge"
              style={{ background: "#f59e0b" }}
            >
              CHIEF ADMIN
            </span>
          )}
        </div>
        <h1 className="profile-hero-title">
          <span>{profileData?.user?.name || "User Profile"}</span>
          <span style={{ fontSize: "18px", color: "#60a5fa" }}>✓</span>
        </h1>
        <p className="profile-hero-subtext">
          {role === "admin" &&
            "Headmaster & Chief Administrative Executive • School Code: 06042"}
          {role === "teacher" &&
            `Faculty Service Register • PEN: ${
              roleData.penNumber || roleData.pen || "—"
            } • ${roleData.assignedClass || "Class Mentor"}`}
          {role === "student" &&
            `Kerala Sampoorna Student Registry • Admission No: ${
              roleData.admissionNumber || "—"
            } • ${roleData.classDivision || "Class 10-A"}`}
        </p>
      </section>

      {/* Action / Error / Success Feedback */}
      {feedback.message && (
        <div className={`profile-notification-card ${feedback.type}`}>
          <div>
            <div className="notif-content-title">
              {feedback.type === "success" && "✓ Success"}
              {feedback.type === "warning" && "⏳ Pending Admin Approval"}
              {feedback.type === "error" && "✕ Alert"}
            </div>
            <div className="notif-content-msg">{feedback.message}</div>
          </div>
          <button
            type="button"
            className="notif-dismiss-btn"
            onClick={() => setFeedback({ type: "", message: "" })}
          >
            ✕
          </button>
        </div>
      )}

      {/* Notifications from Admin */}
      {notifications.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`profile-notification-card ${
                notif.type === "error" ? "error" : "success"
              }`}
            >
              <div>
                <div className="notif-content-title">
                  {notif.type === "error" ? "✕ Notification" : "✓ Notification"}
                </div>
                <div className="notif-content-msg">
                  <strong>{notif.message}</strong>
                </div>
              </div>
              <button
                type="button"
                className="notif-dismiss-btn"
                title="Dismiss notification"
                onClick={() => handleDismissNotification(notif._id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
