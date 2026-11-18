import { useState, useEffect, useCallback } from "react";
import api from "../../api/axiosclient";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import "../../Styles/AdminDash.css";
import "../../Styles/Profile.css";

export default function AdminProfileRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Reject modal state
  const [rejectingRequest, setRejectingRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await api.get(`/profile/admin/requests?${params.toString()}`);
      if (res.data?.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error("Failed to fetch profile requests:", err);
      setFeedback({
        type: "error",
        message: "Failed to load profile update requests.",
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, roleFilter, search]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handle Approve
  const handleApprove = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to approve the profile update request for ${name}?`
      )
    ) {
      return;
    }

    try {
      setActionLoading(id);
      const res = await api.post(`/profile/admin/requests/${id}/approve`);
      if (res.data?.success) {
        setFeedback({
          type: "success",
          message: `Profile update request for ${name} has been approved and applied.`,
        });
        fetchRequests();
      }
    } catch (err) {
      console.error("Failed to approve request:", err);
      setFeedback({
        type: "error",
        message:
          err.response?.data?.message || "Failed to approve profile update request.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Open Reject Modal
  const openRejectModal = (req) => {
    setRejectingRequest(req);
    setRejectReason("");
  };

  // Submit Reject
  const handleConfirmReject = async () => {
    if (!rejectingRequest) return;
    try {
      setActionLoading(rejectingRequest._id);
      const res = await api.post(
        `/profile/admin/requests/${rejectingRequest._id}/reject`,
        { reason: rejectReason }
      );
      if (res.data?.success) {
        setFeedback({
          type: "success",
          message: `Request for ${rejectingRequest.userName} has been rejected. Notification sent: "Your request is rejected."`,
        });
        setRejectingRequest(null);
        fetchRequests();
      }
    } catch (err) {
      console.error("Failed to reject request:", err);
      setFeedback({
        type: "error",
        message:
          err.response?.data?.message || "Failed to reject profile update request.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getFieldLabel = (key) => {
    const map = {
      phone: "Phone Number",
      parentContact: "Guardian Contact",
      altContact: "Alternate Contact",
      guardian: "Guardian Name",
      guardianRelation: "Guardian Relation",
      name: "Full Name",
      gender: "Gender",
      dob: "Date of Birth",
      bloodGroup: "Blood Group",
      religion: "Religion",
      caste: "Caste",
      houseName: "House Name",
      street: "Street / Locality",
      postOffice: "Post Office",
      city: "City / Village",
      district: "District",
      pincode: "PIN Code",
      qualification: "Qualifications",
      department: "Department",
    };
    return map[key] || key;
  };

  return (
    <div className="admin-layout">
      <AdminSidebar activeNav="profile-requests" />
      <main className="admin-main">
        <AdminHeader />

        <div className="profile-page-container">
          {/* Header Banner */}
          <section className="profile-hero-card" style={{ marginBottom: "20px" }}>
            <div className="profile-badge-row">
              <span className="profile-pill-badge">ADMINISTRATION CONSOLE</span>
              <span className="profile-pill-sync">VERIFICATION REGISTRY</span>
            </div>
            <h1 className="profile-hero-title">
              Profile Change Requests
            </h1>
            <p className="profile-hero-subtext">
              Review, verify, and approve/reject statutory profile change requests submitted by students and faculty members.
            </p>
          </section>

          {/* Feedback alerts */}
          {feedback.message && (
            <div className={`profile-notification-card ${feedback.type}`}>
              <div>
                <div className="notif-content-title">
                  {feedback.type === "success" ? "✓ Done" : "✕ Notice"}
                </div>
                <div className="notif-content-msg">{feedback.message}</div>
              </div>
              <button
                type="button"
                className="notif-dismiss-btn"
                onClick={() => setFeedback({ type: "", message: "" })}
              >
                ✕
              </button>
            </div>
          )}

          {/* Controls Bar: Filters & Search */}
          <div
            className="registry-controls-card"
            style={{
              background: "#ffffff",
              padding: "16px 20px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "6px" }}>
                {["pending", "all", "approved", "rejected"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                      border: statusFilter === s ? "1px solid #2563eb" : "1px solid #cbd5e1",
                      background: statusFilter === s ? "#eff6ff" : "#ffffff",
                      color: statusFilter === s ? "#1d4ed8" : "#475569",
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  padding: "7px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f172a",
                }}
              >
                <option value="all">All Roles (Students &amp; Teachers)</option>
                <option value="student">Students Only</option>
                <option value="teacher">Teachers Only</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Search by name, email, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                minWidth: "240px",
              }}
            />
          </div>

          {/* Requests List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                padding: "40px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>📋</span>
              <strong>No profile change requests found.</strong>
              <p style={{ fontSize: "13px", marginTop: "4px" }}>
                When users change their phone number or profile data, their requests will appear here for verification.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {requests.map((req) => (
                <div
                  key={req._id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "20px 24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginBottom: "14px",
                      borderBottom: "1px solid #f1f5f9",
                      paddingBottom: "12px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                          {req.userName}
                        </h3>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            background: req.userRole === "teacher" ? "#eff6ff" : "#f5f3ff",
                            color: req.userRole === "teacher" ? "#1d4ed8" : "#6d28d9",
                          }}
                        >
                          {req.userRole}
                        </span>
                        {req.identifier && (
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              fontWeight: "700",
                              color: "#2563eb",
                            }}
                          >
                            {req.identifier}
                          </span>
                        )}
                        {req.division && (
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            • {req.division}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                        Email: {req.userEmail} • Submitted on:{" "}
                        {new Date(req.createdAt).toLocaleString("en-IN")}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {req.status === "pending" && (
                        <span className="req-badge-pending">⏳ Pending Review</span>
                      )}
                      {req.status === "approved" && (
                        <span className="req-badge-approved">✓ Approved</span>
                      )}
                      {req.status === "rejected" && (
                        <span className="req-badge-rejected">✕ Rejected</span>
                      )}

                      {req.status === "pending" && (
                        <>
                          <button
                            type="button"
                            className="btn-approve-sm"
                            disabled={actionLoading === req._id}
                            onClick={() => handleApprove(req._id, req.userName)}
                          >
                            <span>✓ Accept</span>
                          </button>
                          <button
                            type="button"
                            className="btn-reject-sm"
                            disabled={actionLoading === req._id}
                            onClick={() => openRejectModal(req)}
                          >
                            <span>✕ Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Changes Diff Table */}
                  <table className="pending-diff-table">
                    <thead>
                      <tr>
                        <th>Field Name</th>
                        <th>Original Value</th>
                        <th>Requested New Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(req.requestedChanges || {}).map((key) => (
                        <tr key={key}>
                          <td>
                            <strong>{getFieldLabel(key)}</strong>
                          </td>
                          <td>
                            <span className="diff-val-old">
                              {req.currentData?.[key] || "—"}
                            </span>
                          </td>
                          <td>
                            <span className="diff-val-new">
                              {req.requestedChanges[key]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {req.adminRemark && (
                    <div
                      style={{
                        marginTop: "12px",
                        fontSize: "12.5px",
                        color: "#991b1b",
                        background: "#fef2f2",
                        padding: "8px 12px",
                        borderRadius: "8px",
                      }}
                    >
                      <strong>Admin Rejection Note:</strong> {req.adminRemark}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reject Modal */}
        {rejectingRequest && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "14px",
                maxWidth: "460px",
                width: "100%",
                padding: "24px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#991b1b", margin: "0 0 10px 0" }}>
                Reject Profile Update Request
              </h3>
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5", margin: "0 0 14px 0" }}>
                Are you sure you want to reject the profile change request for{" "}
                <strong>{rejectingRequest.userName}</strong>?
                <br />
                The user will be immediately notified:{" "}
                <em style={{ color: "#991b1b" }}>"Your request is rejected."</em>
              </p>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  Optional Rejection Reason (sent to user):
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Mismatched supporting document or invalid phone format"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setRejectingRequest(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#f1f5f9",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={actionLoading === rejectingRequest._id}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#ef4444",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {actionLoading === rejectingRequest._id ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
