import { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../api/axiosclient";
import "../../Styles/AdminDash.css";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import ExamStatsCards from "../../components/admin/exams/ExamStatsCards";
import ExamScheduleModal from "../../components/admin/exams/ExamScheduleModal";
import ExamSeatingModal from "../../components/admin/exams/ExamSeatingModal";
import ExamFilterHeader from "../../components/admin/exams/ExamFilterHeader";
import ExamTimetableTable from "../../components/admin/exams/ExamTimetableTable";
import { useExamForm } from "../../components/admin/exams/useExamForm";
import { exportExamTimetableCsv } from "../../utils/examCsvExport";

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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Seating Plan Modal State
  const [isSeatingModalOpen, setIsSeatingModalOpen] = useState(false);
  const [activeSeatingExam, setActiveSeatingExam] = useState(null);

  // Fetch Exam Timetables
  const fetchExams = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Hook for Exam Form (Add / Edit / Delete / Complete)
  const {
    isScheduleModalOpen,
    editingExam,
    formData,
    setFormData,
    formSubmitting,
    feedback,
    openAddExamModal,
    openEditExamModal,
    closeScheduleModal,
    handleSaveExam,
    handleDeleteExam,
    handleMarkExamCompleted,
  } = useExamForm({ fetchExams });

  // Filter & Search Logic
  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const q = searchQuery.toLowerCase();
      const examNameStr = (e.examName || e.term || "").toLowerCase();
      const matchSearch =
        e.subject.toLowerCase().includes(q) ||
        e.qpCode.toLowerCase().includes(q) ||
        e.standard.toLowerCase().includes(q) ||
        examNameStr.includes(q) ||
        (e.hall && e.hall.toLowerCase().includes(q)) ||
        (e.invigilator && e.invigilator.toLowerCase().includes(q));

      const matchTerm =
        selectedTerm === "All" ||
        examNameStr.includes(selectedTerm.toLowerCase());

      const matchStd =
        selectedStandard === "All" ||
        e.standard.toLowerCase().includes(selectedStandard.toLowerCase());

      return matchSearch && matchTerm && matchStd;
    });
  }, [exams, searchQuery, selectedTerm, selectedStandard]);

  // Pagination Logic
  const totalExamCount = filteredExams.length;
  const totalPages = Math.ceil(totalExamCount / pageSize) || 1;
  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExams.slice(start, start + pageSize);
  }, [filteredExams, currentPage]);

  // Open Seating Plan Modal
  const openSeatingModal = async (exam) => {
    setActiveSeatingExam(exam);
    setIsSeatingModalOpen(true);
    try {
      const res = await api.get(`/admin/exams/${exam._id}/seating`);
      if (res.data.success) {
        setActiveSeatingExam((prev) => ({
          ...prev,
          seatingPlan: res.data.seatingPlan || [],
        }));
      }
    } catch (err) {
      console.error("Error loading seating plan:", err);
    }
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
          <ExamFilterHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTerm={selectedTerm}
            setSelectedTerm={setSelectedTerm}
            selectedStandard={selectedStandard}
            setSelectedStandard={setSelectedStandard}
            setCurrentPage={setCurrentPage}
            openAddExamModal={openAddExamModal}
          />

          {/* Timetable Registry Table View */}
          <ExamTimetableTable
            loading={loading}
            paginatedExams={paginatedExams}
            handleMarkExamCompleted={handleMarkExamCompleted}
            openSeatingModal={openSeatingModal}
            openEditExamModal={openEditExamModal}
            handleDeleteExam={handleDeleteExam}
          />

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

            {/* CSV Export Link */}
            <button
              className="export-roster-link"
              onClick={() => exportExamTimetableCsv(exams)}
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
