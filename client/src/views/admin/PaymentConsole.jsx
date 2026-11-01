import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosclient";
import { clearAuthSession } from "../../utils/auth";
import "../../Styles/AdminDash.css";
import { ACADEMIC_WINGS, ALL_CLASSES } from "../../utils/classData";

export default function PaymentConsole() {
  const navigate = useNavigate();

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
    paymentMode: "UPI / Online (Google Pay / PhonePe)",
    transactionReference: "",
    dueDate: "2026-11-20",
    remarks: "",
    collectedBy: "Accounts Desk / Sri. R. Krishnan",
  };

  const [paymentForm, setPaymentForm] = useState(initialForm);

  // Logout handler
  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

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
    let derivedWing;
    const c = student.classDivision || "";
    if (c.includes("11") || c.includes("12") || c.includes("+1") || c.includes("+2")) {
      derivedWing = "Higher Secondary";
    } else if (c.includes("8") || c.includes("9") || c.includes("10")) {
      derivedWing = "High School";
    } else if (c.includes("5") || c.includes("6") || c.includes("7")) {
      derivedWing = "UP School";
    } else {
      derivedWing = "LP School";
    }

    setPaymentForm((prev) => ({
      ...prev,
      studentName: student.name,
      admissionNumber: student.admissionNumber || "",
      rollNumber: student.rollNumber || "",
      classDivision: student.classDivision || "Class 10-A",
      wing: derivedWing,
    }));
    setStudentSearchQuery("");
  };

  // Open Record Modal (Create or Edit)
  const handleOpenRecordModal = (paymentToEdit = null) => {
    if (paymentToEdit) {
      setEditingPayment(paymentToEdit);
      setPaymentForm({
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

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
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
            <button className="console-nav-item" onClick={() => navigate("/admin/dashboard")}>
              <span>▦</span> Overview and Dashboard
            </button>
            <button className="console-nav-item" onClick={() => navigate("/admin/attendance")}>
              <span>👥</span> Division wise Attendance
            </button>
            <button className="console-nav-item" onClick={() => navigate("/admin/teachers")}>
              <span>🗂</span> Teachers Records
            </button>
            <button className="console-nav-item" onClick={() => navigate("/admin/students")}>
              <span>🎓</span> Students Records
            </button>
            <button className="console-nav-item" onClick={() => navigate("/admin/exams")}>
              <span>📅</span> Exam Timetables
            </button>
            <button className="console-nav-item active">
              <span>💳</span> Fee & Payments Console
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
            <p className="profile-role-subtext">Headmaster &amp; Chief Admin</p>
            <p className="profile-id-code">ADM-GHSS-01 • PEN: 849201</p>
          </div>
          <button
            className="logout-icon-btn"
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign Out"
          >
            🚪
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
      <div className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-header">
          <div className="header-breadcrumbs">
            <span>Admin Console</span> / <span>Accounts & Finance</span> /{" "}
            <strong>Fee & Payments Console</strong>
          </div>
          <div className="header-actions-group">
            <button className="btn-secondary-action" onClick={handleExportCSV}>
              📥 Export Ledger CSV
            </button>
            <button className="btn-primary-action" onClick={() => handleOpenRecordModal()}>
              + Record Student Payment
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content-area">
          {/* Hero Banner Card */}
          <section className="headmaster-hero-card" style={{ marginBottom: "22px" }}>
            <div className="badge-row">
              <span className="badge-governance">TREASURY & FEE MANAGEMENT DECK</span>
              <span className="badge-sync">🟢 Kerala Pareeksha Bhavan Integrated</span>
            </div>
            <h1>Student Fee & Payment Console</h1>
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

          {/* ---------------- 5 TOP KPI SUMMARY CARDS ---------------- */}
          <div className="payment-kpi-grid">
            {/* Card 1: Total Collections */}
            <div className="payment-kpi-card total-collection">
              <div className="kpi-icon-row">
                <span className="kpi-label">TOTAL COLLECTIONS</span>
                <span className="kpi-badge rate">{summary.collectionRate} Collected</span>
              </div>
              <div className="kpi-amount">{formatINR(summary.totalCollected)}</div>
              <div className="kpi-subtext">Total Invoiced: {formatINR(summary.totalBilled)}</div>
            </div>

            {/* Card 2: Pending Dues */}
            <div className="payment-kpi-card pending-dues">
              <div className="kpi-icon-row">
                <span className="kpi-label">PENDING STUDENT DUES</span>
                <span className="kpi-badge due">Action Required</span>
              </div>
              <div className="kpi-amount text-red">{formatINR(summary.totalDue)}</div>
              <div className="kpi-subtext">Outstanding fees awaiting settlement</div>
            </div>

            {/* Card 3: Bus Fee Collection */}
            <div className="payment-kpi-card bus-fee">
              <div className="kpi-icon-row">
                <span className="kpi-label">BUS FEE (FLEET 1-5)</span>
                <span className="kpi-badge bus">Transport</span>
              </div>
              <div className="kpi-amount text-blue">{formatINR(summary.busFee?.collected)}</div>
              <div className="kpi-subtext">Pending: {formatINR(summary.busFee?.due)} • 5 Active Routes</div>
            </div>

            {/* Card 4: Annual / Tuition Fee */}
            <div className="payment-kpi-card annual-fee">
              <div className="kpi-icon-row">
                <span className="kpi-label">ANNUAL & TUITION</span>
                <span className="kpi-badge annual">Govt Approved</span>
              </div>
              <div className="kpi-amount text-teal">{formatINR(summary.annualFee?.collected)}</div>
              <div className="kpi-subtext">Pending: {formatINR(summary.annualFee?.due)} • Composite Term</div>
            </div>

            {/* Card 5: PTA Fund */}
            <div className="payment-kpi-card pta-fund">
              <div className="kpi-icon-row">
                <span className="kpi-label">PTA & WELFARE FUND</span>
                <span className="kpi-badge pta">PTA Executive</span>
              </div>
              <div className="kpi-amount text-purple">{formatINR(summary.ptaFund?.collected)}</div>
              <div className="kpi-subtext">Development & Student Welfare Reserve</div>
            </div>
          </div>

          {/* ---------------- 4 WING PROGRESS OVERVIEW ---------------- */}
          <div className="wing-collection-strip">
            {Object.entries(summary.wingStats || {}).map(([wingName, wData]) => {
              const rate = wData.total > 0 ? Math.round((wData.collected / wData.total) * 100) : 0;
              return (
                <div key={wingName} className="wing-progress-pill-card">
                  <div className="wing-header-line">
                    <span className="wing-pill-title">{wingName}</span>
                    <span className="wing-pill-rate">{rate}%</span>
                  </div>
                  <div className="wing-bar-wrapper">
                    <div className="wing-bar-fill" style={{ width: `${rate}%` }}></div>
                  </div>
                  <div className="wing-footer-line">
                    <span>{formatINR(wData.collected)}</span>
                    <span className="text-muted">Due: {formatINR(wData.due)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---------------- CONTROLS & FILTERS BAR ---------------- */}
          <div className="payment-controls-card">
            {/* Search Input */}
            <div className="search-field-box">
              <span className="search-icon">🔍</span>
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
                <option value="Bus Fee">🚌 Bus Fee (School Transport)</option>
                <option value="Annual Fee">📚 Annual Composite Tuition</option>
                <option value="PTA Fund">🤝 PTA Welfare & Development</option>
                <option value="Lab & Computer Fee">💻 IT Lab & Science Practicals</option>
                <option value="Special / Exam Fee">📝 Special / Examination Fee</option>
                <option value="Sports & Library">⚽ Sports & Library Club</option>
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
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>💳</div>
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
                          <div className="class-div-pill">{p.classDivision}</div>
                          <div className="wing-tag-sub">{p.wing}</div>
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
                              📄
                            </button>
                            <button
                              type="button"
                              className="btn-action-edit"
                              title="Edit / Record Balance Payment"
                              onClick={() => handleOpenRecordModal(p)}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="btn-action-delete"
                              title="Delete Record"
                              onClick={() => handleDeletePayment(p._id, p.receiptNumber)}
                            >
                              🗑️
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

      {/* =========================================================
         MODAL 1: RECORD OR EDIT STUDENT PAYMENT
         ========================================================= */}
      {isRecordModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRecordModalOpen(false)}>
          <div
            className="modal-content-card modal-lg"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "720px" }}
          >
            {/* Modal Header */}
            <div className="modal-header-row">
              <div>
                <h3>{editingPayment ? "Edit Payment Record" : "Record Student Fee Payment"}</h3>
                <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0 }}>
                  GHSS Rajakkad • Official Accounts & Revenue Counter
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsRecordModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePayment}>
              <div className="modal-form-body">
                {/* Student Search & Quick Autocomplete */}
                {!editingPayment && (
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label>Quick Student Autocomplete (Search by Name or Admission #):</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        placeholder="Type student name (e.g., Anandhu, Aparna, Alan)..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                      />
                      {filteredStudentsForLookup.length > 0 && (
                        <div className="autocomplete-dropdown">
                          {filteredStudentsForLookup.map((st) => (
                            <div
                              key={st._id}
                              className="autocomplete-item"
                              onClick={() => handleSelectStudent(st)}
                            >
                              <strong>{st.name}</strong>
                              <span style={{ fontSize: "11px", color: "#64748b" }}>
                                {st.admissionNumber} • {st.classDivision}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Student Full Name *</label>
                    <input
                      type="text"
                      required
                      value={paymentForm.studentName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, studentName: e.target.value })}
                      placeholder="e.g. Anandhu Saji"
                    />
                  </div>
                  <div className="form-group">
                    <label>Admission Number *</label>
                    <input
                      type="text"
                      required
                      value={paymentForm.admissionNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, admissionNumber: e.target.value })}
                      placeholder="e.g. ADM-14920"
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Class Division *</label>
                    <select
                      value={paymentForm.classDivision}
                      onChange={(e) => {
                        const val = e.target.value;
                        const derivedWing =
                          val.includes("11") || val.includes("12") || val.includes("+1") || val.includes("+2")
                            ? "Higher Secondary"
                            : val.includes("8") || val.includes("9") || val.includes("10")
                            ? "High School"
                            : val.includes("5") || val.includes("6") || val.includes("7")
                            ? "UP School"
                            : "LP School";
                        setPaymentForm({ ...paymentForm, classDivision: val, wing: derivedWing });
                      }}
                    >
                      {ALL_CLASSES.map((cls) => (
                        <option key={cls.id} value={cls.name}>
                          {cls.name} ({cls.stream})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Fee Category *</label>
                    <select
                      value={paymentForm.feeCategory}
                      onChange={(e) => setPaymentForm({ ...paymentForm, feeCategory: e.target.value })}
                    >
                      <option value="Bus Fee">🚌 Bus Fee (School Transport)</option>
                      <option value="Annual Fee">📚 Annual Composite Tuition</option>
                      <option value="PTA Fund">🤝 PTA Welfare & Development</option>
                      <option value="Lab & Computer Fee">💻 IT Lab & Science Practicals</option>
                      <option value="Special / Exam Fee">📝 Special / Examination Fee</option>
                      <option value="Sports & Library">⚽ Sports & Library Club</option>
                      <option value="Uniform & Books">🎒 Uniform & Textbooks</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label>Total Fee Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={paymentForm.totalAmount}
                      onChange={(e) => {
                        const tot = Number(e.target.value);
                        setPaymentForm({ ...paymentForm, totalAmount: tot });
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Amount Paid Now (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={paymentForm.amountPaid}
                      onChange={(e) => {
                        const paid = Number(e.target.value);
                        setPaymentForm({ ...paymentForm, amountPaid: paid });
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Balance Due (₹)</label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={formatINR(Math.max(0, (paymentForm.totalAmount || 0) - (paymentForm.amountPaid || 0)))}
                      style={{
                        backgroundColor: "#f8fafc",
                        fontWeight: "700",
                        color:
                          (paymentForm.totalAmount || 0) - (paymentForm.amountPaid || 0) > 0 ? "#b91c1c" : "#15803d",
                      }}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Payment Mode *</label>
                    <select
                      value={paymentForm.paymentMode}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                    >
                      <option value="UPI / Online (Google Pay / PhonePe)">
                        📱 UPI / Online (Google Pay / PhonePe)
                      </option>
                      <option value="Net Banking">🌐 Net Banking / IMPS</option>
                      <option value="Cash at School Counter">💵 Cash at School Counter</option>
                      <option value="Bank Challan (SBT/SBI)">🏛 Bank Challan (SBI/SBT)</option>
                      <option value="Demand Draft">📜 Demand Draft (DD)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Transaction / Challan Reference #</label>
                    <input
                      type="text"
                      value={paymentForm.transactionReference}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                      placeholder="e.g. UPI/6294029402 or CHL-9402"
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Payment Date *</label>
                    <input
                      type="date"
                      required
                      value={paymentForm.paymentDate}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Term / Period</label>
                    <select
                      value={paymentForm.term}
                      onChange={(e) => setPaymentForm({ ...paymentForm, term: e.target.value })}
                    >
                      <option value="Term 1">Term 1</option>
                      <option value="Term 2">Term 2</option>
                      <option value="Term 3">Term 3</option>
                      <option value="Annual">Annual Composite</option>
                      <option value="Monthly Bus Pass">Monthly Bus Pass</option>
                      <option value="One-Time">One-Time Special</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Remarks / Notes (Route, Concessions, or Details)</label>
                  <input
                    type="text"
                    value={paymentForm.remarks}
                    onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                    placeholder="e.g. School Bus Route 03 - Rajakkad to Kallar • Month of October"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer-row">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsRecordModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-save" disabled={formSubmitting}>
                  {formSubmitting ? "Saving to DB..." : editingPayment ? "💾 Update Payment" : "💾 Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
         MODAL 2: OFFICIAL PRINTABLE KERALA GOVT RECEIPT
         ========================================================= */}
      {isReceiptModalOpen && viewingReceipt && (
        <div className="modal-overlay" onClick={() => setIsReceiptModalOpen(false)}>
          <div
            className="modal-content-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "680px", background: "#ffffff" }}
          >
            <div className="modal-header-row" style={{ borderBottom: "none", paddingBottom: "0" }}>
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => window.print()}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                🖨 Print Official Receipt
              </button>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsReceiptModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Official Kerala State Education Department Letterhead Format */}
            <div className="printable-receipt-container" id="printable-receipt">
              <div className="receipt-letterhead">
                <div className="receipt-govt-title">GOVERNMENT OF KERALA</div>
                <div className="receipt-dept-title">DEPARTMENT OF GENERAL EDUCATION</div>
                <div className="receipt-school-title">GOVERNMENT HIGHER SECONDARY SCHOOL, RAJAKKAD</div>
                <div className="receipt-sub-code">
                  School Code: 06042 • Idukki District, Kerala • Pin: 685566
                </div>
                <div className="receipt-type-banner">FEE PAYMENT ACKNOWLEDGEMENT RECEIPT</div>
              </div>

              <div className="receipt-meta-grid">
                <div>
                  <strong>Receipt No:</strong> {viewingReceipt.receiptNumber}
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>Date:</strong> {viewingReceipt.paymentDate}
                </div>
                <div>
                  <strong>Student Name:</strong> {viewingReceipt.studentName}
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>Adm No:</strong> {viewingReceipt.admissionNumber}
                </div>
                <div>
                  <strong>Class & Division:</strong> {viewingReceipt.classDivision} ({viewingReceipt.wing})
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>Roll No:</strong> {viewingReceipt.rollNumber || "-"}
                </div>
              </div>

              <table className="receipt-breakdown-table">
                <thead>
                  <tr>
                    <th>Fee Category & Particulars</th>
                    <th>Term</th>
                    <th style={{ textAlign: "right" }}>Total Fee</th>
                    <th style={{ textAlign: "right" }}>Paid Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>{viewingReceipt.feeCategory}</strong>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                        {viewingReceipt.remarks || "Standard approved fee schedule 2026-2027"}
                      </div>
                    </td>
                    <td>{viewingReceipt.term}</td>
                    <td style={{ textAlign: "right" }}>{formatINR(viewingReceipt.totalAmount)}</td>
                    <td style={{ textAlign: "right", fontWeight: "700" }}>{formatINR(viewingReceipt.amountPaid)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" style={{ textAlign: "right", fontWeight: "700" }}>
                      Total Received:
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "800", color: "#15803d", fontSize: "15px" }}>
                      {formatINR(viewingReceipt.amountPaid)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3" style={{ textAlign: "right", color: "#64748b" }}>
                      Balance Outstanding:
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: "700",
                        color: viewingReceipt.dueAmount > 0 ? "#b91c1c" : "#64748b",
                      }}
                    >
                      {formatINR(viewingReceipt.dueAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="receipt-payment-info-box">
                <div>
                  <strong>Payment Mode:</strong> {viewingReceipt.paymentMode}
                </div>
                {viewingReceipt.transactionReference && (
                  <div>
                    <strong>Ref / Txn ID:</strong> {viewingReceipt.transactionReference}
                  </div>
                )}
                <div>
                  <strong>Status:</strong>{" "}
                  <span style={{ color: viewingReceipt.status === "Paid" ? "#15803d" : "#b91c1c", fontWeight: "700" }}>
                    {viewingReceipt.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="receipt-footer-row">
                <div className="receipt-stamp-box">
                  <div className="official-stamp-circle">
                    <span>SAMPOORNA</span>
                    <strong>06042</strong>
                    <span>VERIFIED</span>
                  </div>
                </div>
                <div className="receipt-signature-box">
                  <div className="sig-line"></div>
                  <div className="sig-title">Sri. K. R. Madhavan</div>
                  <div className="sig-role">Headmaster & Accounts Officer</div>
                  <div className="sig-date">GHSS Rajakkad</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
