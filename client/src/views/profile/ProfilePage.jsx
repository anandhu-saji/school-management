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
import ProfileHeroCard from "./components/ProfileHeroCard";
import ProfileAvatarCard from "./components/ProfileAvatarCard";
import ProfilePendingRequestBanner from "./components/ProfilePendingRequestBanner";
import ProfileFormFields from "./components/ProfileFormFields";
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
      <ProfileHeroCard
        role={role}
        roleData={roleData}
        profileData={profileData}
        feedback={feedback}
        setFeedback={setFeedback}
        notifications={notifications}
        handleDismissNotification={handleDismissNotification}
      />

      {/* Active Pending Request Banner with Differences */}
      <ProfilePendingRequestBanner
        pendingReq={pendingReq}
        getFieldLabel={getFieldLabel}
      />

      {/* Main Grid: Left Column + Right Details Form */}
      <div className="profile-layout-grid">
        <ProfileAvatarCard
          fileInputRef={fileInputRef}
          handleAvatarFileChange={handleAvatarFileChange}
          avatarDisplayUrl={avatarDisplayUrl}
          initials={initials}
          uploadingAvatar={uploadingAvatar}
          profileData={profileData}
          role={role}
          roleData={roleData}
        />

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

            <ProfileFormFields
              formData={formData}
              handleInputChange={handleInputChange}
              role={role}
            />

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
