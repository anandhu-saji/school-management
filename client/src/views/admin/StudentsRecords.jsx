import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosclient";
import { clearAuthSession } from "../../utils/auth";
import "../../Styles/AdminDash.css";
import { ACADEMIC_WINGS } from "../../utils/classData";

export default function StudentsRecords() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const bcFileInputRef = useRef(null);

  // State
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 1248,
    boysCount: 612,
    girlsCount: 636,
    class10Candidates: 242,
    plusTwoCount: 468,
    sampoornaVerified: "100%",
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("personal");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [uploadingIdProof, setUploadingIdProof] = useState(false);
  const [uploadingBcProof, setUploadingBcProof] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Dossier View Modal State
  const [dossierStudent, setDossierStudent] = useState(null);

  const initialForm = {
    name: "",
    email: "",
    rollNumber: "",
    admissionNumber: "",
    sampoornaId: "",
    division: "10-A",
    gender: "Male",
    category: "General",
    dob: "2010-05-14",
    bloodGroup: "O+",
    religion: "Hindu",
    caste: "",
    // Essential Statutory ID Proofs & Uploaded Files
    aadhaarNumber: "",
    birthCertificateNumber: "",
    idProofUrl: "",
    idProofType: "Aadhaar Card",
    idProofFileName: "",
    idProofFileType: "",
    birthCertificateUrl: "",
    birthCertificateFileName: "",
    identificationMarks: "",
    // Parent & Guardian Details
    fatherName: "",
    motherName: "",
    guardian: "",
    guardianRelation: "Father",
    parentContact: "",
    altContact: "",
    // Residential Address
    houseName: "",
    street: "",
    postOffice: "",
    city: "",
    district: "Idukki",
    state: "Kerala",
    pincode: "",
    // Academic History
    previousSchool: "",
    tcNumber: "",
  };
  const [formData, setFormData] = useState(initialForm);

  // Helper to resolve full URL for uploaded files
  const getDocumentUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const backendBase = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
      : "http://localhost:5000";
    return `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  // Fetch Students & Stats
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/students");
      if (res.data.success) {
        setStudents(res.data.students || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadStudents = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/students");
        if (isMounted && res.data.success) {
          setStudents(res.data.students || []);
          if (res.data.stats) setStats(res.data.stats);
        }
      } catch (err) {
        console.error("Failed to load students:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadStudents();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  // Filter & Search Logic
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        String(s.rollNumber).includes(q) ||
        (s.admissionNumber && s.admissionNumber.toLowerCase().includes(q)) ||
        (s.sampoornaId && s.sampoornaId.toLowerCase().includes(q)) ||
        (s.aadhaarNumber && s.aadhaarNumber.includes(q)) ||
        (s.guardian && s.guardian.toLowerCase().includes(q));

      const matchDivision =
        selectedDivision === "All" ||
        s.division.toLowerCase() === selectedDivision.toLowerCase() ||
        s.division.toLowerCase().includes(selectedDivision.toLowerCase()) ||
        s.division.replace(/^Class\s*/i, "").toLowerCase() === selectedDivision.replace(/^Class\s*/i, "").toLowerCase();

      return matchSearch && matchDivision;
    });
  }, [students, searchQuery, selectedDivision]);

  // Pagination Logic
  const totalStudentsCount = filteredStudents.length;
  const totalPages = Math.ceil(totalStudentsCount / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  // Modal Handlers
  const openNewAdmissionModal = () => {
    setEditingStudent(null);
    setActiveModalTab("personal");
    const nextRoll = students.length + 1;
    setFormData({
      ...initialForm,
      email: "",
      rollNumber: nextRoll,
      admissionNumber: `ADM-${14920 + nextRoll}`,
      sampoornaId: `SMP-06042-${880 + nextRoll}`,
      dob: "2010-05-14",
    });
    setFeedback({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setActiveModalTab("personal");
    setFormData({
      name: student.name || "",
      email: student.email || "",
      rollNumber: student.rollNumber || "",
      admissionNumber: student.admissionNumber || "",
      sampoornaId: student.sampoornaId || "",
      division: student.division || "10-A",
      gender: student.gender || "Male",
      category: student.category ? student.category.split(" / ")[0] : "General",
      dob: student.dob || "2010-05-14",
      bloodGroup: student.bloodGroup || "O+",
      religion: student.religion || "Hindu",
      caste: student.caste || "",
      aadhaarNumber: student.aadhaarNumber || "",
      birthCertificateNumber: student.birthCertificateNumber || "",
      idProofUrl: student.idProofUrl || "",
      idProofType: student.idProofType || "Aadhaar Card",
      idProofFileName: student.idProofFileName || "",
      idProofFileType: student.idProofFileType || "",
      birthCertificateUrl: student.birthCertificateUrl || "",
      birthCertificateFileName: student.birthCertificateFileName || "",
      identificationMarks: student.identificationMarks || "",
      fatherName: student.fatherName || "",
      motherName: student.motherName || "",
      guardian: student.guardian || "",
      guardianRelation: student.guardianRelation || "Father",
      parentContact: student.parentContact || "",
      altContact: student.altContact || "",
      houseName: student.address?.houseName || "",
      street: student.address?.street || "",
      postOffice: student.address?.postOffice || "",
      city: student.address?.city || "",
      district: student.address?.district || "Idukki",
      state: student.address?.state || "Kerala",
      pincode: student.address?.pincode || "",
      previousSchool: student.previousSchool || "",
      tcNumber: student.tcNumber || "",
    });
    setFeedback({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Upload handler for ID Proof Document (Image or PDF)
  const handleFileUpload = async (e, fieldType = "idProof") => {
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
      if (fieldType === "idProof") setUploadingIdProof(true);
      else setUploadingBcProof(true);

      const res = await api.post("/upload/document", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        if (fieldType === "idProof") {
          setFormData((prev) => ({
            ...prev,
            idProofUrl: res.data.fileUrl,
            idProofFileName: res.data.fileName,
            idProofFileType: res.data.fileType,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            birthCertificateUrl: res.data.fileUrl,
            birthCertificateFileName: res.data.fileName,
          }));
        }
        setFeedback({
          type: "success",
          message: `${file.name} uploaded successfully!`,
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "File upload failed.",
      });
    } finally {
      if (fieldType === "idProof") {
        setUploadingIdProof(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setUploadingBcProof(false);
        if (bcFileInputRef.current) bcFileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveUploadedFile = (fieldType = "idProof") => {
    if (fieldType === "idProof") {
      setFormData((prev) => ({
        ...prev,
        idProofUrl: "",
        idProofFileName: "",
        idProofFileType: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        birthCertificateUrl: "",
        birthCertificateFileName: "",
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setActiveModalTab("personal");
      setFeedback({ type: "error", message: "Student Name is required." });
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingStudent) {
        // Update existing
        const res = await api.put(
          `/admin/students/${editingStudent._id}`,
          formData
        );
        if (res.data.success) {
          setFeedback({
            type: "success",
            message: `Updated student ${formData.name}!`,
          });
          setTimeout(() => {
            closeModal();
            fetchStudents();
          }, 800);
        }
      } else {
        // Create new
        const res = await api.post("/admin/students", formData);
        if (res.data.success) {
          setFeedback({
            type: "success",
            message: `Student ${formData.name} admitted successfully with Sampoorna ID ${res.data.student?.sampoornaId}!`,
          });
          setTimeout(() => {
            closeModal();
            fetchStudents();
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

  const handleDeleteStudent = async () => {
    if (!editingStudent) return;
    if (
      !window.confirm(
        `Are you sure you want to remove ${editingStudent.name} from records?`
      )
    )
      return;

    try {
      setFormSubmitting(true);
      const res = await api.delete(`/admin/students/${editingStudent._id}`);
      if (res.data.success) {
        closeModal();
        fetchStudents();
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to delete student.",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // CSV Export (Full Government SSLC Nominal Roll)
  const handleExportCSV = () => {
    if (!students.length) return;
    const headers = [
      "Roll No",
      "Admission No",
      "Sampoorna ID",
      "Student Name",
      "DOB",
      "Gender",
      "Blood Group",
      "Aadhaar Number",
      "Birth Certificate No",
      "ID Proof Uploaded",
      "Division",
      "Father Name",
      "Mother Name",
      "Guardian Name",
      "Parent Contact",
      "Residential Address",
      "District",
      "PIN Code",
      "Category",
      "Attendance %",
    ];
    const rows = students.map((s) => [
      s.rollNumber,
      s.admissionNumber,
      s.sampoornaId,
      `"${s.name}"`,
      s.dob,
      s.gender,
      s.bloodGroup || "O+",
      `"${s.aadhaarNumber || "Pending"}"`,
      `"${s.birthCertificateNumber || "N/A"}"`,
      s.idProofUrl ? `"Yes (${s.idProofFileName || "Document"})"` : '"No"',
      s.division,
      `"${s.fatherName || ""}"`,
      `"${s.motherName || ""}"`,
      `"${s.guardian || ""}"`,
      s.parentContact,
      `"${s.fullAddress || ""}"`,
      `"${s.address?.district || "Idukki"}"`,
      `"${s.address?.pincode || ""}"`,
      `"${s.category}"`,
      s.attendance,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Sampoorna_Nominal_Roll_Full_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/teachers")}
            >
              <span>🗂</span> Teachers Records
            </button>
            <button className="console-nav-item active">
              <span>🎓</span> Students Records
            </button>
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/exams")}
            >
              <span>📅</span> Exam Timetables
            </button>
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/payments")}
            >
              <span>💳</span> Fee & Payments Console
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
                <span className="card-label">TOTAL ENROLLED</span>
                <div className="stat-icon-circle blue">👥</div>
              </div>
              <div className="overview-number">
                {stats.totalEnrolled.toLocaleString()}
              </div>
              <div className="sub-text">
                Boys: {stats.boysCount} | Girls: {stats.girlsCount}
              </div>
            </div>

            {/* Card 2 */}
            <div className="overview-stat-card">
              <div className="stat-card-header">
                <span className="card-label">CLASS 10 (SSLC CADRE)</span>
                <div className="stat-icon-circle green">🎓</div>
              </div>
              <div className="overview-number stat-number-green">
                {stats.class10Candidates} Candidates
              </div>
              <div className="sub-text">5 Divisions (A to E)</div>
            </div>

            {/* Card 3 */}
            <div className="overview-stat-card">
              <div className="stat-card-header">
                <span className="card-label">PLUS ONE &amp; PLUS TWO</span>
                <div className="stat-icon-circle purple">📖</div>
              </div>
              <div className="overview-number">
                {stats.plusTwoCount} Students
              </div>
              <div className="sub-text">Science, Commerce, Humanities</div>
            </div>

            {/* Card 4 */}
            <div className="overview-stat-card">
              <div className="stat-card-header">
                <span className="card-label">SAMPOORNA ID LINKED</span>
                <div className="stat-icon-circle emerald">🛡️</div>
              </div>
              <div className="overview-number stat-number-emerald">
                {stats.sampoornaVerified} Verified
              </div>
              <div className="sub-text">Aadhaar &amp; UID seeded</div>
            </div>
          </div>

          {/* Action Header Banner */}
          <section className="student-header-banner">
            <div className="registry-title-left">
              <div className="registry-icon-badge">🎓</div>
              <div className="registry-title-text">
                <h1>Student Admission &amp; Academic Registry</h1>
                <p>
                  Official Kerala Sampoorna student database with digital ID proof
                  verification (Images &amp; PDFs).
                </p>
              </div>
            </div>

            <div className="registry-controls-right">
              {/* Search Box */}
              <div className="search-input-wrapper">
                <span className="search-input-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Name, Roll No, Adm No, Aadhaar, Sampoorna ID..."
                  className="registry-search-input"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Division Select */}
              <select
                className="registry-select-dropdown"
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Divisions (26 Academic Divisions)</option>
                {ACADEMIC_WINGS.map((wing) => (
                  <optgroup key={wing.code} label={wing.wing}>
                    {wing.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.stream})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {/* New Admission Button */}
              <button
                className="btn-new-admission"
                onClick={openNewAdmissionModal}
              >
                <span>👤+</span> New Admission
              </button>
            </div>
          </section>

          {/* Students Table Card */}
          <div className="students-registry-card">
            <table className="student-table">
              <thead>
                <tr>
                  <th>ROLL NO</th>
                  <th>ADM NO / SAMPOORNA ID</th>
                  <th>STUDENT NAME</th>
                  <th>DIVISION</th>
                  <th>GUARDIAN CONTACT</th>
                  <th>CATEGORY / GENDER</th>
                  <th>ATTENDANCE %</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: "center", padding: "30px" }}
                    >
                      Loading Sampoorna student register...
                    </td>
                  </tr>
                ) : paginatedStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: "center", padding: "30px" }}
                    >
                      No matching student records found.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((std) => {
                    const catClean = std.category.toLowerCase();
                    let catClass = "general";
                    if (catClean.includes("obc")) catClass = "obc";
                    else if (catClean.includes("sc") || catClean.includes("st"))
                      catClass = "sc";
                    else if (catClean.includes("oec")) catClass = "oec";

                    return (
                      <tr key={std._id}>
                        <td>
                          <span className="roll-no-badge">
                            {std.rollNoFormatted}
                          </span>
                        </td>
                        <td>
                          <span
                            className="adm-no-link"
                            onClick={() => openEditModal(std)}
                            title="Click to Edit Student"
                          >
                            {std.admissionNumber}
                          </span>
                          <span className="subtext-dim">{std.sampoornaId}</span>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              flexWrap: "wrap",
                            }}
                          >
                            {std.aadhaarNumber ? (
                              <span
                                className="aadhaar-verified-pill"
                                title={`Aadhaar: ${std.aadhaarNumber}`}
                              >
                                ✓ UID Linked
                              </span>
                            ) : (
                              <span
                                className="aadhaar-pending-pill"
                                title="Aadhaar UID not linked yet"
                              >
                                ⚠ UID Pending
                              </span>
                            )}

                            {/* Clickable ID Proof File indicator if uploaded */}
                            {std.idProofUrl && (
                              <a
                                href={getDocumentUrl(std.idProofUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="id-proof-doc-link"
                                title={`View Uploaded ${std.idProofType || "ID Proof"} (${std.idProofFileName || "Document"})`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                📎 {std.idProofFileType === "pdf" ? "PDF" : "Doc"}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="student-name-cell">
                          <strong
                            style={{ cursor: "pointer", color: "#135bec" }}
                            onClick={() => setDossierStudent(std)}
                            title="Click to view full student dossier"
                          >
                            {std.name}
                          </strong>
                          <span className="subtext-dim">DOB: {std.dob}</span>
                          {std.email && (
                            <span
                              className="subtext-dim"
                              style={{ color: "#2563eb", fontSize: "11px", display: "block", marginTop: "2px" }}
                            >
                              ✉ {std.email}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="pill-division">{std.division}</span>
                        </td>
                        <td>
                          <strong>{std.guardian}</strong>
                          <span className="subtext-dim">
                            {std.parentContact}
                          </span>
                        </td>
                        <td>
                          <span className={`category-badge ${catClass}`}>
                            {std.category}
                          </span>
                        </td>
                        <td>
                          <span className="attendance-rate-green">
                            {std.attendance}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: "8px",
                            }}
                          >
                            <button
                              className="btn-dossier-link"
                              onClick={() => setDossierStudent(std)}
                              title="View Student Dossier &amp; ID Proofs"
                            >
                              Dossier
                            </button>
                            <button
                              className="btn-edit-link"
                              onClick={() => openEditModal(std)}
                              title="Edit Record"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination & Export Bar */}
            <div className="registry-footer-bar">
              <div>
                Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{" "}
                <strong>
                  {Math.min(currentPage * pageSize, totalStudentsCount)}
                </strong>{" "}
                of <strong>{totalStudentsCount.toLocaleString()}</strong>{" "}
                students
              </div>

              <div className="pagination-controls">
                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  &lt;
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
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
                {totalPages > 5 && <span style={{ padding: "0 6px" }}>...</span>}
                {totalPages > 5 && (
                  <button
                    className={`page-btn ${
                      currentPage === totalPages ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                )}
                <button
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  &gt;
                </button>
              </div>

              <button className="btn-export-link" onClick={handleExportCSV}>
                Export Sampoorna SSLC Nominal Roll (CSV/PDF) 📥
              </button>
            </div>
          </div>

          {/* Platform Footer */}
          <footer className="platform-footer-card">
            <div>
              <strong>
                Government Higher Secondary School Rajakkad • School Code: 06042
              </strong>
              <div style={{ marginTop: "4px" }}>
                Affiliated to General Education Department &amp; SCERT Kerala •
                State Academic Governance Cluster
              </div>
            </div>
            <div className="operational-pill">
              Sampoorna Academic Management Platform v2.0 • 🟢 Operational
            </div>
          </footer>
        </main>
      </div>

      {/* ---------------- NEW / EDIT STUDENT MODAL (MULTI-TAB) ---------------- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content-card modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <div>
                <h3>
                  {editingStudent
                    ? `Edit Student: ${editingStudent.name}`
                    : "New Student Admission"}
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    margin: "2px 0 0 0",
                  }}
                >
                  Kerala Sampoorna Student Identity &amp; Statutory KYC Registry
                </p>
              </div>
              <button className="modal-close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>

            {/* Modal Tab Strip */}
            <div className="modal-tab-nav">
              <button
                type="button"
                className={`modal-tab-btn ${
                  activeModalTab === "personal" ? "active" : ""
                }`}
                onClick={() => setActiveModalTab("personal")}
              >
                <span>👤</span> Academic &amp; Personal
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${
                  activeModalTab === "idproofs" ? "active" : ""
                }`}
                onClick={() => setActiveModalTab("idproofs")}
              >
                <span>🛡️</span> ID Proofs &amp; KYC
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${
                  activeModalTab === "family" ? "active" : ""
                }`}
                onClick={() => setActiveModalTab("family")}
              >
                <span>👨‍👩‍👧</span> Parents &amp; Contacts
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${
                  activeModalTab === "address" ? "active" : ""
                }`}
                onClick={() => setActiveModalTab("address")}
              >
                <span>📍</span> Residence &amp; TC
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

                {/* TAB 1: ACADEMIC & PERSONAL */}
                {activeModalTab === "personal" && (
                  <div>
                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>Student Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="e.g. Aaditya S. Kumar"
                          value={formData.name}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-field-group">
                        <label>Student Email ID (Mail ID)</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="student@ghss.edu"
                          value={formData.email}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>Roll Number</label>
                        <input
                          type="number"
                          name="rollNumber"
                          placeholder="e.g. 1"
                          value={formData.rollNumber}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-field-group">
                        <label>Class &amp; Division</label>
                        <select
                          name="division"
                          value={formData.division}
                          onChange={handleFormChange}
                        >
                          {ACADEMIC_WINGS.map((wing) => (
                            <optgroup key={wing.code} label={wing.wing}>
                              {wing.classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name} ({c.stream})
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>Admission Number</label>
                        <input
                          type="text"
                          name="admissionNumber"
                          placeholder="ADM-14920"
                          value={formData.admissionNumber}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-field-group">
                        <label>Sampoorna ID</label>
                        <input
                          type="text"
                          name="sampoornaId"
                          placeholder="SMP-06042-881"
                          value={formData.sampoornaId}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    <div className="form-row-grid-3">
                      <div className="form-field-group">
                        <label>Date of Birth</label>
                        <input
                          type="text"
                          name="dob"
                          placeholder="DD/MM/YYYY"
                          value={formData.dob}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-field-group">
                        <label>Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleFormChange}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-field-group">
                        <label>Blood Group</label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleFormChange}
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
                    </div>

                    <div className="form-row-grid-3">
                      <div className="form-field-group">
                        <label>Social Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                        >
                          <option value="General">General</option>
                          <option value="OBC">OBC</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                          <option value="OEC">OEC</option>
                        </select>
                      </div>
                      <div className="form-field-group">
                        <label>Religion</label>
                        <select
                          name="religion"
                          value={formData.religion}
                          onChange={handleFormChange}
                        >
                          <option value="Hindu">Hindu</option>
                          <option value="Christian">Christian</option>
                          <option value="Muslim">Muslim</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-field-group">
                        <label>Caste / Community</label>
                        <input
                          type="text"
                          name="caste"
                          placeholder="e.g. Nair, Ezhava, etc."
                          value={formData.caste}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: STATUTORY ID PROOFS & KYC (WITH FILE UPLOAD) */}
                {activeModalTab === "idproofs" && (
                  <div>
                    <div className="form-section-header">
                      <span>🛡️</span> Government Identity Documents &amp; Upload
                    </div>

                    {/* Aadhaar Number Field */}
                    <div className="form-field-group">
                      <label>Aadhaar Card Number (12-Digit UID)</label>
                      <input
                        type="text"
                        name="aadhaarNumber"
                        maxLength="14"
                        placeholder="XXXX XXXX XXXX (e.g. 5482 9102 3841)"
                        value={formData.aadhaarNumber}
                        onChange={handleFormChange}
                      />
                      <span className="helper-text">
                        Mandatory for UDISE+ and Kerala Sampoorna direct scholarship
                        seeding.
                      </span>
                    </div>

                    {/* 1. Upload Aadhaar / Primary ID Proof File */}
                    <div className="form-field-group" style={{ marginBottom: "20px" }}>
                      <label>Upload Aadhaar / ID Proof Document (Image or PDF)</label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileUpload(e, "idProof")}
                      />

                      {formData.idProofUrl ? (
                        <div className="uploaded-file-card">
                          <div className="uploaded-file-info">
                            {formData.idProofFileType === "pdf" ? (
                              <div className="uploaded-pdf-badge">
                                <span>PDF</span>
                              </div>
                            ) : (
                              <img
                                src={getDocumentUrl(formData.idProofUrl)}
                                alt="ID Proof Preview"
                                className="uploaded-file-thumbnail"
                              />
                            )}
                            <div className="uploaded-file-names">
                              <span className="uploaded-file-name">
                                {formData.idProofFileName || "Aadhaar_Proof_Document"}
                              </span>
                              <span className="uploaded-file-status">
                                ✓ Uploaded &amp; Attached
                              </span>
                            </div>
                          </div>
                          <div className="uploaded-file-actions">
                            <a
                              href={getDocumentUrl(formData.idProofUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-file-preview"
                            >
                              View / Open ↗
                            </a>
                            <button
                              type="button"
                              className="btn-file-remove"
                              onClick={() => handleRemoveUploadedFile("idProof")}
                              title="Remove file"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`upload-dropzone ${
                            uploadingIdProof ? "disabled" : ""
                          }`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="upload-icon-circle">
                            {uploadingIdProof ? "⏳" : "📤"}
                          </div>
                          <p className="upload-prompt-text">
                            {uploadingIdProof
                              ? "Uploading document to secure storage..."
                              : "Click to upload Aadhaar / ID Proof file"}
                          </p>
                          <p className="upload-sub-text">
                            Supports PDF documents or Image files (JPG, PNG, WEBP)
                            up to 10MB
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Birth Certificate Number Field */}
                    <div className="form-field-group">
                      <label>Birth Certificate Registration Number</label>
                      <input
                        type="text"
                        name="birthCertificateNumber"
                        placeholder="e.g. KL-2010-060421-BC"
                        value={formData.birthCertificateNumber}
                        onChange={handleFormChange}
                      />
                    </div>

                    {/* 2. Upload Birth Certificate File (Optional) */}
                    <div className="form-field-group" style={{ marginBottom: "20px" }}>
                      <label>Upload Birth Certificate Copy (Optional - Image or PDF)</label>
                      <input
                        type="file"
                        ref={bcFileInputRef}
                        accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileUpload(e, "birthCertificate")}
                      />

                      {formData.birthCertificateUrl ? (
                        <div className="uploaded-file-card">
                          <div className="uploaded-file-info">
                            <div className="uploaded-pdf-badge" style={{ background: "#e0f2fe", color: "#0369a1", borderColor: "#bae6fd" }}>
                              <span>DOC</span>
                            </div>
                            <div className="uploaded-file-names">
                              <span className="uploaded-file-name">
                                {formData.birthCertificateFileName || "Birth_Certificate"}
                              </span>
                              <span className="uploaded-file-status">
                                ✓ Uploaded &amp; Attached
                              </span>
                            </div>
                          </div>
                          <div className="uploaded-file-actions">
                            <a
                              href={getDocumentUrl(formData.birthCertificateUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-file-preview"
                            >
                              View / Open ↗
                            </a>
                            <button
                              type="button"
                              className="btn-file-remove"
                              onClick={() => handleRemoveUploadedFile("birthCertificate")}
                              title="Remove file"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`upload-dropzone ${
                            uploadingBcProof ? "disabled" : ""
                          }`}
                          onClick={() => bcFileInputRef.current?.click()}
                        >
                          <div className="upload-icon-circle" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                            {uploadingBcProof ? "⏳" : "📋"}
                          </div>
                          <p className="upload-prompt-text">
                            {uploadingBcProof
                              ? "Uploading certificate..."
                              : "Click to upload Birth Certificate file (Image or PDF)"}
                          </p>
                          <p className="upload-sub-text">
                            Local Self Government / Corporation registration certificate
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="form-field-group">
                      <label>Visible Identification Marks (Govt. SSLC)</label>
                      <input
                        type="text"
                        name="identificationMarks"
                        placeholder="e.g. A mole on the right cheek / A small scar on the left forehead"
                        value={formData.identificationMarks}
                        onChange={handleFormChange}
                      />
                      <span className="helper-text">
                        Recorded on the SSLC Book &amp; Hall Ticket for identification.
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB 3: PARENTS & GUARDIANS */}
                {activeModalTab === "family" && (
                  <div>
                    <div className="form-section-header">
                      <span>👨‍👩‍👧</span> Parent &amp; Guardian Information
                    </div>

                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>Father's Full Name</label>
                        <input
                          type="text"
                          name="fatherName"
                          placeholder="e.g. Santhosh Kumar K."
                          value={formData.fatherName}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-field-group">
                        <label>Mother's Full Name</label>
                        <input
                          type="text"
                          name="motherName"
                          placeholder="e.g. Rekha Santhosh"
                          value={formData.motherName}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>Primary Guardian Name *</label>
                        <input
                          type="text"
                          name="guardian"
                          placeholder="e.g. Santhosh Kumar K."
                          value={formData.guardian}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-field-group">
                        <label>Relationship with Student</label>
                        <select
                          name="guardianRelation"
                          value={formData.guardianRelation}
                          onChange={handleFormChange}
                        >
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Grandfather">Grandfather</option>
                          <option value="Grandmother">Grandmother</option>
                          <option value="Uncle">Uncle</option>
                          <option value="Legal Guardian">Legal Guardian</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>Primary Mobile (SMS / WhatsApp) *</label>
                        <input
                          type="text"
                          name="parentContact"
                          placeholder="+91 94473 11820"
                          value={formData.parentContact}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-field-group">
                        <label>Emergency / Alternate Contact</label>
                        <input
                          type="text"
                          name="altContact"
                          placeholder="+91 98460 00000"
                          value={formData.altContact}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: RESIDENTIAL ADDRESS & PREVIOUS SCHOOL */}
                {activeModalTab === "address" && (
                  <div>
                    <div className="form-section-header">
                      <span>📍</span> Permanent Residential Address
                    </div>

                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>House Name / Flat No</label>
                        <input
                          type="text"
                          name="houseName"
                          placeholder="e.g. Parambil House"
                          value={formData.houseName}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-field-group">
                        <label>Street / Locality</label>
                        <input
                          type="text"
                          name="street"
                          placeholder="e.g. Near GHSS Junction"
                          value={formData.street}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    <div className="form-row-grid-3">
                      <div className="form-field-group">
                        <label>Post Office</label>
                        <input
                          type="text"
                          name="postOffice"
                          placeholder="e.g. Rajakkad P.O"
                          value={formData.postOffice}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-field-group">
                        <label>District</label>
                        <select
                          name="district"
                          value={formData.district}
                          onChange={handleFormChange}
                        >
                          <option value="Idukki">Idukki</option>
                          <option value="Ernakulam">Ernakulam</option>
                          <option value="Kottayam">Kottayam</option>
                          <option value="Thrissur">Thrissur</option>
                          <option value="Palakkad">Palakkad</option>
                          <option value="Thiruvananthapuram">
                            Thiruvananthapuram
                          </option>
                          <option value="Kozhikode">Kozhikode</option>
                          <option value="Malappuram">Malappuram</option>
                          <option value="Kannur">Kannur</option>
                          <option value="Kollam">Kollam</option>
                          <option value="Alappuzha">Alappuzha</option>
                          <option value="Pathanamthitta">Pathanamthitta</option>
                          <option value="Wayanad">Wayanad</option>
                          <option value="Kasaragod">Kasaragod</option>
                        </select>
                      </div>
                      <div className="form-field-group">
                        <label>PIN Code</label>
                        <input
                          type="text"
                          name="pincode"
                          placeholder="685566"
                          maxLength="6"
                          value={formData.pincode}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    <div className="form-section-header">
                      <span>🏫</span> Previous Education &amp; Transfer
                      Certificate
                    </div>

                    <div className="form-row-grid-2">
                      <div className="form-field-group">
                        <label>Previous Institution Attended</label>
                        <input
                          type="text"
                          name="previousSchool"
                          placeholder="e.g. St. Mary's High School"
                          value={formData.previousSchool}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-field-group">
                        <label>Transfer Certificate (TC) Number</label>
                        <input
                          type="text"
                          name="tcNumber"
                          placeholder="e.g. TC/2025/482"
                          value={formData.tcNumber}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="modal-footer-row">
                {editingStudent && (
                  <button
                    type="button"
                    className="btn-modal-delete"
                    onClick={handleDeleteStudent}
                    disabled={formSubmitting}
                  >
                    Delete Record
                  </button>
                )}

                {/* Quick Next Tab navigation helper */}
                {activeModalTab !== "address" ? (
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => {
                      if (activeModalTab === "personal")
                        setActiveModalTab("idproofs");
                      else if (activeModalTab === "idproofs")
                        setActiveModalTab("family");
                      else if (activeModalTab === "family")
                        setActiveModalTab("address");
                    }}
                  >
                    Next Tab →
                  </button>
                ) : null}

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
                  disabled={formSubmitting || uploadingIdProof || uploadingBcProof}
                >
                  {formSubmitting
                    ? "Saving..."
                    : editingStudent
                    ? "Update Student Record"
                    : "Complete Admission"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- STUDENT KYC DOSSIER POPUP ---------------- */}
      {dossierStudent && (
        <div className="modal-overlay" onClick={() => setDossierStudent(null)}>
          <div
            className="modal-content-card modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <div>
                <h3>Student Identity &amp; Statutory KYC Dossier</h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    margin: "2px 0 0 0",
                  }}
                >
                  Kerala Sampoorna Official Student Record • School Code: 06042
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setDossierStudent(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-form-body">
              {/* Header profile brief */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px",
                  background: "#eff6ff",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  border: "1px solid #bfdbfe",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      background: "#135bec",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      fontWeight: "700",
                    }}
                  >
                    {dossierStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: "800",
                        color: "#0f172a",
                      }}
                    >
                      {dossierStudent.name}
                    </h2>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "13px",
                        color: "#475569",
                      }}
                    >
                      Roll No:{" "}
                      <strong>{dossierStudent.rollNoFormatted}</strong> •{" "}
                      {dossierStudent.division} • Adm No:{" "}
                      <strong>{dossierStudent.admissionNumber}</strong>
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span className="dossier-blood-pill">
                    Blood Group: {dossierStudent.bloodGroup || "O+"}
                  </span>
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "12px",
                      color: "#047857",
                      fontWeight: "700",
                    }}
                  >
                    Sampoorna: {dossierStudent.sampoornaId}
                  </div>
                </div>
              </div>

              {/* Dossier Grid */}
              <div className="dossier-preview-grid">
                {/* Statutory ID Proofs */}
                <div className="dossier-card">
                  <h4>
                    <span>🛡️</span> Statutory ID Proofs &amp; Files
                  </h4>
                  <div className="dossier-field-row">
                    <span className="label">Aadhaar (UID):</span>
                    <span className="value">
                      {dossierStudent.aadhaarNumber ? (
                        <span style={{ color: "#047857" }}>
                          ✓ {dossierStudent.aadhaarNumber}
                        </span>
                      ) : (
                        <span style={{ color: "#b45309" }}>⚠ Not Linked</span>
                      )}
                    </span>
                  </div>

                  {/* Uploaded Primary ID Proof Document */}
                  {dossierStudent.idProofUrl ? (
                    <div className="dossier-doc-preview-box">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "16px" }}>
                          {dossierStudent.idProofFileType === "pdf" ? "📕" : "🖼️"}
                        </span>
                        <div>
                          <strong style={{ fontSize: "12px", display: "block", color: "#0f172a" }}>
                            {dossierStudent.idProofFileName || "Aadhaar Card Proof"}
                          </strong>
                          <span style={{ fontSize: "10.5px", color: "#047857" }}>
                            Uploaded Document
                          </span>
                        </div>
                      </div>
                      <a
                        href={getDocumentUrl(dossierStudent.idProofUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-file-preview"
                      >
                        View Proof ↗
                      </a>
                    </div>
                  ) : null}

                  <div className="dossier-field-row" style={{ marginTop: "8px" }}>
                    <span className="label">Birth Certificate:</span>
                    <span className="value">
                      {dossierStudent.birthCertificateNumber || "Registered on File"}
                    </span>
                  </div>

                  {/* Uploaded Birth Certificate Document */}
                  {dossierStudent.birthCertificateUrl ? (
                    <div className="dossier-doc-preview-box">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "16px" }}>📋</span>
                        <div>
                          <strong style={{ fontSize: "12px", display: "block", color: "#0f172a" }}>
                            {dossierStudent.birthCertificateFileName || "Birth_Certificate.pdf"}
                          </strong>
                          <span style={{ fontSize: "10.5px", color: "#047857" }}>
                            Birth Proof File
                          </span>
                        </div>
                      </div>
                      <a
                        href={getDocumentUrl(dossierStudent.birthCertificateUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-file-preview"
                      >
                        View Copy ↗
                      </a>
                    </div>
                  ) : null}

                  <div className="dossier-field-row">
                    <span className="label">Date of Birth:</span>
                    <span className="value">{dossierStudent.dob}</span>
                  </div>
                  <div className="dossier-field-row">
                    <span className="label">Gender:</span>
                    <span className="value">{dossierStudent.gender}</span>
                  </div>
                  <div className="dossier-field-row">
                    <span className="label">Identification Mark:</span>
                    <span className="value" style={{ fontSize: "11.5px" }}>
                      {dossierStudent.identificationMarks ||
                        "Recorded in SSLC register"}
                    </span>
                  </div>
                </div>

                {/* Family & Guardians */}
                <div className="dossier-card">
                  <h4>
                    <span>👨‍👩‍👧</span> Family &amp; Guardians
                  </h4>
                  <div className="dossier-field-row">
                    <span className="label">Father's Name:</span>
                    <span className="value">
                      {dossierStudent.fatherName || dossierStudent.guardian}
                    </span>
                  </div>
                  <div className="dossier-field-row">
                    <span className="label">Mother's Name:</span>
                    <span className="value">
                      {dossierStudent.motherName || "Not Recorded"}
                    </span>
                  </div>
                  <div className="dossier-field-row">
                    <span className="label">Primary Guardian:</span>
                    <span className="value">
                      {dossierStudent.guardian} (
                      {dossierStudent.guardianRelation || "Father"})
                    </span>
                  </div>
                  <div className="dossier-field-row">
                    <span className="label">Contact Mobile:</span>
                    <span className="value">
                      {dossierStudent.parentContact}
                    </span>
                  </div>
                  <div className="dossier-field-row">
                    <span className="label">Student Mail ID:</span>
                    <span className="value">
                      {dossierStudent.email ? (
                        <a
                          href={"mailto:" + dossierStudent.email}
                          style={{ color: "#2563eb", textDecoration: "none", fontWeight: "600" }}
                        >
                          ✉ {dossierStudent.email}
                        </a>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>Not registered</span>
                      )}
                    </span>
                  </div>
                  <div className="dossier-field-row">
                    <span className="label">Alt / Emergency:</span>
                    <span className="value">
                      {dossierStudent.altContact || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Residential Address */}
                <div className="dossier-card">
                  <h4>
                    <span>📍</span> Residential Address
                  </h4>
                  <div className="dossier-field-row">
                    <span className="label">Full Address:</span>
                    <span
                      className="value"
                      style={{
                        maxWidth: "60%",
                        wordBreak: "break-word",
                        fontSize: "12px",
                      }}
                    >
                      {dossierStudent.fullAddress ||
                        "Rajakkad P.O, Idukki District, Kerala"}
                    </span>
                  </div>
                  <div className="dossier-field-row">
                    <span className="label">District:</span>
                    <span className="value">
                      {dossierStudent.address?.district || "Idukki"}
                    </span>
                  </div>
                  <div className="dossier-field-row">
                    <span className="label">PIN Code:</span>
                    <span className="value">
                      {dossierStudent.address?.pincode || "685566"}
                    </span>
                  </div>
                  <div className="dossier-field-row">
                    <span className="label">State:</span>
                    <span className="value">Kerala</span>
                  </div>
                </div>

                {/* Academic & Categorization */}
                <div className="dossier-card">
                  <h4>
                    <span>🎓</span> Academic &amp; Social Profile
                  </h4>
                  <div className="dossier-field-row">
                    <span className="label">Social Category:</span>
                    <span className="value">{dossierStudent.category}</span>
                  </div>
                  <div className="dossier-field-row">
                    <span className="label">Religion &amp; Caste:</span>
                    <span className="value">
                      {dossierStudent.religion || "Hindu"}{" "}
                      {dossierStudent.caste ? `(${dossierStudent.caste})` : ""}
                    </span>
                  </div>
                  <div className="dossier-field-row">
                    <span className="label">Previous School:</span>
                    <span className="value">
                      {dossierStudent.previousSchool || "Direct Admission"}
                    </span>
                  </div>
                  <div className="dossier-field-row">
                    <span className="label">TC Number:</span>
                    <span className="value">
                      {dossierStudent.tcNumber || "N/A"}
                    </span>
                  </div>
                  <div className="dossier-field-row">
                    <span className="label">Cumulative Attendance:</span>
                    <span className="value" style={{ color: "#047857" }}>
                      {dossierStudent.attendance}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-row">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setDossierStudent(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-modal-save"
                onClick={() => {
                  const target = dossierStudent;
                  setDossierStudent(null);
                  openEditModal(target);
                }}
              >
                ✏️ Edit Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
