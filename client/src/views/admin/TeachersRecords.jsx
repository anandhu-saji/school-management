import { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../api/axiosclient";
import "../../Styles/AdminDash.css";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import TeacherStatsCards from "../../components/admin/teachers/TeacherStatsCards";
import TeacherAllotmentModal from "../../components/admin/teachers/TeacherAllotmentModal";
import TeacherDossierModal from "../../components/admin/teachers/TeacherDossierModal";
import TeacherFormModal from "../../components/admin/teachers/TeacherFormModal";
import TeacherAdmissionDelegationModal from "../../components/admin/teachers/TeacherAdmissionDelegationModal";
import TeacherFilterHeader from "../../components/admin/teachers/TeacherFilterHeader";
import TeacherCardsGrid from "../../components/admin/teachers/TeacherCardsGrid";
import { useTeacherForm } from "../../components/admin/teachers/useTeacherForm";
import { exportTeacherRosterCsv } from "../../utils/teacherCsvExport";

export default function TeachersRecords() {
  // State
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({
    totalFaculty: 0,
    permanentPosts: 0,
    onDutyStaff: 0,
    vacantPosts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Additional Modal States
  const [allotmentTeacher, setAllotmentTeacher] = useState(null);
  const [dossierTeacher, setDossierTeacher] = useState(null);
  const [delegationTeacher, setDelegationTeacher] = useState(null);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Teachers & Stats
  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim());
      }
      if (selectedDept && selectedDept !== "All") {
        params.append("department", selectedDept);
      }

      const res = await api.get(`/admin/teachers?${params.toString()}`);
      if (res.data.success) {
        setTeachers(res.data.teachers || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load teachers:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedDept]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Form hook
  const {
    isModalOpen,
    editingTeacher,
    isEmailVerified,
    setIsEmailVerified,
    activeModalTab,
    setActiveModalTab,
    formData,
    uploadingDoc,
    formSubmitting,
    feedback,
    openAddTeacherModal,
    openEditModal,
    closeModal,
    handleFormChange,
    handleDocumentUpload,
    handleRemoveDocument,
    handleFormSubmit,
    handleDeleteTeacher,
  } = useTeacherForm({ fetchTeachers });

  // Pagination Logic
  const totalFacultyCount = teachers.length;
  const totalPages = Math.ceil(totalFacultyCount / pageSize) || 1;
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return teachers.slice(start, start + pageSize);
  }, [teachers, currentPage]);

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
          <TeacherFilterHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedDept={selectedDept}
            setSelectedDept={setSelectedDept}
            setCurrentPage={setCurrentPage}
            openAddTeacherModal={openAddTeacherModal}
          />

          {/* Teacher Directory 3x2 Grid */}
          <TeacherCardsGrid
            loading={loading}
            paginatedTeachers={paginatedTeachers}
            setAllotmentTeacher={setAllotmentTeacher}
            setDossierTeacher={setDossierTeacher}
            setDelegationTeacher={setDelegationTeacher}
            openEditModal={openEditModal}
          />

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
              onClick={() => exportTeacherRosterCsv(teachers)}
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
        isEmailVerified={isEmailVerified}
        setIsEmailVerified={setIsEmailVerified}
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

      {/* =========================================================================
          MODAL 4: TEMPORARY ADMISSION ADMIN DELEGATION
          ========================================================================= */}
      <TeacherAdmissionDelegationModal
        teacher={delegationTeacher}
        isOpen={Boolean(delegationTeacher)}
        onClose={() => setDelegationTeacher(null)}
        onSaved={() => fetchTeachers()}
      />
    </div>
  );
}
