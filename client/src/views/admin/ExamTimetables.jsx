import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosclient";
import { clearAuthSession } from "../../utils/auth";
import "../../Styles/AdminDash.css";

export default function ExamTimetables() {
  const navigate = useNavigate();

  // State
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState({
    totalSchedules: 11,
    upcomingCount: 8,
    hallsAllocated: 12,
    invigilatorCadre: 24,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("All");
  const [selectedStandard, setSelectedStandard] = useState("All");
  const [selectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Schedule Modal State (Add / Edit)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Seating Plan Modal State
  const [isSeatingModalOpen, setIsSeatingModalOpen] = useState(false);
  const [activeSeatingExam, setActiveSeatingExam] = useState(null);
  const [, setSeatingLoading] = useState(false);

  // Form Initial Data
  const initialForm = {
    term: "SSLC Board Examination March 2026",
    standard: "Standard 10 (SSLC)",
    date: "",
    startTime: "09:30 AM",
    endTime: "12:15 PM",
    duration: "2 hrs 45 mins",
    subject: "",
    qpCode: "",
    hall: "Halls 01, 02, 03, 04",
    totalCandidates: 242,
    invigilator: "Mrs. Indu B Nair, Sri. George K.",
    maxMarks: 80,
    passMarks: 24,
    status: "Approved & Published",
    instructions:
      "15 minutes cool-off time provided before writing starts. Candidates must be seated by 09:15 AM with valid photo hall tickets.",
  };
  const [formData, setFormData] = useState(initialForm);

  // Fetch Exam Timetables
  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/exams");
      if (res.data.success) {
        setExams(res.data.exams || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load exam timetables:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadExams = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/exams");
        if (isMounted && res.data.success) {
          setExams(res.data.exams || []);
          if (res.data.stats) setStats(res.data.stats);
        }
      } catch (err) {
        console.error("Failed to load exams:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadExams();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  // Filter & Search Logic
  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        e.subject.toLowerCase().includes(q) ||
        e.qpCode.toLowerCase().includes(q) ||
        e.standard.toLowerCase().includes(q) ||
        (e.hall && e.hall.toLowerCase().includes(q)) ||
        (e.invigilator && e.invigilator.toLowerCase().includes(q));

      const matchTerm =
        selectedTerm === "All" ||
        e.term.toLowerCase().includes(selectedTerm.toLowerCase());

      const matchStd =
        selectedStandard === "All" ||
        e.standard.toLowerCase().includes(selectedStandard.toLowerCase());

      const matchStatus =
        selectedStatus === "All" || e.status === selectedStatus;

      return matchSearch && matchTerm && matchStd && matchStatus;
    });
  }, [exams, searchQuery, selectedTerm, selectedStandard, selectedStatus]);

  // Pagination Logic
  const totalExamCount = filteredExams.length;
  const totalPages = Math.ceil(totalExamCount / pageSize) || 1;
  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExams.slice(start, start + pageSize);
  }, [filteredExams, currentPage]);

  // Open Add Exam Modal
  const openAddExamModal = () => {
    setEditingExam(null);
    setFormData({
      ...initialForm,
      date: "12 March 2026, Thu",
      subject: "",
      qpCode: "MAL-101",
    });
    setFeedback({ type: "", message: "" });
    setIsScheduleModalOpen(true);
  };

  // Open Edit Exam Modal
  const openEditExamModal = (exam) => {
    setEditingExam(exam);
    setFormData({
      term: exam.term || "SSLC Board Examination March 2026",
      standard: exam.standard || "Standard 10 (SSLC)",
      date: exam.date || "",
      startTime: exam.startTime || "09:30 AM",
      endTime: exam.endTime || "12:15 PM",
      duration: exam.duration || "2 hrs 45 mins",
      subject: exam.subject || "",
      qpCode: exam.qpCode || "",
      hall: exam.hall || "Halls 01, 02, 03, 04",
      totalCandidates: exam.totalCandidates || 242,
      invigilator: exam.invigilator || "Mrs. Indu B Nair",
      maxMarks: exam.maxMarks || 80,
      passMarks: exam.passMarks || 24,
      status: exam.status || "Approved & Published",
      instructions: exam.instructions || "",
    });
    setFeedback({ type: "", message: "" });
    setIsScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setEditingExam(null);
    setFeedback({ type: "", message: "" });
  };

  // Handle Save (Create or Update)
  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.date.trim() || !formData.qpCode.trim()) {
      setFeedback({
        type: "error",
        message: "Subject, Exam Date, and QP Code are required.",
      });
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingExam) {
        const res = await api.put(`/admin/exams/${editingExam._id}`, formData);
        if (res.data.success) {
          setFeedback({
            type: "success",
            message: `Updated schedule for ${formData.subject}!`,
          });
          setTimeout(() => {
            closeScheduleModal();
            fetchExams();
          }, 700);
        }
      } else {
        const res = await api.post("/admin/exams", formData);
        if (res.data.success) {
          setFeedback({
            type: "success",
            message: `New exam paper ${formData.subject} scheduled successfully!`,
          });
          setTimeout(() => {
            closeScheduleModal();
            fetchExams();
          }, 700);
        }
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to save exam schedule.",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Exam Schedule
  const handleDeleteExam = async (exam) => {
    if (!window.confirm(`Are you sure you want to delete the schedule for ${exam.subject} (${exam.qpCode})?`)) {
      return;
    }

    try {
      const res = await api.delete(`/admin/exams/${exam._id}`);
      if (res.data.success) {
        fetchExams();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete exam schedule.");
    }
  };

  // Open Seating Plan Modal
  const openSeatingModal = async (exam) => {
    setActiveSeatingExam(exam);
    setIsSeatingModalOpen(true);
    try {
      setSeatingLoading(true);
      const res = await api.get(`/admin/exams/${exam._id}/seating`);
      if (res.data.success) {
        setActiveSeatingExam((prev) => ({
          ...prev,
          seatingPlan: res.data.seatingPlan || [],
        }));
      }
    } catch (err) {
      console.error("Error loading seating plan:", err);
    } finally {
      setSeatingLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!exams.length) return;
    const headers = [
      "Exam Date",
      "Time Slot",
      "Standard",
      "Subject Name",
      "QP Code",
      "Halls Allotted",
      "Total Candidates",
      "Invigilators on Duty",
      "Status",
    ];
    const rows = exams.map((e) => [
      `"${e.date}"`,
      `"${e.startTime} - ${e.endTime}"`,
      `"${e.standard}"`,
      `"${e.subject}"`,
      `"${e.qpCode}"`,
      `"${e.hall}"`,
      `"${e.totalCandidates}"`,
      `"${e.invigilator}"`,
      `"${e.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Sampoorna_Exam_Timetable_${Date.now()}.csv`
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
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/students")}
            >
              <span>🎓</span> Students Records
            </button>
            <button className="console-nav-item active">
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
                <span className="card-label">TOTAL SCHEDULES</span>
                <div className="stat-icon-circle blue">📅</div>
              </div>
              <div className="overview-number">
                {stats.totalSchedules} Sessions
              </div>
              <div className="sub-text">SSLC &amp; Higher Secondary</div>
            </div>

            {/* Card 2 */}
            <div className="overview-stat-card">
              <div className="stat-card-header">
                <span className="card-label">PUBLISHED PAPERS</span>
                <div className="stat-icon-circle emerald">✓</div>
              </div>
              <div className="overview-number stat-number-emerald">
                {stats.upcomingCount} Approved
              </div>
              <div className="sub-text">First Paper: 12 March 2026</div>
            </div>

            {/* Card 3 */}
            <div className="overview-stat-card">
              <div className="stat-card-header">
                <span className="card-label">EXAMINATION HALLS</span>
                <div className="stat-icon-circle purple">🏛️</div>
              </div>
              <div className="overview-number">
                {stats.hallsAllocated} Halls
              </div>
              <div className="sub-text">Auditorium &amp; Main Block</div>
            </div>

            {/* Card 4 */}
            <div className="overview-stat-card">
              <div className="stat-card-header">
                <span className="card-label">INVIGILATION CADRE</span>
                <div className="stat-icon-circle blue">👥</div>
              </div>
              <div className="overview-number stat-number-blue">
                {stats.invigilatorCadre} Staff
              </div>
              <div className="sub-text">Assigned Chief &amp; Observers</div>
            </div>
          </div>

          {/* Action Header Banner */}
          <section className="student-header-banner">
            <div className="registry-title-left">
              <div className="registry-icon-badge">📅</div>
              <div className="registry-title-text">
                <h1>Examination Timetable &amp; Seating Registry</h1>
                <p>
                  Official Kerala General Education Board terminal examination
                  schedules, question paper codes, hall allotments &amp;
                  invigilation rosters.
                </p>
              </div>
            </div>

            <div className="registry-controls-right">
              {/* Search Box */}
              <div className="search-input-wrapper">
                <span className="search-input-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search subject, QP code, hall..."
                  className="registry-search-input"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Term Filter */}
              <select
                className="registry-select-dropdown"
                value={selectedTerm}
                onChange={(e) => {
                  setSelectedTerm(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Examination Terms</option>
                <option value="SSLC Board Examination">
                  SSLC Board Examination 2026
                </option>
                <option value="Plus Two Higher Secondary">
                  Plus Two Higher Secondary 2026
                </option>
                <option value="High School Annual">
                  High School Annual Evaluation (8 &amp; 9)
                </option>
              </select>

              {/* Standard & Academic Wing Filter across Classes 1 to 12 */}
              <select
                className="registry-select-dropdown"
                value={selectedStandard}
                onChange={(e) => {
                  setSelectedStandard(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Standards &amp; Wings (Classes 1 to 12)</option>
                <optgroup label="High School (Classes 8 to 10)">
                  <option value="Standard 10">Standard 10 (SSLC Cadre)</option>
                  <option value="Standard 9">Standard 9</option>
                  <option value="Standard 8">Standard 8</option>
                </optgroup>
                <optgroup label="Higher Secondary (Classes 11 & 12)">
                  <option value="Standard 12">Standard 12 (Plus Two Higher Secondary)</option>
                  <option value="Standard 11">Standard 11 (Plus One Board Evaluation)</option>
                </optgroup>
                <optgroup label="Upper Primary (Classes 5 to 7)">
                  <option value="Standard 7">Class 7 (UP Evaluation)</option>
                  <option value="Standard 6">Class 6 (UP Evaluation)</option>
                  <option value="Standard 5">Class 5 (UP Evaluation)</option>
                </optgroup>
                <optgroup label="Lower Primary (Classes 1 to 4)">
                  <option value="Standard 4">Class 4 (LP Primary Evaluation)</option>
                  <option value="Standard 3">Class 3 (LP Primary Evaluation)</option>
                  <option value="Standard 2">Class 2 (LP Primary Evaluation)</option>
                  <option value="Standard 1">Class 1 (LP Primary Evaluation)</option>
                </optgroup>
              </select>

              {/* Add Exam Schedule Button */}
              <button
                className="btn-new-admission"
                onClick={openAddExamModal}
              >
                <span>📅+</span> Schedule Exam
              </button>
            </div>
          </section>

          {/* Timetable Registry Table View */}
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
              Loading Examination Timetables &amp; Session Schedules...
            </div>
          ) : paginatedExams.length === 0 ? (
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
              No matching examination schedules found.
            </div>
          ) : (
            <div className="exam-table-container">
              <table className="exam-registry-table">
                <thead>
                  <tr>
                    <th>Date &amp; Day</th>
                    <th>Time &amp; Duration</th>
                    <th>Standard / Cadre</th>
                    <th>Subject &amp; QP Code</th>
                    <th>Exam Halls &amp; Capacity</th>
                    <th>Chief Invigilator</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExams.map((exam) => {
                    const isPublished = exam.status === "Approved & Published";
                    return (
                      <tr key={exam._id}>
                        {/* Date & Day */}
                        <td>
                          <div className="exam-date-cell">
                            <span className="exam-date-primary">
                              {exam.date.split(",")[0] || exam.date}
                            </span>
                            <span className="exam-date-subtext">
                              {exam.date.split(",")[1] || "Session Day"}
                            </span>
                          </div>
                        </td>

                        {/* Time & Duration */}
                        <td>
                          <div className="exam-time-primary">
                            {exam.startTime} – {exam.endTime}
                          </div>
                          <div className="exam-duration-subtext">
                            {exam.duration || "2 hrs 45 mins"}
                          </div>
                        </td>

                        {/* Standard */}
                        <td>
                          <span className="exam-standard-badge">
                            {exam.standard}
                          </span>
                        </td>

                        {/* Subject & QP Code */}
                        <td>
                          <div className="exam-subject-title">
                            {exam.subject}
                          </div>
                          <div className="exam-subject-meta">
                            <span className="exam-qp-badge">
                              QP: {exam.qpCode}
                            </span>
                            <span className="exam-marks-meta">
                              Max: {exam.maxMarks || 80} | Pass:{" "}
                              {exam.passMarks || 24}
                            </span>
                          </div>
                        </td>

                        {/* Exam Halls */}
                        <td>
                          <div className="exam-hall-primary">{exam.hall}</div>
                          <div className="exam-candidates-meta">
                            👥 {exam.totalCandidates} Candidates
                          </div>
                        </td>

                        {/* Invigilators */}
                        <td>
                          <div className="exam-invigilator-text">
                            {exam.invigilator || "Cadre Teacher"}
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={
                              isPublished
                                ? "exam-status-published"
                                : "exam-status-draft"
                            }
                          >
                            <span className="status-dot"></span>
                            {exam.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: "right" }}>
                          <div
                            className="exam-actions-cell"
                            style={{ justifyContent: "flex-end" }}
                          >
                            <button
                              type="button"
                              className="btn-seating-action"
                              onClick={() => openSeatingModal(exam)}
                              title="View Hall Seating Plan & Candidate Range"
                            >
                              Seating Plan
                            </button>
                            <button
                              type="button"
                              className="btn-exam-edit"
                              onClick={() => openEditExamModal(exam)}
                              title="Edit Exam Session"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn-exam-delete"
                              onClick={() => handleDeleteExam(exam)}
                              title="Delete Schedule"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Controls & Pagination */}
          <div className="student-table-footer">
            <div className="footer-count-text">
              Showing{" "}
              <strong>
                {totalExamCount > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
                {Math.min(currentPage * pageSize, totalExamCount)}
              </strong>{" "}
              of <strong>{totalExamCount}</strong> examination sessions
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-wrapper">
                <button
                  className="page-btn-arrow"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      className={`page-num-btn ${
                        currentPage === p ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  className="page-btn-arrow"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                >
                  ›
                </button>
              </div>
            )}

            {/* CSV / PDF Export Link */}
            <button
              className="export-roster-link"
              onClick={handleExportCSV}
              style={{ background: "transparent", border: "none", cursor: "pointer" }}
            >
              Export Official Sampoorna Exam Timetable (CSV) ⤓
            </button>
          </div>
        </main>
      </div>

      {/* =========================================================================
          MODAL 1: SCHEDULE EXAM (ADD / EDIT)
          ========================================================================= */}
      {isScheduleModalOpen && (
        <div className="modal-backdrop">
          <div
            className="modal-container"
            style={{ maxWidth: "720px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                {editingExam
                  ? "Edit Examination Session"
                  : "Schedule New Examination Session"}
              </h2>
              <button className="modal-close-btn" onClick={closeScheduleModal}>
                ✕
              </button>
            </div>

            {feedback.message && (
              <div
                style={{
                  margin: "12px 24px 0 24px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  background:
                    feedback.type === "success" ? "#dcfce7" : "#fee2e2",
                  color: feedback.type === "success" ? "#166534" : "#991b1b",
                }}
              >
                {feedback.message}
              </div>
            )}

            <form onSubmit={handleSaveExam} className="modal-form-body">
              {/* Row 1: Exam Term & Standard */}
              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label">Examination Term / Board</label>
                  <select
                    className="form-input"
                    value={formData.term}
                    onChange={(e) =>
                      setFormData({ ...formData, term: e.target.value })
                    }
                    required
                  >
                    <option value="SSLC Board Examination March 2026">
                      SSLC Board Examination March 2026
                    </option>
                    <option value="Plus Two Higher Secondary Board Examination 2026">
                      Plus Two Higher Secondary Board Examination 2026
                    </option>
                    <option value="High School Annual Evaluation (Class 8 & 9)">
                      High School Annual Evaluation (Class 8 &amp; 9)
                    </option>
                    <option value="First Terminal Model Evaluation">
                      First Terminal Model Evaluation
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Standard</label>
                  <select
                    className="form-input"
                    value={formData.standard}
                    onChange={(e) =>
                      setFormData({ ...formData, standard: e.target.value })
                    }
                    required
                  >
                    <option value="Standard 10 (SSLC)">
                      Standard 10 (SSLC Cadre)
                    </option>
                    <option value="Standard 12 (Plus Two Science)">
                      Standard 12 (Plus Two Science)
                    </option>
                    <option value="Standard 12 (Plus Two Commerce)">
                      Standard 12 (Plus Two Commerce)
                    </option>
                    <option value="Standard 9">Standard 9</option>
                    <option value="Standard 8">Standard 8</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Subject & QP Code */}
              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label">Subject Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mathematics / Physics"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Question Paper Code (QP) *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. MAT-104 or PHY-105"
                    value={formData.qpCode}
                    onChange={(e) =>
                      setFormData({ ...formData, qpCode: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Row 3: Exam Date, Start Time & End Time */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Date of Exam *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 19 March 2026, Thu"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="09:30 AM"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="12:15 PM"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Row 4: Allocated Halls & Total Candidates */}
              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label">Allocated Exam Halls</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Halls 01, 02, 03, 04"
                    value={formData.hall}
                    onChange={(e) =>
                      setFormData({ ...formData, hall: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Candidates</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="242"
                    value={formData.totalCandidates}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalCandidates: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Row 5: Invigilators & Status */}
              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label">
                    Chief Invigilators / Observers
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mrs. Indu B Nair, Sri. George K."
                    value={formData.invigilator}
                    onChange={(e) =>
                      setFormData({ ...formData, invigilator: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Approval Status</label>
                  <select
                    className="form-input"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Approved & Published">
                      Approved &amp; Published
                    </option>
                    <option value="Draft / Scheduled">
                      Draft / Scheduled
                    </option>
                    <option value="Completed">Completed</option>
                    <option value="Postponed">Postponed</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Marks Breakdown */}
              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label">Maximum Marks</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="80"
                    value={formData.maxMarks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxMarks: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Minimum Pass Marks</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="24"
                    value={formData.passMarks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passMarks: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="form-group">
                <label className="form-label">Special Exam Instructions</label>
                <textarea
                  className="form-input"
                  rows="2"
                  placeholder="e.g. 15 minutes cool-off time provided before writing starts..."
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                ></textarea>
              </div>

              {/* Modal Footer Actions */}
              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeScheduleModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={formSubmitting}
                >
                  {formSubmitting
                    ? "Saving Schedule..."
                    : editingExam
                    ? "Update Schedule"
                    : "Save & Publish Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: SEATING PLAN & HALL ALLOTMENT
          ========================================================================= */}
      {isSeatingModalOpen && activeSeatingExam && (
        <div className="modal-backdrop">
          <div
            className="modal-container"
            style={{ maxWidth: "780px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="modal-header">
              <div>
                <h2 className="modal-title">
                  Hall Seating &amp; Invigilation Plan
                </h2>
                <p style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>
                  {activeSeatingExam.subject} ({activeSeatingExam.qpCode}) •{" "}
                  {activeSeatingExam.date} ({activeSeatingExam.startTime} –{" "}
                  {activeSeatingExam.endTime})
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsSeatingModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              {/* Top Banner with Quick Summary */}
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#1e3a8a",
                    }}
                  >
                    Standard / Cadre: {activeSeatingExam.standard}
                  </div>
                  <div style={{ fontSize: "12px", color: "#3b82f6" }}>
                    Total Registered Candidates:{" "}
                    <strong>{activeSeatingExam.totalCandidates} Students</strong>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      background: "#1d4ed8",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: "800",
                      padding: "4px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    15 Min Cool-off Active
                  </span>
                </div>
              </div>

              {/* Seating Cards Grid */}
              <div className="seating-plan-grid">
                {(activeSeatingExam.seatingPlan &&
                activeSeatingExam.seatingPlan.length > 0
                  ? activeSeatingExam.seatingPlan
                  : [
                      {
                        hallNumber: "Hall 01",
                        roomName: "Room 101 - Main Academic Block",
                        rollRange: "ADM-14920 to ADM-14960",
                        candidateCount: 40,
                        invigilatorName: "Mrs. Indu B Nair",
                        invigilatorPen: "849201",
                      },
                      {
                        hallNumber: "Hall 02",
                        roomName: "Room 102 - Main Academic Block",
                        rollRange: "ADM-14961 to ADM-15000",
                        candidateCount: 40,
                        invigilatorName: "Sri. George K.",
                        invigilatorPen: "849202",
                      },
                    ]
                ).map((hall, idx) => (
                  <div className="seating-hall-card" key={idx}>
                    <div className="seating-hall-header">
                      <span className="seating-hall-badge">
                        {hall.hallNumber}
                      </span>
                      <span className="seating-candidate-count">
                        👥 {hall.candidateCount} Candidates
                      </span>
                    </div>

                    <div className="seating-room-name">{hall.roomName}</div>

                    <div className="seating-roll-range">
                      <strong>Seated Roll Range:</strong> {hall.rollRange}
                    </div>

                    <div className="seating-invigilator-box">
                      <span className="seating-invigilator-label">
                        Invigilator:
                      </span>
                      <span className="seating-invigilator-value">
                        {hall.invigilatorName}{" "}
                        <span style={{ color: "#64748b" }}>
                          (PEN: {hall.invigilatorPen})
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* State Board Compliance Box */}
              <div
                style={{
                  marginTop: "20px",
                  background: "#f8fafc",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  fontSize: "12px",
                  color: "#475569",
                  lineHeight: "1.5",
                }}
              >
                <strong>Government Examination Instructions:</strong> Question
                booklet seal verification must take place in the presence of 2
                student candidates at 09:25 AM. Answer booklets must be signed &amp;
                numbered by the invigilator before 10:00 AM.
              </div>

              {/* Modal Actions */}
              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsSeatingModalOpen(false)}
                >
                  Close Plan
                </button>
                <button
                  type="button"
                  className="btn-submit"
                  onClick={() => window.print()}
                >
                  🖨️ Print Seating Chart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
