import React, { useState, useEffect, useMemo } from "react";
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
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // View Allotment Modal State
  const [allotmentTeacher, setAllotmentTeacher] = useState(null);

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
  };
  const [formData, setFormData] = useState(initialForm);

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
    fetchTeachers();
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
        (t.assignedClass && t.assignedClass.toLowerCase().includes(q));

      const matchDept =
        selectedDept === "All" ||
        t.department.toLowerCase().includes(selectedDept.toLowerCase());

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
    });
    setFeedback({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
            message: `Faculty ${formData.name} added with PEN ${res.data.teacher?.pen}!`,
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

  // CSV Export for Faculty Roster
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
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Sampoorna_Faculty_Roster_${Date.now()}.csv`
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
                  Authorized permanent teaching cadre, PEN allocation, and
                  academic division charge details.
                </p>
              </div>
            </div>

            <div className="registry-controls-right">
              {/* Search Box */}
              <div className="search-input-wrapper">
                <span className="search-input-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search teacher by name, PEN..."
                  className="registry-search-input"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Department Filter */}
              <select
                className="registry-select-dropdown"
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">
                  All Departments (High School, Higher Secondary, LP/UP)
                </option>
                <option value="Malayalam">Malayalam</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physical Science">Physical Science</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
                <option value="Social Science">Social Science</option>
                <option value="Natural Science">Natural Science</option>
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
                        <span className="teacher-meta-label">Periods Allotted</span>
                        <span className="teacher-meta-value">{t.periods}</span>
                      </div>
                    </div>

                    {/* Footer Actions: View Allotment & Edit Profile */}
                    <div className="teacher-card-footer">
                      <button
                        type="button"
                        className="btn-allotment-link"
                        onClick={() => setAllotmentTeacher(t)}
                        title="View Teaching Timetable &amp; Duty Allotment"
                      >
                        View Allotment
                      </button>
                      <button
                        type="button"
                        className="btn-edit-profile-link"
                        onClick={() => openEditModal(t)}
                        title="Edit Faculty Record"
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

            <button className="btn-export-link" onClick={handleExportCSV}>
              View All Faculty &amp; Export Sampoorna Roster →
            </button>
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

      {/* ---------------- ADD / EDIT TEACHER MODAL ---------------- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content-card modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <div>
                <h3>
                  {editingTeacher
                    ? `Edit Faculty: ${editingTeacher.name}`
                    : "Add Teaching Faculty"}
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    margin: "2px 0 0 0",
                  }}
                >
                  Kerala Sampoorna Faculty &amp; SPARK PEN Management System
                </p>
              </div>
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
                      Permanent Employee Number issued by Govt. of Kerala (SPARK).
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
                </div>

                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Academic Qualifications</label>
                    <input
                      type="text"
                      name="qualification"
                      placeholder="e.g. M.Sc, B.Ed, SET"
                      value={formData.qualification}
                      onChange={handleFormChange}
                    />
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
                    ? "Update Faculty Profile"
                    : "Register Faculty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- VIEW ALLOTMENT & TIMETABLE MODAL ---------------- */}
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

            <div className="modal-form-body">
              {/* Summary Banner */}
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
                <div>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>
                    {allotmentTeacher.assignedClass}
                  </h4>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      color: "#475569",
                    }}
                  >
                    Department: <strong>{allotmentTeacher.department}</strong> •{" "}
                    Contact: {allotmentTeacher.phone}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      background: "#135bec",
                      color: "#ffffff",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontWeight: "700",
                      fontSize: "13px",
                    }}
                  >
                    {allotmentTeacher.periods}
                  </span>
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "11px",
                      color: "#047857",
                      fontWeight: "700",
                    }}
                  >
                    Status: {allotmentTeacher.status}
                  </div>
                </div>
              </div>

              {/* Weekly Schedule Muster Table */}
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "13px",
                  fontWeight: "800",
                  color: "#1e293b",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Weekly Academic Schedule &amp; Classroom Charge
              </h4>
              <table className="student-table" style={{ marginBottom: "16px" }}>
                <thead>
                  <tr>
                    <th>DAY</th>
                    <th>PERIOD / TIME</th>
                    <th>DIVISION</th>
                    <th>SUBJECT / ACTIVITY</th>
                    <th>ROOM / LAB</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Monday</strong>
                    </td>
                    <td>09:45 AM – 10:30 AM (Period 1)</td>
                    <td>
                      <span className="pill-division">Class 10-A</span>
                    </td>
                    <td>{allotmentTeacher.department}</td>
                    <td>Room 12</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Monday</strong>
                    </td>
                    <td>11:25 AM – 12:10 PM (Period 3)</td>
                    <td>
                      <span className="pill-division">Class 10-B</span>
                    </td>
                    <td>{allotmentTeacher.department}</td>
                    <td>Room 14</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Tuesday</strong>
                    </td>
                    <td>10:35 AM – 11:20 AM (Period 2)</td>
                    <td>
                      <span className="pill-division">Class 10-A</span>
                    </td>
                    <td>Class Mentorship &amp; Daily Muster Sync</td>
                    <td>Room 12</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Wednesday</strong>
                    </td>
                    <td>01:00 PM – 01:45 PM (Period 4)</td>
                    <td>
                      <span className="pill-division">Class 9-A</span>
                    </td>
                    <td>Practical / Subject Teaching</td>
                    <td>Science Lab</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Thursday</strong>
                    </td>
                    <td>09:45 AM – 10:30 AM (Period 1)</td>
                    <td>
                      <span className="pill-division">Class 10-A</span>
                    </td>
                    <td>{allotmentTeacher.department}</td>
                    <td>Room 12</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Friday</strong>
                    </td>
                    <td>01:50 PM – 02:35 PM (Period 5)</td>
                    <td>
                      <span className="pill-division">Class 10-A</span>
                    </td>
                    <td>Remedial / Examination Evaluation</td>
                    <td>Staff Room</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="modal-footer-row">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setAllotmentTeacher(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-modal-save"
                onClick={() => {
                  const target = allotmentTeacher;
                  setAllotmentTeacher(null);
                  openEditModal(target);
                }}
              >
                ✏️ Edit Allotment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
