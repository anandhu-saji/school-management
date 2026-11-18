import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../utils/auth";
import { getDocumentUrl } from "../../utils/documentUrl";
import api from "../../api/axiosclient";

export default function AdminSidebar({ activeNav }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const handleUserUpdate = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user") || "{}"));
      } catch {
        // ignore
      }
    };
    window.addEventListener("userUpdated", handleUserUpdate);
    window.addEventListener("storage", handleUserUpdate);
    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
      window.removeEventListener("storage", handleUserUpdate);
    };
  }, []);

  // Poll or fetch pending requests count
  useEffect(() => {
    let isMounted = true;
    api
      .get("/profile/admin/requests?status=pending")
      .then((res) => {
        if (isMounted && res.data?.success) {
          setPendingRequestsCount(res.data.pendingCount ?? (res.data.requests?.length || 0));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [activeNav]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const navItems = [
    { id: "overview", path: "/admin/dashboard", icon: "▦", label: "Overview and Dashboard" },
    { id: "attendance", path: "/admin/attendance", icon: "•", label: "Division wise Attendance" },
    { id: "teachers", path: "/admin/teachers", icon: "•", label: "Teachers Records" },
    { id: "students", path: "/admin/students", icon: "•", label: "Students Records" },
    { id: "exams", path: "/admin/exams", icon: "•", label: "Exam Timetables" },
    { id: "payments", path: "/admin/payments", icon: "•", label: "Fee & Payments Console" },
    {
      id: "profile-requests",
      path: "/admin/profile-requests",
      icon: "📋",
      label: "Profile Requests",
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
    },
    { id: "trash", path: "/admin/trash", icon: "🗑", label: "Recycle Bin (Trash)" },
  ];

  const userName = user?.name || user?.username || "Headmaster";
  const userEmail = user?.email || "anandhusaji043@gmail.com";
  const [avatarError, setAvatarError] = useState(false);
  const userAvatar = user?.avatarUrl ? getDocumentUrl(user?.avatarUrl) : null;
  const initials = (userName || "HM").slice(0, 3).toUpperCase();

  useEffect(() => {
    setAvatarError(false);
  }, [userAvatar]);

  return (
    <>
      {/* Mobile Top Header Bar for Admin Console */}
      <div className="admin-mobile-bar">
        <button
          className="admin-hamburger-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
        <div className="admin-mobile-title">
          <strong>SAMPOORNA ADMIN</strong>
          <span>School Code: 06042</span>
        </div>
        <button
          className="admin-mobile-logout-btn"
          onClick={handleLogout}
          title="Sign Out"
          aria-label="Sign Out"
        >
          ⇥
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {mobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`}>
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
                  setMobileOpen(false);
                  if (activeNav !== item.id) {
                    navigate(item.path);
                  }
                }}
                style={{ position: "relative" }}
              >
                <span>{item.icon}</span> {item.label}
                {item.badge && (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: "#ef4444",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: "800",
                      padding: "2px 7px",
                      borderRadius: "10px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Profile Card - Clickable to open Profile */}
        <div className="sidebar-bottom-profile">
          <div
            className="profile-avatar-clickable"
            onClick={() => navigate("/admin/profile")}
            title="Click to view & edit Headmaster profile"
          >
            <div className="profile-avatar-circle">
              {userAvatar && !avatarError ? (
                <img
                  src={userAvatar}
                  alt=""
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="profile-details-column">
              <div className="profile-name-row">
                <span>{userName}</span>
                <span className="verified-badge-icon">✓</span>
              </div>
              <p className="profile-role-subtext">Headmaster / Chief Admin</p>
              <p className="profile-id-code">{userEmail}</p>
            </div>
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
    </>
  );
}
