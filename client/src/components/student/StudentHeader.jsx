import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDocumentUrl } from "../../utils/documentUrl";

export default function StudentHeader({
  activeTab,
  displayClass,
  displayName,
  getInitials,
}) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user") || "{}"));
      } catch {}
    };
    window.addEventListener("userUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("userUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const userAvatar = user?.avatarUrl ? getDocumentUrl(user.avatarUrl) : null;

  return (
    <header className="topbar admin-header">
      <div className="header-breadcrumbs">
        <span>Student Portal</span> / <span>Academics</span> /{" "}
        <strong>
          {activeTab === "overview" && "Overview & Dashboard"}
          {activeTab === "attendance" && "Monthly Attendance & Muster"}
          {activeTab === "timetable" && "Exam Timetable & Seating Pass"}
          {activeTab === "fees" && "Fee Ledger & Official Receipts"}
          {activeTab === "profile" && "Student Profile & Settings"}
        </strong>
      </div>

      <div
        className="student-header-right"
        style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}
      >
        <span
          className="header-class-pill"
          style={{
            background: "#eff6ff",
            color: "#1d4ed8",
            padding: "5px 12px",
            borderRadius: "20px",
            fontWeight: "700",
            fontSize: "12px",
            border: "1px solid #bfdbfe",
          }}
        >
          {displayClass}
        </span>
        <span
          className="header-scert-pill"
          style={{
            background: "#dcfce7",
            color: "#15803d",
            padding: "5px 12px",
            borderRadius: "20px",
            fontWeight: "700",
            fontSize: "11px",
            border: "1px solid #bbf7d0",
          }}
        >
          SCERT Active
        </span>

        {/* Profile Avatar Trigger in Header */}
        <button
          className="topbar-profile-btn"
          onClick={() => navigate("/student/profile")}
          title="Click to view & edit Profile"
        >
          <div
            className="topbar-avatar-circle"
            style={{
              background: "#2563eb",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="Avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              getInitials(displayName)
            )}
          </div>
          <div className="topbar-profile-info">
            <span className="topbar-profile-name">{displayName.split(" ")[0]}</span>
            <span className="topbar-profile-badge">Profile</span>
          </div>
        </button>
      </div>
    </header>
  );
}
