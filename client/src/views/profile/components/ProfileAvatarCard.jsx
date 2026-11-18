import { useState, useEffect } from "react";

export default function ProfileAvatarCard({
  fileInputRef,
  handleAvatarFileChange,
  avatarDisplayUrl,
  initials,
  uploadingAvatar,
  profileData,
  role,
  roleData,
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [avatarDisplayUrl]);

  return (
    <div className="profile-left-col">
      <div className="profile-card profile-avatar-wrapper">
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleAvatarFileChange}
        />

        <div
          className="profile-avatar-frame"
          onClick={() => fileInputRef.current?.click()}
          title="Click to change profile picture"
        >
          {avatarDisplayUrl && !imgError ? (
            <img
              src={avatarDisplayUrl}
              alt=""
              onError={() => setImgError(true)}
            />
          ) : (
            <span>{initials}</span>
          )}
          <div className="profile-avatar-upload-overlay">
            <span style={{ fontSize: "20px" }}>📷</span>
            <span>{uploadingAvatar ? "Uploading..." : "Change"}</span>
          </div>
        </div>

        <button
          type="button"
          className="btn-upload-photo"
          disabled={uploadingAvatar}
          onClick={() => fileInputRef.current?.click()}
        >
          <span>📷</span>
          <span>{uploadingAvatar ? "Uploading..." : "Change Photo"}</span>
        </button>
        <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
          Direct update • JPG, PNG, WEBP max 5MB
        </span>

        <h3 className="profile-user-name">
          {profileData?.user?.name || "User"}
        </h3>
        <span className="profile-user-role">
          {role === "admin" && "Headmaster / Admin"}
          {role === "teacher" && (roleData.designation || "HSST Faculty")}
          {role === "student" &&
            `${roleData.classDivision || "Class 10-A"} Scholar`}
        </span>

        <div className="profile-meta-list">
          <div className="profile-meta-row">
            <span className="profile-meta-label">Account Email</span>
            <span className="profile-meta-val">{profileData?.user?.email}</span>
          </div>
          <div className="profile-meta-row">
            <span className="profile-meta-label">Official Identifier</span>
            <span
              className="profile-meta-val"
              style={{ color: "#2563eb", fontFamily: "monospace" }}
            >
              {profileData?.identifier || "—"}
            </span>
          </div>
          {profileData?.division && (
            <div className="profile-meta-row">
              <span className="profile-meta-label">Academic Division</span>
              <span className="profile-meta-val">{profileData.division}</span>
            </div>
          )}
        </div>
      </div>

      {/* Compliance & Verification Card */}
      <div className="profile-card profile-status-card">
        <div className="profile-status-title">
          <span>🛡️</span>
          <span>Institutional Status</span>
        </div>
        <div className="profile-status-item">
          <span className="status-key">Registry State</span>
          <span className="status-pill active">Verified ✓</span>
        </div>
        <div className="profile-status-item">
          <span className="status-key">Sampoorna ID</span>
          <span className="status-pill linked">Linked</span>
        </div>
        <div className="profile-status-item">
          <span className="status-key">Academic Year</span>
          <span style={{ fontWeight: "700", color: "#0f172a" }}>
            2026 – 2027
          </span>
        </div>
      </div>
    </div>
  );
}
