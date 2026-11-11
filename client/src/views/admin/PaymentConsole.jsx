import { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../api/axiosclient";
import "../../Styles/AdminDash.css";
import { ACADEMIC_WINGS, normalizeClassDivision, getAcademicWingForClass } from "../../utils/classData";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import PaymentStatsCards from "../../components/admin/payments/PaymentStatsCards";
import PaymentFormModal from "../../components/admin/payments/PaymentFormModal";
import PaymentReceiptModal from "../../components/admin/payments/PaymentReceiptModal";
import { validateHumanName } from "../../utils/nameValidator";

export default function PaymentConsole() {
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

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  const initialForm = {
    studentName: "",
    admissionNumber: "",
    rollNumber: "",
    classDivision: "Class 10-A",
    wing: "High School",
    feeCategory: "Bus Fee",
    academicYear: "2026-2027",
    term: "Term 1",
    totalAmount: 4500,
    amountPaid: 4500,
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: "Razorpay / Online",
    transactionReference: "",
    dueDate: "2026-11-20",
    remarks: "",
    collectedBy: "Accounts Desk / Sri. R. Krishnan",
  };

  const [paymentForm, setPaymentForm] = useState(initialForm);

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
      setFeedback({ type: "error", message: "Failed to connect to payments registry." });
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedCategory, selectedWing, selectedDivision, selectedStatus]);

  // Fetch student roster for modal autocomplete
  useEffect(() => {
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

  // Filtered students for autocomplete inside modal
  const filteredStudentsForLookup = useMemo(() => {
    if (!studentSearchQuery.trim()) return [];
    const query = studentSearchQuery.toLowerCase();
    return studentsList
      .filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(query)) ||
          (s.admissionNumber && s.admissionNumber.toLowerCase().includes(query)) ||
          (s.classDivision && s.classDivision.toLowerCase().includes(query))
      )
      .slice(0, 6);
  }, [studentSearchQuery, studentsList]);

  // Handle selecting a student in modal
  const handleSelectStudent = (student) => {
    const rawClass = student.classDivision || student.className || "Class 10-A";
    const norm = normalizeClassDivision(rawClass);
    const canonClass = norm ? norm.name : rawClass;
    const derivedWing = getAcademicWingForClass(canonClass);

    setPaymentForm((prev) => ({
      ...prev,
      studentId: student._id || null,
      studentName: student.name,
      admissionNumber: student.admissionNumber || "",
      rollNumber: student.rollNumber || "",
      classDivision: canonClass,
      wing: derivedWing,
    }));
    setStudentSearchQuery("");
  };

  // Open Record Modal (Create or Edit)
  const handleOpenRecordModal = (paymentToEdit = null) => {
    if (paymentToEdit) {
      setEditingPayment(paymentToEdit);
      setPaymentForm({
        studentId: paymentToEdit.studentId || null,
        studentName: paymentToEdit.studentName || "",
        admissionNumber: paymentToEdit.admissionNumber || "",
        rollNumber: paymentToEdit.rollNumber || "",
        classDivision: paymentToEdit.classDivision || "Class 10-A",
        wing: paymentToEdit.wing || "High School",
        feeCategory: paymentToEdit.feeCategory || "Bus Fee",
        academicYear: paymentToEdit.academicYear || "2026-2027",
        term: paymentToEdit.term || "Term 1",
        totalAmount: paymentToEdit.totalAmount || 0,
        amountPaid: paymentToEdit.amountPaid || 0,
        paymentDate: paymentToEdit.paymentDate || new Date().toISOString().split("T")[0],
        paymentMode: paymentToEdit.paymentMode || "UPI / Online (Google Pay / PhonePe)",
        transactionReference: paymentToEdit.transactionReference || "",
        dueDate: paymentToEdit.dueDate || "2026-11-20",
        remarks: paymentToEdit.remarks || "",
        collectedBy: paymentToEdit.collectedBy || "Accounts Desk / Sri. R. Krishnan",
      });
    } else {
      setEditingPayment(null);
      setPaymentForm(initialForm);
    }
    setStudentSearchQuery("");
    setIsRecordModalOpen(true);
  };

  // Open Receipt Modal
  const handleOpenReceiptModal = (payment) => {
    setViewingReceipt(payment);
    setIsReceiptModalOpen(true);
  };

  // Save payment (POST / PUT)
  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.studentName || !paymentForm.admissionNumber || !paymentForm.classDivision) {
      setFeedback({ type: "error", message: "Please fill in all mandatory student details." });
      return;
    }

    const nameCheck = validateHumanName(paymentForm.studentName, "Student name");
    if (nameCheck !== true) {
      setFeedback({ type: "error", message: nameCheck });
      return;
    }

    try {
      setFormSubmitting(true);
      setFeedback({ type: "", message: "" });

      if (editingPayment) {
        const res = await api.put(`/admin/payments/${editingPayment._id}`, paymentForm);
        if (res.data.success) {
          setFeedback({ type: "success", message: "Fee payment record updated successfully!" });
          setIsRecordModalOpen(false);
          fetchPayments();
        }
      } else {
        const res = await api.post("/admin/payments", paymentForm);
        if (res.data.success) {
          setFeedback({ type: "success", message: "New fee payment recorded into ledger!" });
          setIsRecordModalOpen(false);
          fetchPayments();
        }
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to save payment record.",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete payment
  const handleDeletePayment = async (id, receiptNo) => {
    if (!window.confirm(`Are you sure you want to delete payment record ${receiptNo}?`)) return;

    try {
      const res = await api.delete(`/admin/payments/${id}`);
      if (res.data.success) {
        setFeedback({ type: "success", message: `Receipt ${receiptNo} deleted from ledger.` });
        fetchPayments();
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to delete payment record.",
      });
    }
  };

  // Export ledger to CSV
  const handleExportCSV = () => {
    if (payments.length === 0) {
      alert("No payment records available to export.");
      return;
    }

    const headers = [
      "Receipt Number",
      "Date",
      "Student Name",
      "Admission Number",
      "Class Division",
      "Wing",
      "Fee Category",
      "Term",
      "Total Amount",
      "Amount Paid",
      "Due Amount",
      "Payment Mode",
      "Transaction Ref",
      "Status",
    ];

    const rows = payments.map((p) => [
      `"${p.receiptNumber}"`,
      `"${p.paymentDate}"`,
      `"${p.studentName}"`,
      `"${p.admissionNumber}"`,
      `"${p.classDivision}"`,
      `"${p.wing}"`,
      `"${p.feeCategory}"`,
      `"${p.term}"`,
      p.totalAmount,
      p.amountPaid,
      p.dueAmount,
      `"${p.paymentMode}"`,
      `"${p.transactionReference || ""}"`,
      `"${p.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GHSS_Fee_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <button className="btn-secondary-action" onClick={handleExportCSV}>
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
          <div className="payment-controls-card">
            {/* Search Input */}
            <div className="search-field-box">
              <span className="search-icon"></span>
              <input
                type="text"
                placeholder="Search by Student Name, Admission No, Receipt #, or UPI ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Wing Selector */}
            <div className="filter-dropdown-group">
              <label>Wing:</label>
              <select
                value={selectedWing}
                onChange={(e) => {
                  setSelectedWing(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Wings</option>
                <option value="LP School">Lower Primary (LP)</option>
                <option value="UP School">Upper Primary (UP)</option>
                <option value="High School">High School (HS)</option>
                <option value="Higher Secondary">Higher Secondary (HSS)</option>
              </select>
            </div>

            {/* Fee Category Selector */}
            <div className="filter-dropdown-group">
              <label>Fee Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Categories</option>
                <option value="Bus Fee">Bus Fee (School Transport)</option>
                <option value="Annual Fee">Annual Composite Tuition</option>
                <option value="PTA Fund">PTA Welfare &amp; Development</option>
                <option value="Lab &amp; Computer Fee">IT Lab &amp; Science Practicals</option>
                <option value="Special / Exam Fee">Special / Examination Fee</option>
                <option value="Sports &amp; Library">Sports &amp; Library Club</option>
              </select>
            </div>

            {/* Class / Division Selector */}
            <div className="filter-dropdown-group">
              <label>Division:</label>
              <select
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All 26 Divisions</option>
                {ACADEMIC_WINGS.map((wing) => (
                  <optgroup key={wing.code} label={wing.wing}>
                    {wing.classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.stream})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Status Filter Buttons */}
            <div className="payment-status-pills">
              {["All", "Paid", "Partial", "Pending"].map((st) => (
                <button
                  key={st}
                  className={`status-pill-btn ${selectedStatus === st ? "active" : ""} ${st.toLowerCase()}`}
                  onClick={() => {
                    setSelectedStatus(st);
                    setCurrentPage(1);
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* ---------------- PAYMENTS DATA TABLE ---------------- */}
          <div className="payment-table-container">
            <table className="payment-registry-table">
              <thead>
                <tr>
                  <th>Receipt # / Date</th>
                  <th>Student Info</th>
                  <th>Class / Division</th>
                  <th>Fee Category</th>
                  <th>Billed Amount</th>
                  <th>Amount Paid</th>
                  <th>Balance Due</th>
                  <th>Payment Mode</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: "40px" }}>
                      <div className="loading-spinner"></div>
                      <p style={{ marginTop: "12px", color: "#64748b", fontWeight: "600" }}>
                        Loading fee ledger from Sampoorna Database...
                      </p>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: "48px" }}>
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}></div>
                      <h4 style={{ color: "#0f172a", marginBottom: "4px" }}>No Payment Records Found</h4>
                      <p style={{ color: "#64748b", fontSize: "13px" }}>
                        No fee payments match your current search and filter criteria.
                      </p>
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => {
                    const isDue = (p.dueAmount || 0) > 0;
                    return (
                      <tr key={p._id} className={p.status === "Pending" ? "row-pending" : ""}>
                        {/* Receipt & Date */}
                        <td>
                          <div className="payment-receipt-badge">{p.receiptNumber}</div>
                          <div className="payment-date-sub">{p.paymentDate}</div>
                        </td>

                        {/* Student Info */}
                        <td>
                          <div className="student-name-bold">{p.studentName}</div>
                          <div className="student-adm-sub">Adm: {p.admissionNumber}</div>
                        </td>

                        {/* Class & Division */}
                        <td>
                          <div className="class-div-pill">{normalizeClassDivision(p.classDivision)?.name || p.classDivision}</div>
                          <div className="wing-tag-sub">{getAcademicWingForClass(p.classDivision) || p.wing}</div>
                        </td>

                        {/* Fee Category */}
                        <td>
                          <span className={`fee-cat-badge ${p.feeCategory.toLowerCase().replace(/[^a-z]/g, "")}`}>
                            {p.feeCategory}
                          </span>
                          <div className="fee-term-sub">{p.term}</div>
                        </td>

                        {/* Total Billed */}
                        <td className="amount-col">{formatINR(p.totalAmount)}</td>

                        {/* Amount Paid */}
                        <td className="amount-col font-bold text-green">{formatINR(p.amountPaid)}</td>

                        {/* Balance Due */}
                        <td className="amount-col">
                          {isDue ? (
                            <span className="due-amount-highlight text-red">{formatINR(p.dueAmount)}</span>
                          ) : (
                            <span className="text-muted" style={{ fontSize: "12px" }}>
                              Settled ✓
                            </span>
                          )}
                        </td>

                        {/* Mode & Reference */}
                        <td>
                          <div className="pay-mode-text">{p.paymentMode}</div>
                          {p.transactionReference && (
                            <div className="pay-ref-text">{p.transactionReference}</div>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ textAlign: "center" }}>
                          <span className={`payment-status-badge ${p.status.toLowerCase()}`}>
                            {p.status === "Paid" && "● Paid"}
                            {p.status === "Partial" && "◐ Partial"}
                            {p.status === "Pending" && "○ Pending"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: "center" }}>
                          <div className="payment-action-btns">
                            <button
                              type="button"
                              className="btn-action-view"
                              title="View Official Kerala Govt Fee Receipt"
                              onClick={() => handleOpenReceiptModal(p)}
                            >
                              Receipt
                            </button>
                            <button
                              type="button"
                              className="btn-action-edit"
                              title="Edit / Record Balance Payment"
                              onClick={() => handleOpenRecordModal(p)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn-action-delete"
                              title="Delete Record"
                              onClick={() => handleDeletePayment(p._id, p.receiptNumber)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="payment-pagination-bar">
                <div className="pagination-info">
                  Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalRecords} total
                  entries)
                </div>
                <div className="pagination-buttons">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    ← Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
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
