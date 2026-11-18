import { useState, useEffect, useCallback } from "react";
import api from "../../api/axiosclient";
import "../../Styles/AdminDash.css";
import { ACADEMIC_WINGS, fetchDynamicWings } from "../../utils/classData";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import PaymentStatsCards from "../../components/admin/payments/PaymentStatsCards";
import PaymentFormModal from "../../components/admin/payments/PaymentFormModal";
import PaymentReceiptModal from "../../components/admin/payments/PaymentReceiptModal";
import PaymentFilterBar from "../../components/admin/payments/PaymentFilterBar";
import PaymentTable from "../../components/admin/payments/PaymentTable";
import { usePaymentConsoleForm } from "../../components/admin/payments/usePaymentConsoleForm";
import { exportPaymentLedgerCsv } from "../../utils/paymentCsvExport";
import { useAlert } from "../../context/ConfirmContext";

export default function PaymentConsole() {
  const customAlert = useAlert();

  // Data states
  const [payments, setPayments] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [summary, setSummary] = useState({
    totalBilled: 0,
    totalCollected: 0,
    totalDue: 0,
    collectionRate: "0%",
    busFee: { collected: 0, due: 0 },
    annualFee: { collected: 0, due: 0 },
    ptaFund: { collected: 0, due: 0 },
    labFee: { collected: 0, due: 0 },
    otherFee: { collected: 0 },
    wingStats: {
      "LP School": { total: 0, collected: 0, due: 0, count: 0 },
      "UP School": { total: 0, collected: 0, due: 0, count: 0 },
      "High School": { total: 0, collected: 0, due: 0, count: 0 },
      "Higher Secondary": { total: 0, collected: 0, due: 0, count: 0 },
    },
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWing, setSelectedWing] = useState("All");
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [academicWings, setAcademicWings] = useState(ACADEMIC_WINGS);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch payments list with filters
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: debouncedSearch,
        category: selectedCategory,
        wing: selectedWing,
        division: selectedDivision,
        status: selectedStatus,
      });

      const res = await api.get(`/admin/payments?${params.toString()}`);
      if (res.data.success) {
        setPayments(res.data.payments || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
          setTotalRecords(res.data.pagination.totalRecords || 0);
        }
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedCategory, selectedWing, selectedDivision, selectedStatus]);

  // Fetch student roster for modal autocomplete & dynamic academic wings
  useEffect(() => {
    fetchDynamicWings(api).then((w) => {
      if (w) setAcademicWings(w);
    });

    const fetchStudentsForLookup = async () => {
      try {
        const res = await api.get("/admin/students?limit=200");
        if (res.data.success && res.data.students) {
          setStudentsList(res.data.students);
        }
      } catch (err) {
        console.error("Failed to load students for fee autocomplete:", err);
      }
    };
    fetchStudentsForLookup();
  }, []);

  // Fetch on filter or page changes
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Payment form hook
  const {
    isRecordModalOpen,
    setIsRecordModalOpen,
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    editingPayment,
    viewingReceipt,
    formSubmitting,
    feedback,
    setFeedback,
    studentSearchQuery,
    setStudentSearchQuery,
    filteredStudentsForLookup,
    paymentForm,
    setPaymentForm,
    handleSelectStudent,
    handleOpenRecordModal,
    handleOpenReceiptModal,
    handleSavePayment,
    handleDeletePayment,
  } = usePaymentConsoleForm({ fetchPayments, studentsList });

  // Helper formatting for currency
  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="admin-layout">
      {/* ---------------- SIDEBAR NAVIGATION ---------------- */}
      <AdminSidebar activeNav="payments" />

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
      <div className="admin-main-wrapper">
        <AdminHeader />

        {/* Content Area */}
        <main className="admin-content-area">
          {/* Header Action Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "18px",
            }}
          >
            <div className="header-breadcrumbs" style={{ fontSize: "13px" }}>
              <span>Admin Console</span> / <span>Accounts &amp; Finance</span> /{" "}
              <strong>Fee &amp; Payments Console</strong>
            </div>
            <div className="header-actions-group" style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-secondary-action"
                onClick={() => exportPaymentLedgerCsv(payments, customAlert)}
              >
                Export Ledger CSV
              </button>
              <button className="btn-primary-action" onClick={() => handleOpenRecordModal()}>
                + Record Student Payment
              </button>
            </div>
          </div>

          {/* Hero Banner Card */}
          <section className="headmaster-hero-card" style={{ marginBottom: "22px" }}>
            <div className="badge-row">
              <span className="badge-governance">TREASURY &amp; FEE MANAGEMENT DECK</span>
              <span className="badge-sync">Kerala Pareeksha Bhavan Integrated</span>
            </div>
            <h1>Student Fee &amp; Payment Console</h1>
            <p>
              GHSS Rajakkad • Centralized revenue collection desk for School Bus Fee, Annual Tuition,
              PTA Development Fund, Lab Charges, and Amenities across all 26 Academic Divisions.
            </p>
          </section>

          {/* Feedback alerts */}
          {feedback.message && (
            <div
              className={`feedback-alert ${feedback.type === "success" ? "alert-success" : "alert-error"}`}
              style={{
                marginBottom: "20px",
                padding: "12px 18px",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "13.5px",
                backgroundColor: feedback.type === "success" ? "#dcfce7" : "#fee2e2",
                color: feedback.type === "success" ? "#15803d" : "#b91c1c",
                border: feedback.type === "success" ? "1px solid #86efac" : "1px solid #fca5a5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{feedback.message}</span>
              <button
                type="button"
                onClick={() => setFeedback({ type: "", message: "" })}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "inherit",
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* ---------------- 5 TOP KPI & 4 WING PROGRESS CARDS ---------------- */}
          <PaymentStatsCards summary={summary} formatINR={formatINR} />

          {/* ---------------- CONTROLS & FILTERS BAR ---------------- */}
          <PaymentFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedWing={selectedWing}
            setSelectedWing={setSelectedWing}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedDivision={selectedDivision}
            setSelectedDivision={setSelectedDivision}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            academicWings={academicWings}
            setCurrentPage={setCurrentPage}
          />

          {/* ---------------- PAYMENTS DATA TABLE ---------------- */}
          <PaymentTable
            loading={loading}
            payments={payments}
            formatINR={formatINR}
            handleOpenReceiptModal={handleOpenReceiptModal}
            handleOpenRecordModal={handleOpenRecordModal}
            handleDeletePayment={handleDeletePayment}
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalRecords={totalRecords}
          />
        </main>
      </div>

      {/* ---------------- MODALS ---------------- */}
      <PaymentFormModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        editingPayment={editingPayment}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        formSubmitting={formSubmitting}
        onSave={handleSavePayment}
        studentSearchQuery={studentSearchQuery}
        setStudentSearchQuery={setStudentSearchQuery}
        filteredStudentsForLookup={filteredStudentsForLookup}
        onSelectStudent={handleSelectStudent}
        formatINR={formatINR}
      />

      <PaymentReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        viewingReceipt={viewingReceipt}
        formatINR={formatINR}
      />
    </div>
  );
}
