import { useState, useEffect, useMemo } from "react";
import api from "../../api/axiosclient";
import "../../Styles/AdminDash.css";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import TeacherStatsCards from "../../components/admin/teachers/TeacherStatsCards";
import TeacherAllotmentModal from "../../components/admin/teachers/TeacherAllotmentModal";
import TeacherDossierModal from "../../components/admin/teachers/TeacherDossierModal";
import TeacherFormModal from "../../components/admin/teachers/TeacherFormModal";

export default function TeachersRecords() {
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

  // Fetch Teachers & Cadre Stats
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
      console.error("Failed to load teachers records:", err);
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

  // Filter & Search Logic across 64 Cadre
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        t.name.toLowerCase().includes(q) ||
        t.pen.includes(q) ||
        (t.department && t.department.toLowerCase().includes(q)) ||
        (t.assignedClass && t.assignedClass.toLowerCase().includes(q)) ||
        (t.phone && t.phone.includes(q));

      let matchDept = true;
      if (selectedDept !== "All") {
        const deptClean = t.department.toLowerCase();
        const selClean = selectedDept.toLowerCase();

        if (selClean === "lower primary") {
          matchDept = deptClean.includes("lpsa") || deptClean.includes("primary") || deptClean.includes("lp");
        } else if (selClean === "upper primary") {
          matchDept = deptClean.includes("upsa") || deptClean.includes("up");
        } else if (selClean === "high school") {
          matchDept = deptClean.includes("hst") || deptClean.includes("high school");
        } else if (selClean === "higher secondary") {
          matchDept = deptClean.includes("hsst") || deptClean.includes("higher secondary") || deptClean.includes("plus two");
        } else {
          matchDept = deptClean.includes(selClean);
        }
      }

      return matchSearch && matchDept;
    });
  }, [teachers, searchQuery, selectedDept]);

  // Pagination Logic
  const totalFacultyCount = filteredTeachers.length;
  const totalPages = Math.ceil(totalFacultyCount / pageSize) || 1;
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTeachers.slice(start, start + pageSize);
  }, [filteredTeachers, currentPage]);

  // Modal Handlers
  const openAddTeacherModal = () => {
    setEditingTeacher(null);
    setActiveModalTab("general");
    setFormData({
      ...initialForm,
      pen: `849${Math.floor(200 + Math.random() * 800)}`,
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
      department: teacher.department || "",
      designation: teacher.designation || "HST",
      assignedClass: teacher.assignedClass || "",
      phone: teacher.phone || "",
      email: teacher.email || "",
      periods: teacher.periods || "",
      status: teacher.status || "Active",
      qualification: teacher.qualification || "",
      appointmentDate: teacher.appointmentDate || "",
      aadharNumber: teacher.aadharNumber || "",
      aadharDocUrl: teacher.aadharDocUrl || null,
      aadharDocFileName: teacher.aadharDocFileName || null,
      panNumber: teacher.panNumber || "",
      panDocUrl: teacher.panDocUrl || null,
      panDocFileName: teacher.panDocFileName || null,
      penAllotmentDocUrl: teacher.penAllotmentDocUrl || null,
      penAllotmentDocFileName: teacher.penAllotmentDocFileName || null,
      highestDegree: teacher.highestDegree || "Post Graduate (Master's)",
      pgDegreeName: teacher.pgDegreeName || "",
      pgCertificateUrl: teacher.pgCertificateUrl || null,
      pgCertificateFileName: teacher.pgCertificateFileName || null,
      ugDegreeName: teacher.ugDegreeName || "",
      ugCertificateUrl: teacher.ugCertificateUrl || null,
      ugCertificateFileName: teacher.ugCertificateFileName || null,
      bedCollege: teacher.bedCollege || "",
      bedCertificateUrl: teacher.bedCertificateUrl || null,
      bedCertificateFileName: teacher.bedCertificateFileName || null,
      eligibilityExam: teacher.eligibilityExam || "",
      eligibilityCertificateUrl: teacher.eligibilityCertificateUrl || null,
      eligibilityCertificateFileName: teacher.eligibilityCertificateFileName || null,
      experienceCertificateUrl: teacher.experienceCertificateUrl || null,
      experienceCertificateFileName: teacher.experienceCertificateFileName || null,
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

  // Upload handler for individual documents
  const handleDocumentUpload = async (e, urlKey, nameKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFeedback({
        type: "error",
        message: "File exceeds 10MB limit. Please upload a smaller document.",
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
          [nameKey]: res.data.fileName || file.name,
        }));
        setFeedback({
          type: "success",
          message: `${file.name} uploaded & attached successfully!`,
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "File upload failed.",
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
    if (!formData.name.trim() || !formData.pen.trim()) {
      setActiveModalTab("general");
      setFeedback({
        type: "error",
        message: "Faculty full name and Government PEN number are required.",
      });
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
            message: `Updated faculty ${formData.name}!`,
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
            message: `Registered faculty ${formData.name} successfully!`,
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
        message: err.response?.data?.message || "Failed to save record.",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!editingTeacher) return;
    if (
      !window.confirm(
        `Are you sure you want to remove ${editingTeacher.name} (PEN: ${editingTeacher.pen}) from staff register?`
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

  // CSV Export for Kerala Sampoorna Government Faculty Cadre
  const handleExportCSV = () => {
    if (!teachers.length) return;
    const headers = [
      "PEN Number",
      "Teacher Full Name",
      "Department / Cadre",
      "Assigned Class / Mentorship",
      "Contact Phone",
      "Periods / Week",
      "Duty Status",
      "Qualification",
      "Appointment Date",
      "Aadhaar Number",
      "Aadhaar Attached",
      "PAN Number",
      "PAN Attached",
      "B.Ed College",
      "B.Ed Attached",
      "Eligibility Exam",
      "SET / KTET Attached",
      "Documents Verified",
    ];
    const rows = teachers.map((t) => [
      t.pen,
      `"${t.name}"`,
      `"${t.department}"`,
      `"${t.assignedClass}"`,
      t.phone,
      `"${t.periods}"`,
      t.status,
      `"${t.qualification}"`,
      t.appointmentDate,
      `"${t.aadharNumber || "Pending"}"`,
      t.aadharDocUrl ? "Yes" : "No",
      `"${t.panNumber || "Pending"}"`,
      t.panDocUrl ? "Yes" : "No",
      `"${t.bedCollege || "N/A"}"`,
      t.bedCertificateUrl ? "Yes" : "No",
      `"${t.eligibilityExam || "N/A"}"`,
      t.eligibilityCertificateUrl ? "Yes" : "No",
      t.documentsVerified ? "Verified (Rule 12 KER)" : "Pending",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Sampoorna_Faculty_Cadre_Dossier_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-layout">
      {/* ---------------- SIDEBAR NAVIGATION ---------------- */}
      <AdminSidebar activeNav="teachers" />

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
      <div className="admin-main-wrapper">
        <AdminHeader />

        {/* Main Content Area */}
        <main className="admin-content-area">
          {/* Top 4 Summary Cards Grid */}
          <TeacherStatsCards stats={stats} />

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
      <TeacherFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingTeacher={editingTeacher}
        activeModalTab={activeModalTab}
        setActiveModalTab={setActiveModalTab}
        formData={formData}
        handleFormChange={handleFormChange}
        handleDocumentUpload={handleDocumentUpload}
        handleRemoveDocument={handleRemoveDocument}
        uploadingDoc={uploadingDoc}
        formSubmitting={formSubmitting}
        handleFormSubmit={handleFormSubmit}
        handleDeleteTeacher={handleDeleteTeacher}
        feedback={feedback}
      />

      {/* =========================================================================
          MODAL 2: VIEW ALLOTMENT & TIMETABLE
          ========================================================================= */}
      <TeacherAllotmentModal
        teacher={allotmentTeacher}
        onClose={() => setAllotmentTeacher(null)}
      />

      {/* =========================================================================
          MODAL 3: VIEW CREDENTIALS & DOCUMENTS DOSSIER
          ========================================================================= */}
      <TeacherDossierModal
        teacher={dossierTeacher}
        onClose={() => setDossierTeacher(null)}
      />
    </div>
  );
}
