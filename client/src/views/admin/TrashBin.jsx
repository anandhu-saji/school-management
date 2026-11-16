import { useState, useEffect, useMemo } from "react";
import api from "../../api/axiosclient";
import "../../Styles/AdminDash.css";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { useConfirm } from "../../context/ConfirmContext";

export default function TrashBin() {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: {
      totalDeleted: 0,
      studentsCount: 0,
      teachersCount: 0,
      examsCount: 0,
      paymentsCount: 0,
    },
    students: [],
    teachers: [],
    exams: [],
    payments: [],
  });
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Fetch all trash records
  const fetchTrash = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/trash");
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to load trash records.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateStr);
    }
  };

  // Restore single item
  const handleRestore = async (type, id, label) => {
    try {
      setActionInProgress(true);
      const res = await api.post(`/admin/trash/${type}/${id}/restore`);
      if (res.data.success) {
        setFeedback({
          type: "success",
          message: res.data.message || `${label} restored successfully!`,
        });
        fetchTrash();
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || `Failed to restore ${label}.`,
      });
    } finally {
      setActionInProgress(false);
    }
  };

  // Permanently delete single item
  const handlePermanentDelete = async (type, id, label) => {
    const isConfirmed = await confirm({
      title: "Permanently Delete Record?",
      message: `Are you sure you want to PERMANENTLY delete "${label}"?`,
      subMessage: "WARNING: This action cannot be undone. The record will be permanently purged from the database.",
      confirmText: "Permanently Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!isConfirmed) return;

    try {
      setActionInProgress(true);
      const res = await api.delete(`/admin/trash/${type}/${id}`);
      if (res.data.success) {
        setFeedback({
          type: "success",
          message: res.data.message || `${label} permanently removed.`,
        });
        fetchTrash();
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || `Failed to delete ${label}.`,
      });
    } finally {
      setActionInProgress(false);
    }
  };

  // Restore all items
  const handleRestoreAll = async () => {
    if (data.summary.totalDeleted === 0) return;
    const isConfirmed = await confirm({
      title: "Restore All Records?",
      message: `Are you sure you want to restore all ${data.summary.totalDeleted} records from the Recycle Bin?`,
      subMessage: "All soft-deleted students, faculty, exams, and payment records will be restored to their active lists.",
      confirmText: "Yes, Restore All",
      cancelText: "Cancel",
      type: "info",
    });

    if (!isConfirmed) return;

    try {
      setActionInProgress(true);
      const res = await api.post("/admin/trash/restore-all");
      if (res.data.success) {
        setFeedback({
          type: "success",
          message: res.data.message || "All records restored successfully!",
        });
        fetchTrash();
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to restore records.",
      });
    } finally {
      setActionInProgress(false);
    }
  };

  // Empty trash permanently
  const handleEmptyTrash = async () => {
    if (data.summary.totalDeleted === 0) return;
    const isConfirmed = await confirm({
      title: "Permanently Empty Recycle Bin?",
      message: `WARNING: Are you sure you want to permanently EMPTY the Recycle Bin? All ${data.summary.totalDeleted} soft-deleted items will be wiped from MongoDB permanently.`,
      subMessage: "CRITICAL: This action cannot be reversed. All records will be erased completely.",
      confirmText: "Yes, Empty Recycle Bin",
      cancelText: "Keep in Bin",
      type: "danger",
    });

    if (!isConfirmed) return;

    try {
      setActionInProgress(true);
      const res = await api.delete("/admin/trash/empty");
      if (res.data.success) {
        setFeedback({
          type: "success",
          message: res.data.message || "Recycle bin emptied permanently.",
        });
        fetchTrash();
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to empty recycle bin.",
      });
    } finally {
      setActionInProgress(false);
    }
  };

  // Normalize all items into a unified list
  const unifiedItems = useMemo(() => {
    const items = [];

    (data.students || []).forEach((s) => {
      items.push({
        id: s._id,
        type: "student",
        typeName: "Student",
        typeBadgeClass: "badge-student",
        title: s.name,
        subtitle: `Adm: ${s.admissionNumber || s.studentId || "N/A"} | Roll #${s.rollNumber}`,
        details: s.classDivision || s.className || "Class 10-A",
        deletedAt: s.deletedAt,
        deletedBy: s.deletedBy,
      });
    });

    (data.teachers || []).forEach((t) => {
      items.push({
        id: t._id,
        type: "teacher",
        typeName: "Faculty",
        typeBadgeClass: "badge-teacher",
        title: t.name,
        subtitle: `PEN: ${t.penNumber || t.pen || "N/A"} | ${t.designation || "Faculty"}`,
        details: `${t.department || "Core"} | ${t.assignedClass || "General"}`,
        deletedAt: t.deletedAt,
        deletedBy: t.deletedBy,
      });
    });

    (data.exams || []).forEach((e) => {
      items.push({
        id: e._id,
        type: "exam",
        typeName: "Exam Paper",
        typeBadgeClass: "badge-exam",
        title: e.subject,
        subtitle: `QP Code: ${e.qpCode} | ${e.standard || "SSLC"}`,
        details: `${e.date} (${e.startTime || "09:30 AM"})`,
        deletedAt: e.deletedAt,
        deletedBy: e.deletedBy,
      });
    });

    (data.payments || []).forEach((p) => {
      items.push({
        id: p._id,
        type: "payment",
        typeName: "Fee Receipt",
        typeBadgeClass: "badge-payment",
        title: `Receipt #${p.receiptNumber}`,
        subtitle: `${p.studentName} (${p.admissionNumber})`,
        details: `${p.feeCategory} - ₹${p.totalAmount} (${p.status})`,
        deletedAt: p.deletedAt,
        deletedBy: p.deletedBy,
      });
    });

    // Sort by deletedAt desc
    return items.sort((a, b) => new Date(b.deletedAt || 0) - new Date(a.deletedAt || 0));
  }, [data]);

  // Filtered by active tab and search query
  const filteredItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      if (activeTab !== "all" && item.type !== activeTab) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.details.toLowerCase().includes(q)
      );
    });
  }, [unifiedItems, activeTab, searchQuery]);

  return (
    <div className="admin-layout">
      {/* ---------------- SIDEBAR ---------------- */}
      <AdminSidebar activeNav="trash" />

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
      <div className="admin-main-wrapper">
        <AdminHeader />

        <main className="admin-content-area">
          {/* Top 4 Summary Cards Grid */}
          <section className="admin-stats-grid" style={{ marginBottom: "24px" }}>
            <div className="admin-stat-card">
              <div className="stat-card-header">
                <span className="stat-label">TOTAL IN TRASH</span>
                <span className="stat-icon-wrap" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                  🗑
                </span>
              </div>
              <div className="stat-card-body">
                <span className="stat-value">{data.summary.totalDeleted}</span>
                <span className="stat-trend neutral">Recoverable</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-card-header">
                <span className="stat-label">STUDENTS</span>
                <span className="stat-icon-wrap" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                  🎓
                </span>
              </div>
              <div className="stat-card-body">
                <span className="stat-value">{data.summary.studentsCount}</span>
                <span className="stat-trend neutral">Archived files</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-card-header">
                <span className="stat-label">FACULTY STAFF</span>
                <span className="stat-icon-wrap" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                  👨‍🏫
                </span>
              </div>
              <div className="stat-card-body">
                <span className="stat-value">{data.summary.teachersCount}</span>
                <span className="stat-trend neutral">Deactivated</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-card-header">
                <span className="stat-label">EXAMS &amp; FEES</span>
                <span className="stat-icon-wrap" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                  📋
                </span>
              </div>
              <div className="stat-card-body">
                <span className="stat-value">
                  {data.summary.examsCount + data.summary.paymentsCount}
                </span>
                <span className="stat-trend neutral">Schedules &amp; Receipts</span>
              </div>
            </div>
          </section>

          {/* Feedback alert toast */}
          {feedback && (
            <div
              style={{
                padding: "12px 18px",
                marginBottom: "20px",
                borderRadius: "8px",
                backgroundColor: feedback.type === "error" ? "#fee2e2" : "#dcfce7",
                color: feedback.type === "error" ? "#991b1b" : "#166534",
                border: `1px solid ${feedback.type === "error" ? "#fca5a5" : "#86efac"}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{feedback.message}</span>
              <button
                onClick={() => setFeedback(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: "inherit",
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Header Banner */}
          <section className="student-header-banner">
            <div className="registry-title-left">
              <div className="registry-icon-badge">🗑</div>
              <div className="registry-title-text">
                <h1>Institutional Recycle Bin &amp; Soft-Deleted Archive</h1>
                <p>
                  Safeguarded records can be restored back to their active rosters or permanently purged by administrators.
                </p>
              </div>
            </div>

            <div className="registry-controls-right" style={{ gap: "10px" }}>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search in trash by name, ID, PEN, QP code..."
                  className="registry-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {data.summary.totalDeleted > 0 && (
                <>
                  <button
                    onClick={handleRestoreAll}
                    disabled={actionInProgress}
                    className="btn-new-admission"
                    style={{ background: "#10b981", borderColor: "#10b981" }}
                    title="Restore all items back to active rosters"
                  >
                    ↺ Restore All
                  </button>
                  <button
                    onClick={handleEmptyTrash}
                    disabled={actionInProgress}
                    className="btn-new-admission"
                    style={{ background: "#ef4444", borderColor: "#ef4444" }}
                    title="Permanently remove all deleted items"
                  >
                    ✕ Empty Trash
                  </button>
                </>
              )}
            </div>
          </section>

          {/* Category Tabs */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "16px",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "8px",
            }}
          >
            {[
              { id: "all", label: `All Records (${data.summary.totalDeleted})` },
              { id: "student", label: `Students (${data.summary.studentsCount})` },
              { id: "teacher", label: `Faculty (${data.summary.teachersCount})` },
              { id: "exam", label: `Exams (${data.summary.examsCount})` },
              { id: "payment", label: `Payments (${data.summary.paymentsCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: activeTab === tab.id ? "600" : "500",
                  backgroundColor: activeTab === tab.id ? "#1e293b" : "transparent",
                  color: activeTab === tab.id ? "#ffffff" : "#64748b",
                  transition: "all 0.2s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Records Table Card */}
          <div className="students-registry-card">
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                Loading soft-deleted records from archive...
              </div>
            ) : filteredItems.length === 0 ? (
              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🌿</div>
                <h3 style={{ fontSize: "18px", color: "#1e293b", marginBottom: "6px" }}>
                  Recycle Bin is Empty
                </h3>
                <p style={{ fontSize: "14px", maxWidth: "500px", margin: "0 auto" }}>
                  No soft-deleted records match the current filter. All student nominal rolls, faculty registers, exam timetables, and fee transactions are active.
                </p>
              </div>
            ) : (
              <table className="student-table">
                <thead>
                  <tr>
                    <th>TYPE</th>
                    <th>RECORD DETAILS</th>
                    <th>SCOPE / METADATA</th>
                    <th>DELETED DATE</th>
                    <th style={{ textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={`${item.type}-${item.id}`}>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            backgroundColor:
                              item.type === "student"
                                ? "#dbeafe"
                                : item.type === "teacher"
                                ? "#d1fae5"
                                : item.type === "exam"
                                ? "#fef3c7"
                                : "#ede9fe",
                            color:
                              item.type === "student"
                                ? "#1e40af"
                                : item.type === "teacher"
                                ? "#065f46"
                                : item.type === "exam"
                                ? "#92400e"
                                : "#5b21b6",
                          }}
                        >
                          {item.typeName}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: "600", color: "#1e293b" }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {item.subtitle}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "13px", color: "#334155" }}>
                          {item.details}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {formatDate(item.deletedAt)}
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            onClick={() => handleRestore(item.type, item.id, item.title)}
                            disabled={actionInProgress}
                            title="Restore record back to active roster"
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#10b981",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "500",
                              cursor: "pointer",
                            }}
                          >
                            ↺ Restore
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(item.type, item.id, item.title)}
                            disabled={actionInProgress}
                            title="Permanently remove from database"
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "500",
                              cursor: "pointer",
                            }}
                          >
                            ✕ Purge
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
