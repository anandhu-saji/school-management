import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../utils/auth";

export default function AdminSidebar({ activeNav }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const navItems = [
    { id: "overview", path: "/admin/dashboard", icon: "▦", label: "Overview and Dashboard" },
    { id: "attendance", path: "/admin/attendance", icon: "👥", label: "Division wise Attendance" },
    { id: "teachers", path: "/admin/teachers", icon: "🗂", label: "Teachers Records" },
    { id: "students", path: "/admin/students", icon: "🎓", label: "Students Records" },
    { id: "exams", path: "/admin/exams", icon: "📅", label: "Exam Timetables" },
    { id: "payments", path: "/admin/payments", icon: "💳", label: "Fee & Payments Console" },
  ];

  return (
    <aside className="admin-sidebar">
      <div>
        <div className="sidebar-header">
          <div className="school-code-label">School Code: 06042</div>
          <div className="sampoorna-live-pill">
            <span className="dot"></span> SAMPOORNA 2.0 LIVE
          </div>
        </div>

        <div className="sidebar-section-title">CONSOLE NAVIGATION</div>
        <nav className="console-nav-list">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`console-nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => {
                if (activeNav !== item.id) {
                  navigate(item.path);
                }
              }}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Profile Card */}
      <div className="sidebar-bottom-profile">
        <div className="profile-avatar-circle">
          <span>🛡</span>
        </div>
        <div className="profile-details-column">
          <div className="profile-name-row">
            <span>Sri. K. R. Madhavan</span>
            <span className="verified-badge-icon">✓</span>
          </div>
          <p className="profile-role-subtext">Headmaster / Chief Admin</p>
          <p className="profile-id-code">ADM-GHSS-01</p>
        </div>
        <button
          className="logout-icon-btn"
          onClick={handleLogout}
          title="Sign Out"
          aria-label="Sign Out"
        >
          ⇥
        </button>
      </div>
    </aside>
  );
}
