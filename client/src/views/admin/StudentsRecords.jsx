import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosclient";
import { clearAuthSession } from "../../utils/auth";
import "../../Styles/AdminDash.css";

export default function StudentsRecords() {
  const navigate = useNavigate();

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
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const initialForm = {
    name: "",
    rollNumber: "",
    admissionNumber: "",
    sampoornaId: "",
    division: "10-A",
    gender: "Male",
    category: "General",
    dob: "14/05/2010",
    guardian: "",
    parentContact: "",
    overallAttendance: "98.4",
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
    fetchStudents();
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  // Filter & Search Logic
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(s.rollNumber).includes(searchQuery) ||
        (s.admissionNumber &&
          s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.sampoornaId &&
          s.sampoornaId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDivision =
        selectedDivision === "All" ||
        s.division.toLowerCase() === selectedDivision.toLowerCase() ||
        s.division.toLowerCase().includes(selectedDivision.toLowerCase());

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
    setFormData({
      ...initialForm,
      rollNumber: students.length + 1,
      admissionNumber: `ADM-${14920 + students.length + 1}`,
      sampoornaId: `SMP-06042-${880 + students.length + 1}`,
    });
    setFeedback({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || "",
      rollNumber: student.rollNumber || "",
      admissionNumber: student.admissionNumber || "",
      sampoornaId: student.sampoornaId || "",
      division: student.division || "10-A",
      gender: student.gender || "Male",
      category: student.category ? student.category.split(" / ")[0] : "General",
      dob: student.dob || "14/05/2010",
      guardian: student.guardian || "",
      parentContact: student.parentContact || "",
      overallAttendance: (student.attendance || "98.4%").replace("%", ""),
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
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
            message: `Student ${formData.name} admitted successfully!`,
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

  // CSV Export
  const handleExportCSV = () => {
    if (!students.length) return;
    const headers = [
      "Roll No",
      "Admission No",
      "Sampoorna ID",
      "Student Name",
      "DOB",
      "Division",
      "Guardian Name",
      "Parent Contact",
      "Category",
      "Attendance %",
    ];
    const rows = students.map((s) => [
      s.rollNumber,
      s.admissionNumber,
      s.sampoornaId,
      `"${s.name}"`,
      s.dob,
      s.division,
      `"${s.guardian}"`,
      s.parentContact,
      `"${s.category}"`,
      s.attendance,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sampoorna_Nominal_Roll_${Date.now()}.csv`);
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
                  Official Kerala Sampoorna student database with UDISE+ and
                  attendance tracking.
                </p>
              </div>
            </div>

            <div className="registry-controls-right">
              {/* Search Box */}
              <div className="search-input-wrapper">
                <span className="search-input-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Name, Roll No, Adm No, Sampoorna ID..."
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
                <option value="All">All Divisions (Standard 8 - 10)</option>
                <option value="10-A">Class 10-A</option>
                <option value="10-B">Class 10-B</option>
                <option value="9-A">Class 9-A</option>
                <option value="9-B">Class 9-B</option>
                <option value="8-A">Class 8-A</option>
                <option value="8-B">Class 8-B</option>
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
                          >
                            {std.admissionNumber}
                          </span>
                          <span className="subtext-dim">{std.sampoornaId}</span>
                        </td>
                        <td className="student-name-cell">
                          <strong>{std.name}</strong>
                          <span className="subtext-dim">DOB: {std.dob}</span>
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
                          <button
                            className="btn-edit-link"
                            onClick={() => openEditModal(std)}
                          >
                            Edit
                          </button>
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

      {/* ---------------- NEW / EDIT STUDENT MODAL ---------------- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <h3>
                {editingStudent
                  ? `Edit Student: ${editingStudent.name}`
                  : "New Student Admission"}
              </h3>
              <button className="modal-close-btn" onClick={closeModal}>
                ✕
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
                    <label>Division</label>
                    <select
                      name="division"
                      value={formData.division}
                      onChange={handleFormChange}
                    >
                      <option value="10-A">10-A</option>
                      <option value="10-B">10-B</option>
                      <option value="9-A">9-A</option>
                      <option value="9-B">9-B</option>
                      <option value="8-A">8-A</option>
                      <option value="8-B">8-B</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Admission No</label>
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

                <div className="form-row-grid-2">
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
                    <label>Category</label>
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
                </div>

                <div className="form-row-grid-2">
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
                    <label>Attendance Rate %</label>
                    <input
                      type="text"
                      name="overallAttendance"
                      placeholder="98.4"
                      value={formData.overallAttendance}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Guardian Name</label>
                    <input
                      type="text"
                      name="guardian"
                      placeholder="e.g. Santhosh Kumar K."
                      value={formData.guardian}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Guardian Contact</label>
                    <input
                      type="text"
                      name="parentContact"
                      placeholder="+91 94473 11820"
                      value={formData.parentContact}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>

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
                    : editingStudent
                    ? "Update Student"
                    : "Admit Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
