export default function TeacherSidebar({
  activeTab,
  setActiveTab,
  teacherProfile,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
}) {
  return (
    <>
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`admin-sidebar teacher-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div>
          <div className="sidebar-header">
            <div className="school-code-label">School Code: 06042</div>
            <div className="sampoorna-live-pill">
              <span className="dot"></span> SAMPOORNA 2.0 LIVE
            </div>
          </div>

          <div className="sidebar-section-title">TEACHER CONSOLE</div>
          <nav className="console-nav-list">
            <button
              className={`console-nav-item ${activeTab === "attendance" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("attendance");
                setSidebarOpen(false);
              }}
            >
              <span>📅</span> Mark Daily Attendance
            </button>
            <button
              className={`console-nav-item ${activeTab === "academics" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("academics");
                setSidebarOpen(false);
              }}
            >
              <span>👥</span> Class Students &amp; KYC
            </button>
            <button
              className={`console-nav-item ${activeTab === "marks" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("marks");
                setSidebarOpen(false);
              }}
            >
              <span>📝</span> Internal &amp; CE Marks
            </button>
            <button
              className={`console-nav-item ${activeTab === "timetable" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("timetable");
                setSidebarOpen(false);
              }}
            >
              <span>🗓️</span> Timetable &amp; Exam Duties
            </button>
            <button
              className={`console-nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("profile");
                setSidebarOpen(false);
              }}
            >
              <span>👤</span> My SPARK Profile
            </button>
          </nav>
        </div>

        {/* Bottom Profile Card */}
        <div className="sidebar-bottom-profile">
          <div className="profile-avatar-circle" style={{ background: "#2563eb" }}>
            <span>👩‍🏫</span>
          </div>
          <div className="profile-details-column">
            <div className="profile-name-row">
              <span style={{ fontWeight: "700", fontSize: "13px" }}>
                {teacherProfile.name || "Mrs. Indu B Nair"}
              </span>
              <span className="verified-badge-icon" title="SPARK Verified">✓</span>
            </div>
            <p className="profile-role-subtext">
              {teacherProfile.department || "HST Mathematics"}
            </p>
            <p className="profile-id-code">
              {teacherProfile.assignedClass || "Class 10-A Mentor"} • PEN: {teacherProfile.pen || "849201"}
            </p>
          </div>
          <button
            className="logout-icon-btn"
            onClick={onLogout}
            title="Sign Out"
            aria-label="Sign Out"
          >
            🚪
          </button>
        </div>
      </aside>
    </>
  );
}
