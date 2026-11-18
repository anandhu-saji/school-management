import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDocumentUrl } from "../../utils/documentUrl";

export default function AdminHeader() {
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
      } catch {
        // ignore
      }
    };
    window.addEventListener("userUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("userUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const [avatarError, setAvatarError] = useState(false);
  const userAvatar = user?.avatarUrl ? getDocumentUrl(user.avatarUrl) : null;
  const initial = (user?.name || "A").slice(0, 1).toUpperCase();

  useEffect(() => {
    setAvatarError(false);
  }, [userAvatar]);

  return (
    <header className="admin-top-header">
      <span>
        Kerala General Education Dept. •{" "}
        <strong>Sampoorna Admin Console</strong> • School Code: 06042
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span className="badge-sync">AY 2025–2026</span>
        <button
          onClick={() => navigate("/admin/profile")}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "#135bec",
            color: "#ffffff",
            border: "2px solid #ffffff",
            outline: "2px solid #93c5fd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "14px",
            overflow: "hidden",
            padding: 0,
            transition: "transform 0.15s",
          }}
          title="Click to view & edit Profile"
          aria-label="Admin Profile"
        >
          {userAvatar && !avatarError ? (
            <img
              src={userAvatar}
              alt=""
              onError={() => setAvatarError(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            initial
          )}
        </button>
      </div>
    </header>
  );
}
