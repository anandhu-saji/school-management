import { useState, useEffect } from "react";
import { getDocumentUrl } from "../../utils/documentUrl";

export default function TeacherSidebar({
  activeTab,
  setActiveTab,
  teacherProfile = {},
  sidebarOpen,
  setSidebarOpen,
  onLogout,
}) {
  const [avatarError, setAvatarError] = useState(false);
  const teacherAvatar = teacherProfile?.avatarUrl ? getDocumentUrl(teacherProfile.avatarUrl) : null;
  const initial = (teacherProfile?.name || "T").slice(0, 1).toUpperCase();

  useEffect(() => {
    setAvatarError(false);
  }, [teacherAvatar]);
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
              <span>•</span> Mark Daily Attendance
            </button>
            <button
              className={`console-nav-item ${activeTab === "academics" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("academics");
                setSidebarOpen(false);
              }}
            >
              <span>•</span> Class Students &amp; KYC
            </button>
            <button
              className={`console-nav-item ${activeTab === "marks" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("marks");
                setSidebarOpen(false);
              }}
            >
              <span>•</span> Internal &amp; CE Marks
            </button>
            <button
              className={`console-nav-item ${activeTab === "timetable" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("timetable");
                setSidebarOpen(false);
              }}
            >
              <span>•</span> Timetable &amp; Exam Duties
            </button>
            <button
              className={`console-nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("profile");
                setSidebarOpen(false);
              }}
            >
              <span>•</span> My SPARK Profile
            </button>

            {teacherProfile?.isAdmissionAdminActive && (
              <button
                className={`console-nav-item ${activeTab === "admissions" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("admissions");
                  setSidebarOpen(false);
                }}
                style={{
                  background: activeTab === "admissions" ? "#1e3a8a" : "#eff6ff",
                  color: activeTab === "admissions" ? "#ffffff" : "#1d4ed8",
                  border: "1.5px solid #3b82f6",
                  fontWeight: "700",
                  marginTop: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                title={`Temporary Admission Administrator (Valid until ${
                  teacherProfile.admissionAdminEndDate
                    ? new Date(teacherProfile.admissionAdminEndDate).toLocaleDateString()
                    : "further notice"
                })`}
              >
                <span>🎓</span> Student Admissions
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "10px",
                    fontWeight: "800",
                    background: activeTab === "admissions" ? "#10b981" : "#2563eb",
                    color: "#ffffff",
                    padding: "2px 6px",
                    borderRadius: "8px",
                  }}
                >
                  ADMIN
                </span>
              </button>
            )}
  
          </nav>
        </div>

        {/* Bottom Profile Card */}
        <div className="sidebar-bottom-profile">
          <div
            className="profile-avatar-clickable"
            onClick={() => {
              setActiveTab("profile");
              setSidebarOpen(false);
            }}
            title="Click to view & edit SPARK Profile"
          >
            <div className="profile-avatar-circle" style={{ background: "#2563eb" }}>
              {teacherAvatar && !avatarError ? (
                <img
                  src={teacherAvatar}
                  alt=""
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className="profile-details-column">
              <div className="profile-name-row">
                <span style={{ fontWeight: "700", fontSize: "13px" }}>
                  {teacherProfile.name || "Teacher"}
                </span>
                <span className="verified-badge-icon" title="SPARK Verified">✓</span>
              </div>
              <p className="profile-role-subtext">
                {teacherProfile.department || "Faculty"}
              </p>
              <p className="profile-id-code">
                {teacherProfile.assignedClass || "Class 10-A Mentor"} • PEN: {teacherProfile.pen || teacherProfile.penNumber || "—"}
              </p>
            </div>
          </div>
          <button
            className="logout-icon-btn"
            onClick={onLogout}
            title="Sign Out"
            aria-label="Sign Out"
          >
            ⇥
          </button>
        </div>
      </aside>
    </>
  );
}
