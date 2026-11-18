import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosclient";
import { getDocumentUrl } from "../../utils/documentUrl";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import StudentSidebar from "../../components/student/StudentSidebar";
import StudentHeader from "../../components/student/StudentHeader";
import "../../Styles/AdminDash.css";
import "../../Styles/TeacherDash.css";
import "../../Styles/StudentDash.css";
import "../../Styles/Profile.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [initialData, setInitialData] = useState({});

  const role = user?.role === "user" ? "student" : user?.role || "student";

  // Sidebar / Header support for each console
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch full profile from server
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/profile");
      if (res.data?.success && res.data?.user) {
        const u = res.data.user;
        const rData = res.data.roleData || {};
        setProfileData(res.data);

        // Update local storage user
        const updatedLocalUser = {
          ...user,
          name: u.name,
          email: u.email,
          avatarUrl: u.avatarUrl,
          role: u.role,
        };
        localStorage.setItem("user", JSON.stringify(updatedLocalUser));
        setUser(updatedLocalUser);
        window.dispatchEvent(new Event("userUpdated"));

        // Build editable form state
        const initial = {
          name: u.name || "",
          email: u.email || "",
          phone: rData.phone || rData.parentContact || u.phone || "",
          gender: rData.gender || "Male",
          dob: rData.dob || "",
          // Student fields
          guardian: rData.guardian || "",
          guardianRelation: rData.guardianRelation || "Father",
          parentContact: rData.parentContact || rData.phone || "",
          altContact: rData.altContact || "",
          bloodGroup: rData.bloodGroup || "O+",
          religion: rData.religion || "Hindu",
          caste: rData.caste || "",
          houseName: rData.houseName || "",
          street: rData.street || "",
          postOffice: rData.postOffice || "",
          city: rData.city || "",
          district: rData.district || "Idukki",
          state: rData.state || "Kerala",
          pincode: rData.pincode || "",
          // Teacher fields
          qualification: rData.qualification || "",
          department: rData.department || "",
        };

        setFormData(initial);
        setInitialData(initial);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setFeedback({
        type: "error",
        message: "Failed to load profile data from server.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Handle immediate avatar photo upload
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFeedback({
        type: "error",
        message: "Please select a valid image file (JPG, PNG, WEBP).",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({
        type: "error",
        message: "Image exceeds 5MB limit. Please upload a smaller image.",
      });
      return;
    }

    try {
      setUploadingAvatar(true);
      setFeedback({ type: "", message: "" });

      const form = new FormData();
      form.append("avatar", file);

      const res = await api.post("/upload/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data?.avatarUrl) {
        const newAvatar = res.data.avatarUrl;

        // Update local user and state immediately
        const updatedLocalUser = { ...user, avatarUrl: newAvatar };
        localStorage.setItem("user", JSON.stringify(updatedLocalUser));
        setUser(updatedLocalUser);
        window.dispatchEvent(new Event("userUpdated"));

        setProfileData((prev) =>
          prev
            ? {
                ...prev,
                user: { ...prev.user, avatarUrl: newAvatar },
                roleData: { ...prev.roleData, avatarUrl: newAvatar },
              }
            : prev
        );

        setFeedback({
          type: "success",
          message: "Profile picture updated successfully!",
        });
      }
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      setFeedback({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to upload profile picture. Please try again.",
      });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit profile changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFeedback({ type: "", message: "" });

      const res = await api.put("/profile", formData);

      if (res.data?.success) {
        if (res.data?.isDirectUpdate) {
          setFeedback({
            type: "success",
            message: res.data.message || "Profile updated successfully.",
          });
        } else {
          setFeedback({
            type: "warning",
            message:
              res.data.message ||
              "Your change request has been submitted to the Admin side. Once accepted, your details will be updated.",
          });
        }
        await loadProfile();
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setFeedback({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to submit profile changes. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Dismiss notification
  const handleDismissNotification = async (notifId) => {
    try {
      await api.delete(`/profile/notifications/${notifId}`);
      setProfileData((prev) => ({
        ...prev,
        notifications: prev.notifications.filter((n) => n._id !== notifId),
      }));
    } catch (err) {
      console.error("Failed to dismiss notification:", err);
    }
  };

  const roleData = profileData?.roleData || {};
  const pendingReq = profileData?.pendingRequest;
  const notifications = profileData?.notifications || [];

  const avatarDisplayUrl = profileData?.user?.avatarUrl
    ? getDocumentUrl(profileData.user.avatarUrl)
    : "";

  const initials = (profileData?.user?.name || user?.name || "U")
    .slice(0, 3)
    .toUpperCase();

  // Helper to get field label
  const getFieldLabel = (key) => {
    const map = {
      phone: "Phone Number",
      parentContact: "Guardian Contact",
      altContact: "Alternate Contact",
      guardian: "Guardian Name",
      guardianRelation: "Guardian Relation",
      name: "Full Name",
      gender: "Gender",
      dob: "Date of Birth",
      bloodGroup: "Blood Group",
      religion: "Religion",
      caste: "Caste",
      houseName: "House Name",
      street: "Street / Locality",
      postOffice: "Post Office",
      city: "City / Village",
      district: "District",
      pincode: "PIN Code",
      qualification: "Qualifications",
      department: "Department",
    };
    return map[key] || key;
  };

  const renderContent = () => (
    <div className="profile-page-container">
      {/* Header Banner */}
      <section className="profile-hero-card">
        <div className="profile-badge-row">
          <span className="profile-pill-badge">
            KERALA GENERAL EDUCATION DEPT. • GHSS RAJAKKAD
          </span>
          <span className="profile-pill-sync">SAMPOORNA ID VERIFIED</span>
          {role === "admin" && (
            <span className="profile-pill-badge" style={{ background: "#f59e0b" }}>
              CHIEF ADMIN
            </span>
          )}
        </div>
        <h1 className="profile-hero-title">
          <span>{profileData?.user?.name || "User Profile"}</span>
          <span style={{ fontSize: "18px", color: "#60a5fa" }}>✓</span>
        </h1>
        <p className="profile-hero-subtext">
          {role === "admin" && "Headmaster & Chief Administrative Executive • School Code: 06042"}
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

      {/* Notifications from Admin (e.g. "Your request is rejected.") */}
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

      {/* Active Pending Request Banner with Differences */}
      {pendingReq && pendingReq.requestedChanges && (
        <section className="profile-pending-banner">
          <div className="pending-banner-header">
            <div className="pending-tag">
              <span>⏳</span>
              <span>Pending Admin Verification &amp; Approval</span>
            </div>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Submitted on:{" "}
              {new Date(pendingReq.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 10px 0" }}>
            You have submitted the following updates. Current records will remain active until the
            Headmaster reviews and approves your request:
          </p>
          <table className="pending-diff-table">
            <thead>
              <tr>
                <th>Field Name</th>
                <th>Current Value</th>
                <th>Requested New Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(pendingReq.requestedChanges).map((key) => (
                <tr key={key}>
                  <td>
                    <strong>{getFieldLabel(key)}</strong>
                  </td>
                  <td>
                    <span className="diff-val-old">
                      {pendingReq.currentData?.[key] || "—"}
                    </span>
                  </td>
                  <td>
                    <span className="diff-val-new">
                      {pendingReq.requestedChanges[key]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Main Grid: Left Column + Right Details Form */}
      <div className="profile-layout-grid">
        {/* Left Column: Avatar & Summary & Status Card */}
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
              {avatarDisplayUrl ? (
                <img src={avatarDisplayUrl} alt="Avatar" />
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

            <h3 className="profile-user-name">{profileData?.user?.name || "User"}</h3>
            <span className="profile-user-role">
              {role === "admin" && "Headmaster / Admin"}
              {role === "teacher" && (roleData.designation || "HSST Faculty")}
              {role === "student" && `${roleData.classDivision || "Class 10-A"} Scholar`}
            </span>

            <div className="profile-meta-list">
              <div className="profile-meta-row">
                <span className="profile-meta-label">Account Email</span>
                <span className="profile-meta-val">{profileData?.user?.email}</span>
              </div>
              <div className="profile-meta-row">
                <span className="profile-meta-label">Official Identifier</span>
                <span className="profile-meta-val" style={{ color: "#2563eb", fontFamily: "monospace" }}>
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
              <span style={{ fontWeight: "700", color: "#0f172a" }}>2026 – 2027</span>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form Details */}
        <div className="profile-card">
          <form onSubmit={handleSubmit}>
            {role !== "admin" && (
              <div className="profile-governance-notice">
                <div className="gov-icon-badge">🏛️</div>
                <div className="gov-text-block">
                  <h4>Official Records Governance</h4>
                  <p>
                    For statutory compliance under Kerala Education Rules, changes to demographic and contact details will be reviewed and approved by the Administration before updating permanent records.
                  </p>
                </div>
              </div>
            )}

            <div className="profile-form-section-title">
              <span>👤</span>
              <span>Personal &amp; Contact Details</span>
            </div>

            <div className="profile-form-grid">
              <div className="profile-form-group">
                <label className="profile-form-label">
                  Full Legal Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="profile-form-input"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">
                  Institutional Email ID <span className="field-official-tag">Official</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="profile-form-input readonly"
                  value={formData.email || ""}
                  readOnly
                  title="Official institutional email ID cannot be edited online"
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">
                  Official Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="profile-form-input"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">Gender</label>
                <select
                  name="gender"
                  className="profile-form-select"
                  value={formData.gender || "Male"}
                  onChange={handleInputChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">Date of Birth</label>
                <input
                  type="text"
                  name="dob"
                  className="profile-form-input"
                  value={formData.dob || ""}
                  onChange={handleInputChange}
                  placeholder="YYYY-MM-DD or DD/MM/YYYY"
                />
              </div>

              {role === "student" && (
                <div className="profile-form-group">
                  <label className="profile-form-label">Blood Group</label>
                  <select
                    name="bloodGroup"
                    className="profile-form-select"
                    value={formData.bloodGroup || "O+"}
                    onChange={handleInputChange}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              )}

              {role === "teacher" && (
                <div className="profile-form-group">
                  <label className="profile-form-label">Academic Qualifications</label>
                  <input
                    type="text"
                    name="qualification"
                    className="profile-form-input"
                    value={formData.qualification || ""}
                    onChange={handleInputChange}
                    placeholder="M.Sc, B.Ed, SET"
                  />
                </div>
              )}
            </div>

            {/* Student-Specific Guardian and Address */}
            {role === "student" && (
              <>
                <div className="profile-form-section-title">
                  <span>👨‍👩‍👧</span>
                  <span>Guardian &amp; Residential Address</span>
                </div>

                <div className="profile-form-grid">
                  <div className="profile-form-group">
                    <label className="profile-form-label">Guardian Full Name</label>
                    <input
                      type="text"
                      name="guardian"
                      className="profile-form-input"
                      value={formData.guardian || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-form-label">Parent / Guardian Contact</label>
                    <input
                      type="tel"
                      name="parentContact"
                      className="profile-form-input"
                      value={formData.parentContact || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="profile-form-group span-2">
                    <label className="profile-form-label">House Name / Door Number</label>
                    <input
                      type="text"
                      name="houseName"
                      className="profile-form-input"
                      value={formData.houseName || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-form-label">City / Village / Post Office</label>
                    <input
                      type="text"
                      name="city"
                      className="profile-form-input"
                      value={formData.city || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-form-label">Postal PIN Code</label>
                    <input
                      type="text"
                      name="pincode"
                      className="profile-form-input"
                      value={formData.pincode || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Action Bar */}
            <div className="profile-actions-bar">
              <button
                type="button"
                className="btn-profile-reset"
                onClick={() => setFormData(initialData)}
                disabled={submitting}
              >
                Reset Changes
              </button>

              <button
                type="submit"
                className="btn-profile-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <span>Saving...</span>
                ) : role === "admin" ? (
                  <span>Save Admin Changes</span>
                ) : (
                  <span>Submit Changes for Admin Approval</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          fontSize: "15px",
          color: "#64748b",
        }}
      >
        <span>Loading profile data...</span>
      </div>
    );
  }

  // Render within appropriate layout based on user role
  if (role === "admin") {
    return (
      <div className="admin-layout">
        <AdminSidebar activeNav="profile" />
        <main className="admin-main">
          <AdminHeader />
          {renderContent()}
        </main>
      </div>
    );
  }

  if (role === "teacher") {
    return (
      <div className="teacher-layout">
        <TeacherSidebar
          activeTab="profile"
          setActiveTab={(tab) => {
            if (tab === "profile") return;
            navigate(`/teacher/dashboard?tab=${tab}`);
          }}
          teacherProfile={roleData}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={() => {
            localStorage.clear();
            navigate("/login");
          }}
        />
        <div className="teacher-main-wrapper">
          <TeacherHeader
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            activeTab="profile"
            selectedDivision={roleData.assignedClass || "Class 10-A"}
            onDivisionChange={() => {}}
            selectedDate={new Date().toISOString().split("T")[0]}
            onDateChange={() => {}}
          />
          {renderContent()}
        </div>
      </div>
    );
  }

  // Student Layout
  return (
    <div className="portal student-portal">
      <StudentSidebar
        activeTab="profile"
        setActiveTab={(tab) => {
          if (tab === "profile") return;
          navigate(`/dashboard?tab=${tab}`);
        }}
        displayName={profileData?.user?.name || "Student"}
        displayClass={roleData.classDivision || "Class 10-A"}
        studentProfile={roleData}
        onOpenDossier={() => navigate("/dashboard")}
        handleLogout={() => {
          localStorage.clear();
          navigate("/login");
        }}
      />
      <div className="main portal-main student-main-wrapper">
        <StudentHeader
          activeTab="profile"
          displayClass={roleData.classDivision || "Class 10-A"}
          displayName={profileData?.user?.name || "Student"}
          onOpenDossier={() => navigate("/dashboard")}
          getInitials={(n) => (n || "S").slice(0, 2).toUpperCase()}
        />
        {renderContent()}
      </div>
    </div>
  );
}
