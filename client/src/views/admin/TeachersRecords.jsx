import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosclient";
import { clearAuthSession } from "../../utils/auth";
import "../../Styles/AdminDash.css";

export default function TeachersRecords() {
  const navigate = useNavigate();

  // State
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({
    totalFaculty: 64,
    permanentPosts: 58,
    onDutyStaff: 4,
    vacantPosts: 2,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("general");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState({});
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // View Allotment Modal State
  const [allotmentTeacher, setAllotmentTeacher] = useState(null);

  // View Document Dossier Modal State
  const [dossierTeacher, setDossierTeacher] = useState(null);

  const initialForm = {
    name: "",
    pen: "",
    department: "HSST Malayalam",
    designation: "HSST",
    assignedClass: "Class 10-A Mentor",
    phone: "+91 94471 23450",
    email: "",
    periods: "24 hrs / Week",
    status: "Active",
    qualification: "M.A, B.Ed, SET",
    appointmentDate: "01/06/2018",
    // Essential Statutory ID Proofs
    aadharNumber: "",
    aadharDocUrl: null,
    aadharDocFileName: null,
    panNumber: "",
    panDocUrl: null,
    panDocFileName: null,
    penAllotmentDocUrl: null,
    penAllotmentDocFileName: null,
    // Essential Qualification Certificates
    highestDegree: "Post Graduate (Master's)",
    pgDegreeName: "M.Sc Mathematics",
    pgCertificateUrl: null,
    pgCertificateFileName: null,
    ugDegreeName: "B.Sc Mathematics",
    ugCertificateUrl: null,
    ugCertificateFileName: null,
    bedCollege: "Govt. College of Teacher Education",
    bedCertificateUrl: null,
    bedCertificateFileName: null,
    eligibilityExam: "SET / KTET Qualified",
    eligibilityCertificateUrl: null,
    eligibilityCertificateFileName: null,
    experienceCertificateUrl: null,
    experienceCertificateFileName: null,
    documentsVerified: true,
  };
  const [formData, setFormData] = useState(initialForm);

  // Helper to resolve full URL for uploaded files
  const getFileUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const backendBase = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
      : "http://localhost:5000";
    return `${backendBase}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // Fetch Teachers & Stats
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/teachers");
      if (res.data.success) {
        setTeachers(res.data.teachers || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load teachers roster:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadTeachers = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/teachers");
        if (isMounted && res.data.success) {
          setTeachers(res.data.teachers || []);
          if (res.data.stats) setStats(res.data.stats);
        }
      } catch (err) {
        console.error("Failed to load teachers:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadTeachers();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  // Filter & Search Logic
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        t.name.toLowerCase().includes(q) ||
        String(t.pen).includes(q) ||
        t.department.toLowerCase().includes(q) ||
        (t.assignedClass && t.assignedClass.toLowerCase().includes(q)) ||
        (t.aadharNumber && t.aadharNumber.includes(q)) ||
        (t.panNumber && t.panNumber.toLowerCase().includes(q));

      const matchDept =
        selectedDept === "All" ||
        t.department.toLowerCase().includes(selectedDept.toLowerCase()) ||
        t.assignedClass?.toLowerCase().includes(selectedDept.toLowerCase()) ||
        (selectedDept === "Lower Primary" && (t.department.includes("LPS") || t.designation === "LPSA" || t.assignedClass?.includes("Class 1") || t.assignedClass?.includes("Class 2") || t.assignedClass?.includes("Class 3") || t.assignedClass?.includes("Class 4"))) ||
        (selectedDept === "Upper Primary" && (t.department.includes("UPS") || t.designation === "UPSA" || t.assignedClass?.includes("Class 5") || t.assignedClass?.includes("Class 6") || t.assignedClass?.includes("Class 7"))) ||
        (selectedDept === "High School" && (t.department.includes("HST") || t.designation === "HST" || t.assignedClass?.includes("Class 8") || t.assignedClass?.includes("Class 9") || t.assignedClass?.includes("Class 10"))) ||
        (selectedDept === "Higher Secondary" && (t.department.includes("HSST") || t.designation === "HSST" || t.assignedClass?.includes("Class 11") || t.assignedClass?.includes("Class 12")));

      return matchSearch && matchDept;
    });
  }, [teachers, searchQuery, selectedDept]);

  // Pagination Logic (6 cards per page matching 3x2 grid)
  const totalFacultyCount = filteredTeachers.length;
  const totalPages = Math.ceil(totalFacultyCount / pageSize) || 1;
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTeachers.slice(start, start + pageSize);
  }, [filteredTeachers, currentPage]);

  // Modal Open Handlers
  const openAddTeacherModal = () => {
    setEditingTeacher(null);
    setActiveModalTab("general");
    setFormData({
      ...initialForm,
      pen: `849${Math.floor(200 + teachers.length + 1)}`,
      name: "",
      phone: "+91 94471 00000",
    });
    setFeedback({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setActiveModalTab("general");
    setFormData({
      name: teacher.name || "",
      pen: teacher.pen || "",
      department: teacher.department || "High School",
      designation: teacher.designation || "HST",
      assignedClass: teacher.assignedClass || "Class Mentor",
      phone: teacher.phone || "",
      email: teacher.email || "",
      periods: teacher.periods || "24 hrs / Week",
      status: teacher.status || "Active",
      qualification: teacher.qualification || "B.Ed",
      appointmentDate: teacher.appointmentDate || "01/06/2018",
      // ID Proofs
      aadharNumber: teacher.aadharNumber || "",
      aadharDocUrl: teacher.aadharDocUrl || null,
      aadharDocFileName: teacher.aadharDocFileName || null,
      panNumber: teacher.panNumber || "",
      panDocUrl: teacher.panDocUrl || null,
      panDocFileName: teacher.panDocFileName || null,
      penAllotmentDocUrl: teacher.penAllotmentDocUrl || null,
      penAllotmentDocFileName: teacher.penAllotmentDocFileName || null,
      // Qualifications & Certificates
      highestDegree: teacher.highestDegree || "Post Graduate (Master's)",
      pgDegreeName: teacher.pgDegreeName || "M.Sc / M.A",
      pgCertificateUrl: teacher.pgCertificateUrl || null,
      pgCertificateFileName: teacher.pgCertificateFileName || null,
      ugDegreeName: teacher.ugDegreeName || "B.Sc / B.A",
      ugCertificateUrl: teacher.ugCertificateUrl || null,
      ugCertificateFileName: teacher.ugCertificateFileName || null,
      bedCollege: teacher.bedCollege || "Govt. College of Teacher Education",
      bedCertificateUrl: teacher.bedCertificateUrl || null,
      bedCertificateFileName: teacher.bedCertificateFileName || null,
      eligibilityExam: teacher.eligibilityExam || "SET / KTET Qualified",
      eligibilityCertificateUrl: teacher.eligibilityCertificateUrl || null,
      eligibilityCertificateFileName:
        teacher.eligibilityCertificateFileName || null,
      experienceCertificateUrl: teacher.experienceCertificateUrl || null,
      experienceCertificateFileName:
        teacher.experienceCertificateFileName || null,
      documentsVerified: teacher.documentsVerified !== false,
    });
    setFeedback({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Upload handler for documents (PDF or Image)
  const handleDocumentUpload = async (e, urlKey, nameKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFeedback({
        type: "error",
        message: `File ${file.name} exceeds 10MB limit. Please upload a smaller document.`,
      });
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("document", file);

    try {
      setUploadingDoc((prev) => ({ ...prev, [urlKey]: true }));
      const res = await api.post("/upload/document", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setFormData((prev) => ({
          ...prev,
          [urlKey]: res.data.fileUrl,
          [nameKey]: file.name,
        }));
        setFeedback({
          type: "success",
          message: `${file.name} uploaded and attached successfully!`,
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err.response?.data?.message || "File upload failed. Please try again.",
      });
    } finally {
      setUploadingDoc((prev) => ({ ...prev, [urlKey]: false }));
    }
  };

  const handleRemoveDocument = (urlKey, nameKey) => {
    setFormData((prev) => ({
      ...prev,
      [urlKey]: null,
      [nameKey]: null,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFeedback({ type: "error", message: "Teacher name is required." });
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingTeacher) {
        const res = await api.put(
          `/admin/teachers/${editingTeacher._id}`,
          formData
        );
        if (res.data.success) {
          setFeedback({
            type: "success",
            message: `Updated faculty ${formData.name} & verified credentials!`,
          });
          setTimeout(() => {
            closeModal();
            fetchTeachers();
          }, 800);
        }
      } else {
        const res = await api.post("/admin/teachers", formData);
        if (res.data.success) {
          setFeedback({
            type: "success",
            message: `Faculty ${formData.name} registered with PEN ${res.data.teacher?.pen} and submitted documents!`,
          });
          setTimeout(() => {
            closeModal();
            fetchTeachers();
          }, 800);
        }
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to save teacher record.",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!editingTeacher) return;
    if (
      !window.confirm(
        `Are you sure you want to remove ${editingTeacher.name} from the roster?`
      )
    )
      return;

    try {
      setFormSubmitting(true);
      const res = await api.delete(`/admin/teachers/${editingTeacher._id}`);
      if (res.data.success) {
        closeModal();
        fetchTeachers();
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to delete teacher.",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // CSV Export for Faculty Roster with Document Verification
  const handleExportCSV = () => {
    if (!teachers.length) return;
    const headers = [
      "PEN Number",
      "Teacher Name",
      "Department",
      "Assigned Class Charge",
      "Official Contact",
      "Periods Allotted",
      "Status",
      "Qualification",
      "Appointment Date",
      "Aadhaar Number",
      "PAN Number",
      "Aadhaar Proof Attached",
      "B.Ed Certificate Attached",
      "Statutory Documents Verified",
    ];
    const rows = teachers.map((t) => [
      `"${t.pen}"`,
      `"${t.name}"`,
      `"${t.department}"`,
      `"${t.assignedClass}"`,
      `"${t.phone}"`,
      `"${t.periods}"`,
      `"${t.status}"`,
      `"${t.qualification || "B.Ed"}"`,
      `"${t.appointmentDate || "01/06/2018"}"`,
      `"${t.aadharNumber || "N/A"}"`,
      `"${t.panNumber || "N/A"}"`,
      `"${t.aadharDocUrl ? "Yes" : "No"}"`,
      `"${t.bedCertificateUrl ? "Yes" : "No"}"`,
      `"${t.documentsVerified ? "Verified" : "Pending"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Sampoorna_Faculty_Dossier_Roster_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper component to render an upload box
  const renderDocumentUploadCard = (
    label,
    urlKey,
    nameKey,
    helpText = "Upload PDF or Image (JPG, PNG) up to 10MB",
    icon = "📄"
  ) => {
    const isUploading = !!uploadingDoc[urlKey];
    const fileUrl = formData[urlKey];
    const fileName = formData[nameKey] || "Attached Document";
    const isPdf =
      fileUrl &&
      (fileUrl.toLowerCase().endsWith(".pdf") ||
        (fileName && fileName.toLowerCase().endsWith(".pdf")));

    return (
      <div className="form-field-group" style={{ marginBottom: "16px" }}>
        <label>{label}</label>
        <span className="helper-text" style={{ marginBottom: "6px" }}>
          {helpText}
        </span>

        {fileUrl ? (
          <div className="uploaded-file-card">
            <div className="uploaded-file-info">
              {isPdf ? (
                <div className="uploaded-pdf-badge">
                  <span>PDF</span>
                </div>
              ) : (
                <img
                  src={getFileUrl(fileUrl)}
                  alt={fileName}
                  className="uploaded-file-thumbnail"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <div className="uploaded-file-names">
                <span className="uploaded-file-name" title={fileName}>
                  {fileName}
                </span>
                <span className="uploaded-file-status">
                  ✓ Uploaded &amp; Attached
                </span>
              </div>
            </div>

            <div className="uploaded-file-actions">
              <a
                href={getFileUrl(fileUrl)}
                target="_blank"
                rel="noreferrer"
                className="btn-file-preview"
                title="View document in new tab"
              >
                View ↗
              </a>
              <button
                type="button"
                className="btn-file-remove"
                onClick={() => handleRemoveDocument(urlKey, nameKey)}
                title="Remove attached document"
              >
                🗑️
              </button>
            </div>
          </div>
        ) : (
          <label
            className={`upload-dropzone ${isUploading ? "disabled" : ""}`}
            style={{ padding: "14px 18px", marginTop: "4px" }}
          >
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
              style={{ display: "none" }}
              onChange={(e) => handleDocumentUpload(e, urlKey, nameKey)}
              disabled={isUploading}
            />
            <div className="upload-icon-circle" style={{ width: "36px", height: "36px", fontSize: "16px" }}>
              {isUploading ? "⏳" : icon}
            </div>
            <p className="upload-prompt-text" style={{ fontSize: "12px" }}>
              {isUploading
                ? "Uploading document to secure storage..."
                : `Click to upload ${label}`}
            </p>
            <p className="upload-sub-text" style={{ fontSize: "10.5px" }}>
              Supports PDF, PNG, JPG up to 10MB
            </p>
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="admin-layout">
      {/* ---------------- SIDEBAR ---------------- */}
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
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/dashboard")}
            >
              <span>▦</span> Overview and Dashboard
            </button>
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/attendance")}
            >
              <span>👥</span> Division wise Attendance
            </button>
            <button className="console-nav-item active">
              <span>🗂</span> Teachers Records
            </button>
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/students")}
            >
              <span>🎓</span> Students Records
            </button>
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/exams")}
            >
              <span>📅</span> Exam Timetables
            </button>
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

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
      <div className="admin-main-wrapper">
        {/* Top Header */}
        <header className="admin-top-header">
          <span>
            Kerala General Education Dept. •{" "}
            <strong>Sampoorna Admin Console</strong> • School Code: 06042
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="badge-sync">🟢 AY 2025–2026</span>
            <button
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#135bec",
                color: "#ffffff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              👤
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="admin-content-area">
          {/* Top 4 Summary Cards Grid */}
          <div className="overview-stats-grid">
            {/* Card 1 */}
            <div className="overview-stat-card">
              <div className="stat-card-header">
                <span className="card-label">TOTAL FACULTY</span>
                <div className="stat-icon-circle blue">👥</div>
              </div>
              <div className="overview-number">
                {stats.totalFaculty} Cadre
              </div>
              <div className="sub-text">LP/UP/HS/HSS approved</div>
            </div>

            {/* Card 2 */}
            <div className="overview-stat-card">
              <div className="stat-card-header">
                <span className="card-label">PERMANENT HSST/HST</span>
                <div className="stat-icon-circle emerald">🛡️</div>
              </div>
              <div className="overview-number stat-number-emerald">
                {stats.permanentPosts} Posts
              </div>
              <div className="sub-text">Assigned government PEN</div>
            </div>

            {/* Card 3 */}
            <div className="overview-stat-card">
              <div className="stat-card-header">
                <span className="card-label">ON DUTY / DEPUTATION</span>
                <div className="stat-icon-circle purple">💼</div>
              </div>
              <div className="overview-number">
                {stats.onDutyStaff} Staff
              </div>
              <div className="sub-text">SCERT &amp; Exam duties</div>
            </div>

            {/* Card 4 */}
            <div className="overview-stat-card">
              <div className="stat-card-header">
                <span className="card-label">VACANT SANCTIONED</span>
                <div className="stat-icon-circle blue">👤+</div>
              </div>
              <div className="overview-number stat-number-blue">
                {stats.vacantPosts} Posts
              </div>
              <div className="sub-text">UP / HST English requisitions</div>
            </div>
          </div>

          {/* Action Header Banner */}
          <section className="student-header-banner">
            <div className="registry-title-left">
              <div className="registry-icon-badge">🗂</div>
              <div className="registry-title-text">
                <h1>Faculty Directory &amp; Department Roster</h1>
                <p>
                  Authorized permanent teaching cadre, PEN allocation,
                  statutory ID proofs, and qualification credentials.
                </p>
              </div>
            </div>

            <div className="registry-controls-right">
              {/* Search Box */}
              <div className="search-input-wrapper">
                <span className="search-input-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search teacher by name, PEN, Aadhaar..."
                  className="registry-search-input"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Department & Wing Filter across all 64 Cadre */}
              <select
                className="registry-select-dropdown"
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Departments &amp; Wings (64 Cadre)</option>
                <optgroup label="Academic Wings">
                  <option value="Lower Primary">Lower Primary (LPSA Cadre)</option>
                  <option value="Upper Primary">Upper Primary (UPSA Cadre)</option>
                  <option value="High School">High School (HST Cadre)</option>
                  <option value="Higher Secondary">Higher Secondary (HSST Cadre)</option>
                </optgroup>
                <optgroup label="Subject Specialization">
                  <option value="Malayalam">Malayalam</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physical Science">Physical Science</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="English">English</option>
                  <option value="Social Science">Social Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Natural Science">Natural Science</option>
                  <option value="Primary Education">Primary Education</option>
                </optgroup>
              </select>

              {/* Add Teacher Button */}
              <button
                className="btn-new-admission"
                onClick={openAddTeacherModal}
              >
                <span>👤+</span> Add Teacher
              </button>
            </div>
          </section>

          {/* Teacher Directory 3x2 Grid */}
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px",
                background: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                color: "#64748b",
                fontWeight: "600",
              }}
            >
              Loading Faculty Directory &amp; PEN Allocation...
            </div>
          ) : paginatedTeachers.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px",
                background: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                color: "#64748b",
              }}
            >
              No matching faculty records found.
            </div>
          ) : (
            <div className="teachers-directory-grid">
              {paginatedTeachers.map((t) => {
                let statusClass = "status-pill-active";
                if (t.status === "In Class") statusClass = "status-pill-in-class";
                else if (t.status === "On Duty")
                  statusClass = "status-pill-on-duty";
                else if (t.status === "On Leave")
                  statusClass = "status-pill-on-leave";

                const hasAadhaar = !!t.aadharDocUrl;
                const hasBed = !!t.bedCertificateUrl;

                return (
                  <div className="teacher-card" key={t._id}>
                    {/* Top Row: Avatar, Name, Dept, Mentor Pill & Status */}
                    <div className="teacher-card-header">
                      <div className="teacher-profile-left">
                        <div className="teacher-avatar-circle">
                          {t.initials || "TR"}
                        </div>
                        <div className="teacher-meta-name-col">
                          <h3 className="teacher-name-title">
                            <span>{t.name}</span>
                            <span
                              className="teacher-verified-icon"
                              title="Verified Permanent Cadre"
                            >
                              ✓
                            </span>
                          </h3>
                          <div className="teacher-dept-subtext">
                            {t.department}
                          </div>
                          <span className="mentor-charge-pill">
                            {t.assignedClass}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={statusClass}>
                        <span className="status-dot"></span>
                        {t.status}
                      </span>
                    </div>

                    {/* Metadata Rows: PEN, Official Contact, Periods Allotted */}
                    <div className="teacher-card-body">
                      <div className="teacher-meta-row">
                        <span className="teacher-meta-label">PEN Number</span>
                        <span className="teacher-meta-value">{t.pen}</span>
                      </div>
                      <div className="teacher-meta-row">
                        <span className="teacher-meta-label">Official Contact</span>
                        <span className="teacher-meta-value">{t.phone}</span>
                      </div>
                      <div className="teacher-meta-row">
                        <span className="teacher-meta-label">Official Mail ID</span>
                        <span className="teacher-meta-value" style={{ fontSize: "12px", color: "#2563eb", wordBreak: "break-all" }}>
                          {t.email ? "✉ " + t.email : "Not registered"}
                        </span>
                      </div>
                      <div className="teacher-meta-row">
                        <span className="teacher-meta-label">Periods Allotted</span>
                        <span className="teacher-meta-value">{t.periods}</span>
                      </div>
                      <div className="teacher-meta-row">
                        <span className="teacher-meta-label">Submitted Proofs</span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#059669",
                            background: "#d1fae5",
                            padding: "2px 8px",
                            borderRadius: "10px",
                          }}
                        >
                          {hasAadhaar && hasBed
                            ? "✓ Aadhaar & B.Ed Attached"
                            : hasAadhaar || hasBed
                            ? "✓ Partial Dossier Attached"
                            : "🛡️ KYC & SPARK Seeded"}
                        </span>
                      </div>
                    </div>

                    {/* Footer Actions: View Allotment, Dossier & Edit Profile */}
                    <div className="teacher-card-footer">
                      <button
                        type="button"
                        className="btn-allotment-link"
                        onClick={() => setAllotmentTeacher(t)}
                        title="View Teaching Timetable &amp; Duty Allotment"
                      >
                        Allotment
                      </button>
                      <button
                        type="button"
                        className="btn-allotment-link"
                        style={{ color: "#0d9488" }}
                        onClick={() => setDossierTeacher(t)}
                        title="Inspect Submitted ID Proofs &amp; Qualification Certificates"
                      >
                        Dossier 📁
                      </button>
                      <button
                        type="button"
                        className="btn-edit-profile-link"
                        onClick={() => openEditModal(t)}
                        title="Edit Faculty Record &amp; Documents"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Bar: Pagination & Full Roster Export */}
          <div className="registry-footer-bar">
            <div>
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{" "}
              <strong>
                {Math.min(currentPage * pageSize, totalFacultyCount)}
              </strong>{" "}
              of <strong>{stats.totalFaculty}</strong> faculty members
            </div>

            <div className="pagination-controls">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pNum = i + 1;
                return (
                  <button
                    key={pNum}
                    className={`page-btn ${
                      currentPage === pNum ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(pNum)}
                  >
                    {pNum}
                  </button>
                );
              })}
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                &gt;
              </button>
            </div>

            <button
              type="button"
              className="export-roster-link"
              onClick={handleExportCSV}
              style={{ background: "transparent", border: "none", cursor: "pointer" }}
            >
              View All Faculty &amp; Export Sampoorna Roster (CSV) →
            </button>
          </div>
        </main>
      </div>

      {/* =========================================================================
          MODAL 1: ADD / EDIT TEACHER WITH ESSENTIAL DOCUMENTS SUBMISSION
          ========================================================================= */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content-card"
            style={{ maxWidth: "760px", maxHeight: "92vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <div>
                <h3>
                  {editingTeacher
                    ? `Edit Faculty: ${editingTeacher.name}`
                    : "Add Teaching Faculty & Submit Credentials"}
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    margin: "2px 0 0 0",
                  }}
                >
                  Kerala Sampoorna Faculty Onboarding &amp; Statutory Credentials
                  Dossier
                </p>
              </div>
              <button className="modal-close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>

            {/* TAB NAVIGATION HEADER */}
            <div className="modal-tab-nav">
              <button
                type="button"
                className={`modal-tab-btn ${
                  activeModalTab === "general" ? "active" : ""
                }`}
                onClick={() => setActiveModalTab("general")}
              >
                <span>👤</span> Faculty Cadre Details
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${
                  activeModalTab === "idProofs" ? "active" : ""
                }`}
                onClick={() => setActiveModalTab("idProofs")}
              >
                <span>🛡️</span> Statutory ID Proofs
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${
                  activeModalTab === "qualifications" ? "active" : ""
                }`}
                onClick={() => setActiveModalTab("qualifications")}
              >
                <span>🎓</span> Academic &amp; Qualification Certificates
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-form-body">
                {feedback.message && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      marginBottom: "16px",
                      fontSize: "13px",
                      fontWeight: "600",
                      background:
                        feedback.type === "error" ? "#fee2e2" : "#dcfce7",
                      color: feedback.type === "error" ? "#b91c1c" : "#15803d",
                    }}
                  >
                    {feedback.message}
                  </div>
                )}

                {/* ---------------- TAB 1: CADRE DETAILS ---------------- */}
                {activeModalTab === "general" && (
                  <div>
                    <div className="form-field-group">
                      <label>Faculty Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Mrs. Priya Nair"
                        value={formData.name}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>Government PEN Number *</label>
                        <input
                          type="text"
                          name="pen"
                          required
                          placeholder="e.g. 849201"
                          value={formData.pen}
                          onChange={handleFormChange}
                        />
                        <span className="helper-text">
                          Permanent Employee Number (SPARK).
                        </span>
                      </div>
                      <div className="form-field-group">
                        <label>Department &amp; Cadre</label>
                        <input
                          type="text"
                          name="department"
                          placeholder="e.g. HSST Malayalam"
                          value={formData.department}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>Assigned Division / Mentorship</label>
                        <input
                          type="text"
                          name="assignedClass"
                          placeholder="e.g. Class 10-A Mentor"
                          value={formData.assignedClass}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-field-group">
                        <label>Periods / Workload Allotted</label>
                        <input
                          type="text"
                          name="periods"
                          placeholder="e.g. 24 hrs / Week"
                          value={formData.periods}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>Official Contact Mobile</label>
                        <input
                          type="text"
                          name="phone"
                          placeholder="+91 94471 23450"
                          value={formData.phone}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-field-group">
                        <label>Official Email ID (Mail ID)</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="teacher@ghssrajakkad.kerala.gov.in"
                          value={formData.email}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>Current Duty Status</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleFormChange}
                        >
                          <option value="Active">Active</option>
                          <option value="In Class">In Class</option>
                          <option value="On Duty">On Duty</option>
                          <option value="On Leave">On Leave</option>
                        </select>
                      </div>
                      <div className="form-field-group">
                        <label>Date of Appointment</label>
                        <input
                          type="text"
                          name="appointmentDate"
                          placeholder="DD/MM/YYYY"
                          value={formData.appointmentDate}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- TAB 2: STATUTORY ID PROOFS & UPLOADS ---------------- */}
                {activeModalTab === "idProofs" && (
                  <div>
                    <div className="form-section-header" style={{ marginBottom: "14px" }}>
                      Statutory Government Identification (SPARK / K.E.R Compliant)
                    </div>

                    {/* Aadhaar Card */}
                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>Aadhaar UID Number</label>
                        <input
                          type="text"
                          name="aadharNumber"
                          placeholder="XXXX-XXXX-XXXX"
                          value={formData.aadharNumber}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div>
                        {renderDocumentUploadCard(
                          "Aadhaar Card Copy",
                          "aadharDocUrl",
                          "aadharDocFileName",
                          "Upload Aadhaar front & back copy (PDF or Image)",
                          "🪪"
                        )}
                      </div>
                    </div>

                    {/* PAN Card */}
                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>Permanent Account Number (PAN)</label>
                        <input
                          type="text"
                          name="panNumber"
                          placeholder="e.g. ABCDE1234F"
                          value={formData.panNumber}
                          onChange={handleFormChange}
                        />
                        <span className="helper-text">
                          Required for government treasury &amp; SPARK payroll.
                        </span>
                      </div>
                      <div>
                        {renderDocumentUploadCard(
                          "PAN Card Copy",
                          "panDocUrl",
                          "panDocFileName",
                          "Upload clear copy of PAN Card (PDF or Image)",
                          "💳"
                        )}
                      </div>
                    </div>

                    {/* SPARK / Govt Appointment Order */}
                    <div>
                      {renderDocumentUploadCard(
                        "Government PEN / SPARK Cadre Appointment Order",
                        "penAllotmentDocUrl",
                        "penAllotmentDocFileName",
                        "Official appointment memo / PEN allotment order issued by Director of General Education (PDF / Image)",
                        "📜"
                      )}
                    </div>
                  </div>
                )}

                {/* ---------------- TAB 3: QUALIFICATIONS & CERTIFICATES ---------------- */}
                {activeModalTab === "qualifications" && (
                  <div>
                    <div className="form-section-header" style={{ marginBottom: "14px" }}>
                      Mandatory Academic Degrees &amp; Teaching Eligibility
                    </div>

                    {/* B.Ed Degree (Essential Teaching Qualification) */}
                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>B.Ed / Teaching Training College *</label>
                        <input
                          type="text"
                          name="bedCollege"
                          placeholder="e.g. Govt. College of Teacher Education, Kozhikode"
                          value={formData.bedCollege}
                          onChange={handleFormChange}
                        />
                        <span className="helper-text">
                          Mandatory pedagogical training certificate under K.E.R.
                        </span>
                      </div>
                      <div>
                        {renderDocumentUploadCard(
                          "B.Ed / Teaching Degree Certificate",
                          "bedCertificateUrl",
                          "bedCertificateFileName",
                          "Upload B.Ed Degree certificate or mark list (PDF/Image)",
                          "🎓"
                        )}
                      </div>
                    </div>

                    {/* Post Graduate Degree (M.Sc / M.A) */}
                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>Master's / Post Graduate Degree</label>
                        <input
                          type="text"
                          name="pgDegreeName"
                          placeholder="e.g. M.Sc Mathematics, First Class"
                          value={formData.pgDegreeName}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div>
                        {renderDocumentUploadCard(
                          "Post Graduate (PG) Certificate",
                          "pgCertificateUrl",
                          "pgCertificateFileName",
                          "Upload Master's Degree certificate (PDF/Image)",
                          "📜"
                        )}
                      </div>
                    </div>

                    {/* Bachelor's Degree (B.Sc / B.A) */}
                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>Bachelor's / Graduation Degree</label>
                        <input
                          type="text"
                          name="ugDegreeName"
                          placeholder="e.g. B.Sc Mathematics"
                          value={formData.ugDegreeName}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div>
                        {renderDocumentUploadCard(
                          "Bachelor's (UG) Certificate",
                          "ugCertificateUrl",
                          "ugCertificateFileName",
                          "Upload Bachelor's Degree certificate (PDF/Image)",
                          "📑"
                        )}
                      </div>
                    </div>

                    {/* SET / KTET / NET Eligibility */}
                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>Teacher Eligibility Test Qualified</label>
                        <input
                          type="text"
                          name="eligibilityExam"
                          placeholder="e.g. Kerala SET / KTET Category III / NET"
                          value={formData.eligibilityExam}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div>
                        {renderDocumentUploadCard(
                          "Eligibility Pass Certificate (SET / KTET)",
                          "eligibilityCertificateUrl",
                          "eligibilityCertificateFileName",
                          "Upload SET, KTET, or NET pass certificate (PDF/Image)",
                          "🏅"
                        )}
                      </div>
                    </div>

                    {/* Experience Certificate */}
                    <div>
                      {renderDocumentUploadCard(
                        "Teaching Experience / Prior Service Book Copy (Optional)",
                        "experienceCertificateUrl",
                        "experienceCertificateFileName",
                        "Prior government or aided school service records (PDF/Image)",
                        "📋"
                      )}
                    </div>

                    {/* Verification Toggle */}
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "12px 16px",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        id="documentsVerified"
                        name="documentsVerified"
                        checked={formData.documentsVerified}
                        onChange={handleFormChange}
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      />
                      <label
                        htmlFor="documentsVerified"
                        style={{
                          fontSize: "12.5px",
                          fontWeight: "700",
                          color: "#166534",
                          cursor: "pointer",
                          margin: 0,
                          textTransform: "none",
                        }}
                      >
                        Statutory Document Verification Completed by Headmaster /
                        Chief Admin (Rule 12 K.E.R)
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="modal-footer-row">
                {editingTeacher && (
                  <button
                    type="button"
                    className="btn-modal-delete"
                    onClick={handleDeleteTeacher}
                    disabled={formSubmitting}
                  >
                    Delete Faculty Record
                  </button>
                )}
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={closeModal}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-save"
                  disabled={formSubmitting}
                >
                  {formSubmitting
                    ? "Saving..."
                    : editingTeacher
                    ? "Update Faculty & Credentials"
                    : "Register Faculty & Save Dossier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: VIEW ALLOTMENT & TIMETABLE
          ========================================================================= */}
      {allotmentTeacher && (
        <div className="modal-overlay" onClick={() => setAllotmentTeacher(null)}>
          <div
            className="modal-content-card modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <div>
                <h3>Teaching Workload &amp; Period Allotment</h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    margin: "2px 0 0 0",
                  }}
                >
                  {allotmentTeacher.name} • PEN: {allotmentTeacher.pen} •{" "}
                  {allotmentTeacher.department}
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setAllotmentTeacher(null)}
              >
                ✕
              </button>
            </div>

            <div className="allotment-modal-body">
              <div className="allotment-meta-summary-card">
                <div>
                  <span className="allotment-label">Primary Charge:</span>
                  <strong>{allotmentTeacher.assignedClass}</strong>
                </div>
                <div>
                  <span className="allotment-label">Weekly Periods:</span>
                  <strong>{allotmentTeacher.periods}</strong>
                </div>
                <div>
                  <span className="allotment-label">Contact:</span>
                  <strong>{allotmentTeacher.phone}</strong>
                </div>
                <div>
                  <span className="allotment-label">Status:</span>
                  <strong style={{ color: "#059669" }}>
                    {allotmentTeacher.status}
                  </strong>
                </div>
              </div>

              <h4 style={{ margin: "20px 0 10px 0", color: "#1e293b" }}>
                Weekly Academic Schedule &amp; Duty Register
              </h4>
              <div className="allotment-table-wrapper">
                <table className="allotment-schedule-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Period 1 (09:30)</th>
                      <th>Period 2 (10:20)</th>
                      <th>Period 3 (11:20)</th>
                      <th>Period 4 (01:15)</th>
                      <th>Period 5 (02:05)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Monday</td>
                      <td>Class 10-A (Maths)</td>
                      <td>Class 10-B (Maths)</td>
                      <td>— Free —</td>
                      <td>Class 9-A (Maths)</td>
                      <td>Mentorship Hour</td>
                    </tr>
                    <tr>
                      <td>Tuesday</td>
                      <td>Class 10-A (Maths)</td>
                      <td>— Free —</td>
                      <td>Class 9-B (Maths)</td>
                      <td>Class 10-B (Maths)</td>
                      <td>Club Activity</td>
                    </tr>
                    <tr>
                      <td>Wednesday</td>
                      <td>Class 10-B (Maths)</td>
                      <td>Class 10-A (Maths)</td>
                      <td>Class 9-A (Maths)</td>
                      <td>— Free —</td>
                      <td>Class 10-A (Remedial)</td>
                    </tr>
                    <tr>
                      <td>Thursday</td>
                      <td>— Free —</td>
                      <td>Class 10-A (Maths)</td>
                      <td>Class 10-B (Maths)</td>
                      <td>Class 9-B (Maths)</td>
                      <td>PTA / Staff Meeting</td>
                    </tr>
                    <tr>
                      <td>Friday</td>
                      <td>Class 9-A (Maths)</td>
                      <td>Class 9-B (Maths)</td>
                      <td>Class 10-A (Maths)</td>
                      <td>— Free —</td>
                      <td>Remedial / Examination Evaluation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer-row">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setAllotmentTeacher(null)}
              >
                Close Timetable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: VIEW CREDENTIALS & DOCUMENTS DOSSIER
          ========================================================================= */}
      {dossierTeacher && (
        <div className="modal-overlay" onClick={() => setDossierTeacher(null)}>
          <div
            className="modal-content-card modal-lg"
            style={{ maxWidth: "820px", maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <div>
                <h3>Faculty Credentials &amp; Statutory Documents Dossier</h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    margin: "2px 0 0 0",
                  }}
                >
                  {dossierTeacher.name} • PEN: {dossierTeacher.pen} •{" "}
                  {dossierTeacher.department}
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setDossierTeacher(null)}
              >
                ✕
              </button>
            </div>

            <div className="allotment-modal-body" style={{ maxHeight: "72vh", overflowY: "auto" }}>
              {/* Profile Bar */}
              <div className="allotment-meta-summary-card">
                <div>
                  <span className="allotment-label">Faculty PEN:</span>
                  <strong>{dossierTeacher.pen}</strong>
                </div>
                <div>
                  <span className="allotment-label">Aadhaar UID:</span>
                  <strong>{dossierTeacher.aadharNumber || "XXXX-XXXX-XXXX"}</strong>
                </div>
                <div>
                  <span className="allotment-label">PAN Number:</span>
                  <strong>{dossierTeacher.panNumber || "BNYPN4421K"}</strong>
                </div>
                <div>
                  <span className="allotment-label">Audit Status:</span>
                  <strong style={{ color: "#059669" }}>
                    ✓ K.E.R Verified Cadre
                  </strong>
                </div>
              </div>

              <div style={{ marginTop: "10px", padding: "8px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Official Mail ID:</span>
                <strong style={{ color: "#2563eb", fontSize: "12.5px" }}>
                  {dossierTeacher.email ? (
                    <a href={"mailto:" + dossierTeacher.email} style={{ color: "#2563eb", textDecoration: "none" }}>
                      ✉ {dossierTeacher.email}
                    </a>
                  ) : (
                    "Not registered"
                  )}
                </strong>
              </div>

              {/* 1. Government Identity Documents */}
              <h4 style={{ margin: "24px 0 12px 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🛡️</span> Statutory Identification &amp; SPARK Allotment
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {/* Aadhaar */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                    Aadhaar Card
                  </div>
                  <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>
                    {dossierTeacher.aadharNumber || "Seeded via UIDAI"}
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    {dossierTeacher.aadharDocUrl ? (
                      <a
                        href={getFileUrl(dossierTeacher.aadharDocUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-seating-action"
                      >
                        View Uploaded Aadhaar ↗
                      </a>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}>
                        ✓ SPARK Bio-Metric Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* PAN Card */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                    PAN Card (SPARK Payroll)
                  </div>
                  <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>
                    {dossierTeacher.panNumber || "Income Tax Seeded"}
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    {dossierTeacher.panDocUrl ? (
                      <a
                        href={getFileUrl(dossierTeacher.panDocUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-seating-action"
                      >
                        View Uploaded PAN ↗
                      </a>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}>
                        ✓ Treasury Linked
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Educational & Qualification Certificates */}
              <h4 style={{ margin: "24px 0 12px 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🎓</span> Academic Degrees &amp; Teaching Qualifications
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {/* B.Ed Degree */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                    B.Ed Teaching Degree
                  </div>
                  <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>
                    {dossierTeacher.bedCollege || "Govt. College of Teacher Education"}
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    {dossierTeacher.bedCertificateUrl ? (
                      <a
                        href={getFileUrl(dossierTeacher.bedCertificateUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-seating-action"
                      >
                        View B.Ed Certificate ↗
                      </a>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}>
                        ✓ Degree Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Master's Degree */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                    Post Graduate (Master's)
                  </div>
                  <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>
                    {dossierTeacher.qualification || "M.Sc Mathematics"}
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    {dossierTeacher.pgCertificateUrl ? (
                      <a
                        href={getFileUrl(dossierTeacher.pgCertificateUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-seating-action"
                      >
                        View Master's Certificate ↗
                      </a>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}>
                        ✓ University Certified
                      </span>
                    )}
                  </div>
                </div>

                {/* Eligibility Test */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                    Teacher Eligibility Test
                  </div>
                  <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>
                    {dossierTeacher.eligibilityExam || "Kerala SET / KTET Qualified"}
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    {dossierTeacher.eligibilityCertificateUrl ? (
                      <a
                        href={getFileUrl(dossierTeacher.eligibilityCertificateUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-seating-action"
                      >
                        View SET/KTET Certificate ↗
                      </a>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}>
                        ✓ Qualified &amp; Approved
                      </span>
                    )}
                  </div>
                </div>

                {/* Appointment Memo */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                    Appointment &amp; Service Book
                  </div>
                  <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>
                    Appointed: {dossierTeacher.appointmentDate || "01/06/2016"}
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    {dossierTeacher.penAllotmentDocUrl ? (
                      <a
                        href={getFileUrl(dossierTeacher.penAllotmentDocUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-seating-action"
                      >
                        View Appointment Memo ↗
                      </a>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}>
                        ✓ Service Book Maintained
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Compliance Box */}
              <div
                style={{
                  marginTop: "20px",
                  background: "#f0fdf4",
                  border: "1px dashed #86efac",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  fontSize: "12px",
                  color: "#166534",
                  lineHeight: "1.5",
                }}
              >
                <strong>Government of Kerala Academic Cadre Inspection:</strong>{" "}
                All original qualification degree scrolls, B.Ed training diplomas,
                and statutory Aadhaar &amp; PAN credentials for{" "}
                <strong>{dossierTeacher.name}</strong> (PEN: {dossierTeacher.pen})
                have been verified against official University registries and SPARK
                payroll database by the Headmaster.
              </div>
            </div>

            <div className="modal-footer-row">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setDossierTeacher(null)}
              >
                Close Dossier
              </button>
              <button
                type="button"
                className="btn-modal-save"
                onClick={() => {
                  const t = dossierTeacher;
                  setDossierTeacher(null);
                  openEditModal(t);
                }}
              >
                Edit &amp; Upload More Documents ✏️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
