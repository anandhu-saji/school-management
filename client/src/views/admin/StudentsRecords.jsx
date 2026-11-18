import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import api from "../../api/axiosclient";
import "../../Styles/AdminDash.css";
import { ACADEMIC_WINGS, normalizeClassDivision, fetchDynamicWings } from "../../utils/classData";
import { getDocumentUrl } from "../../utils/documentUrl";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import StudentStatsCards from "../../components/admin/students/StudentStatsCards";
import StudentFilterBar from "../../components/admin/students/StudentFilterBar";
import StudentTable from "../../components/admin/students/StudentTable";
import StudentFormModal from "../../components/admin/students/StudentFormModal";
import StudentDossierModal from "../../components/admin/students/StudentDossierModal";
import useStudentForm from "../../components/admin/students/useStudentForm";
import exportStudentNominalRollCsv from "../../utils/studentCsvExport";
import { checkStudentAgeEligibility } from "../../utils/ageValidator";
import { validateHumanName } from "../../utils/nameValidator";
import { useConfirm } from "../../context/ConfirmContext";

export default function StudentsRecords({
  embedded = false,
  isTeacherView = false,
  teacherProfile = null,
}) {
  const confirm = useConfirm();
  const fileInputRef = useRef(null);
  const bcFileInputRef = useRef(null);

  // State
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    boysCount: 0,
    girlsCount: 0,
    class10Candidates: 0,
    plusTwoCount: 0,
    sampoornaVerified: "100%",
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [academicWings, setAcademicWings] = useState(ACADEMIC_WINGS);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [dossierStudent, setDossierStudent] = useState(null);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Students & Stats via Backend Search and Filters
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim());
      }
      if (selectedDivision && selectedDivision !== "All") {
        params.append("division", selectedDivision);
      }

      const res = await api.get(`/admin/students?${params.toString()}`);
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
  }, [debouncedSearch, selectedDivision]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchDynamicWings(api).then((w) => {
      if (w) setAcademicWings(w);
    });
  }, []);

  // Filter & Search Logic (powered by backend results)
  const filteredStudents = useMemo(() => {
    return students;
  }, [students]);

  // Pagination Logic
  const totalStudentsCount = filteredStudents.length;
  const totalPages = Math.ceil(totalStudentsCount / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  const {
    isModalOpen,
    editingStudent,
    activeModalTab,
    setActiveModalTab,
    formData,
    formSubmitting,
    uploadingIdProof,
    uploadingBcProof,
    isEmailVerified,
    setIsEmailVerified,
    openNewAdmissionModal,
    openEditModal,
    closeModal,
    handleFormChange,
    handleFileUpload,
    handleRemoveUploadedFile,
    handleFormSubmit,
    handleDeleteStudent,
  } = useStudentForm({
    students,
    fetchStudents,
    setFeedback,
    confirm,
    fileInputRef,
    bcFileInputRef,
  });

  // CSV Export (Full Government SSLC Nominal Roll)
  const handleExportCSV = () => {
    exportStudentNominalRollCsv(students);
  };

  if (isTeacherView && teacherProfile && !teacherProfile.isAdmissionAdminActive) {
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #fecaca",
          borderRadius: "14px",
          padding: "36px 24px",
          textAlign: "center",
          maxWidth: "600px",
          margin: "40px auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <span style={{ fontSize: "42px", display: "block", marginBottom: "12px" }}>🔒</span>
        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#991b1b", margin: "0 0 8px 0" }}>
          Admission Administrator Access Inactive
        </h3>
        <p style={{ fontSize: "13.5px", color: "#475569", lineHeight: "1.5", margin: 0 }}>
          Your temporary student admission administrator privileges are currently inactive or have expired.
          Temporary admission rights are only granted by the Headmaster during designated admission time periods.
        </p>
      </div>
    );
  }

  const registryMainContent = (
    <>
      {isTeacherView && teacherProfile && (
        <section
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
            color: "#ffffff",
            padding: "16px 22px",
            borderRadius: "14px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            boxShadow: "0 4px 12px rgba(37,99,235,0.15)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span
                style={{
                  background: "#10b981",
                  color: "#ffffff",
                  fontSize: "10.5px",
                  fontWeight: "800",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  letterSpacing: "0.5px",
                }}
              >
                TEMPORARY ADMISSION ADMIN ACTIVE
              </span>
              <span style={{ fontSize: "12px", opacity: 0.9 }}>
                Kerala General Education Dept. • Sampoorna Admission Officer
              </span>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: "800", margin: 0 }}>
              Authorized to Process Student Admissions
            </h3>
            <p style={{ fontSize: "12.5px", opacity: 0.9, margin: "4px 0 0 0" }}>
              Delegated by Headmaster for the admission period until{" "}
              <strong>
                {teacherProfile.admissionAdminEndDate
                  ? new Date(teacherProfile.admissionAdminEndDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "further notice"}
              </strong>
              {teacherProfile.admissionAdminNote ? ` (${teacherProfile.admissionAdminNote})` : ""}.
            </p>
          </div>

          <button
            type="button"
            className="btn-admission-primary"
            onClick={openNewAdmissionModal}
            style={{
              background: "#ffffff",
              color: "#1d4ed8",
              fontWeight: "800",
              fontSize: "13px",
              padding: "9px 18px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            + New Admission
          </button>
        </section>
      )}

      {/* Top 4 Summary Cards Grid */}
      <StudentStatsCards stats={stats} />

          <StudentFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setCurrentPage={setCurrentPage}
            selectedDivision={selectedDivision}
            setSelectedDivision={setSelectedDivision}
            academicWings={academicWings}
            openNewAdmissionModal={openNewAdmissionModal}
          />

          <StudentTable
            paginatedStudents={paginatedStudents}
            loading={loading}
            openEditModal={openEditModal}
            setDossierStudent={setDossierStudent}
            currentPage={currentPage}
            pageSize={pageSize}
            totalStudentsCount={totalStudentsCount}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            handleExportCSV={handleExportCSV}
          />

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
              Sampoorna Academic Management Platform v2.0 • Operational
            </div>
          </footer>
    </>
  );

  const modals = (
    <>
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
    </>
  );

  if (embedded) {
    return (
      <div className="embedded-students-registry" style={{ width: "100%" }}>
        {registryMainContent}
        {modals}
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* ---------------- SIDEBAR ---------------- */}
      <AdminSidebar activeNav="students" />

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
      <div className="admin-main-wrapper">
        <AdminHeader />

        {/* Main Content Area */}
        <main className="admin-content-area">
          {registryMainContent}
        </main>
      </div>

      {modals}
    </div>
  );
}
