import { useState, useEffect, useMemo, useRef } from "react";
import api from "../../api/axiosclient";
import "../../Styles/AdminDash.css";
import { ACADEMIC_WINGS } from "../../utils/classData";
import { getDocumentUrl } from "../../utils/documentUrl";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import StudentStatsCards from "../../components/admin/students/StudentStatsCards";
import StudentFormModal from "../../components/admin/students/StudentFormModal";
import StudentDossierModal from "../../components/admin/students/StudentDossierModal";
import { checkStudentAgeEligibility } from "../../utils/ageValidator";

export default function StudentsRecords() {
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
  const [isEmailVerified, setIsEmailVerified] = useState(false);
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
    setIsEmailVerified(false);
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
    setIsEmailVerified(true);
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
    setIsEmailVerified(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "email" && value !== formData.email) {
      setIsEmailVerified(false);
    }
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

    if (!editingStudent && formData.email && formData.email.trim() && !isEmailVerified) {
      setActiveModalTab("personal");
      setFeedback({
        type: "error",
        message: "Email verification required: Please verify the student's email with the 6-digit OTP code before completing admission.",
      });
      return;
    }
    if (formData.dob) {
      const ageCheck = checkStudentAgeEligibility(formData.dob, formData.division);
      if (!ageCheck.valid) {
        setActiveModalTab("personal");
        setFeedback({
          type: "error",
          message: ageCheck.message,
        });
        return;
      }
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
      <AdminSidebar activeNav="students" />

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
      <div className="admin-main-wrapper">
        <AdminHeader />

        {/* Main Content Area */}
        <main className="admin-content-area">
          {/* Top 4 Summary Cards Grid */}
          <StudentStatsCards stats={stats} />

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
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingStudent={editingStudent}
        activeModalTab={activeModalTab}
        setActiveModalTab={setActiveModalTab}
        formData={formData}
        handleFormChange={handleFormChange}
        handleFileUpload={handleFileUpload}
        handleRemoveUploadedFile={handleRemoveUploadedFile}
        uploadingIdProof={uploadingIdProof}
        uploadingBcProof={uploadingBcProof}
        formSubmitting={formSubmitting}
        isEmailVerified={isEmailVerified}
        setIsEmailVerified={setIsEmailVerified}
        handleFormSubmit={handleFormSubmit}
        handleDeleteStudent={handleDeleteStudent}
        feedback={feedback}
      />

      {/* ---------------- STUDENT KYC DOSSIER POPUP ---------------- */}
      <StudentDossierModal
        student={dossierStudent}
        onClose={() => setDossierStudent(null)}
        onEdit={(student) => openEditModal(student)}
      />
    </div>
  );
}
