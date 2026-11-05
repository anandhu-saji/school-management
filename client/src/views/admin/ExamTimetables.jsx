import { useState, useEffect, useMemo } from "react";
import api from "../../api/axiosclient";
import "../../Styles/AdminDash.css";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import ExamStatsCards from "../../components/admin/exams/ExamStatsCards";
import ExamScheduleModal from "../../components/admin/exams/ExamScheduleModal";
import ExamSeatingModal from "../../components/admin/exams/ExamSeatingModal";

export default function ExamTimetables() {
  // State
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState({
    totalSchedules: 0,
    upcomingCount: 0,
    hallsAllocated: 0,
    invigilatorCadre: 0,
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
    return () => {
      isMounted = false;
    };
  }, []);

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
      <AdminSidebar activeNav="exams" />

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
      <div className="admin-main-wrapper">
        <AdminHeader />

        {/* Main Content Area */}
        <main className="admin-content-area">
          {/* Top 4 Summary Cards Grid */}
          <ExamStatsCards stats={stats} />

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
                              title="View Hall Seating Plan &amp; Candidate Range"
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

      {/* ---------------- MODALS ---------------- */}
      <ExamScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={closeScheduleModal}
        editingExam={editingExam}
        formData={formData}
        setFormData={setFormData}
        formSubmitting={formSubmitting}
        onSave={handleSaveExam}
        feedback={feedback}
      />

      <ExamSeatingModal
        isOpen={isSeatingModalOpen}
        onClose={() => setIsSeatingModalOpen(false)}
        activeSeatingExam={activeSeatingExam}
      />
    </div>
  );
}
