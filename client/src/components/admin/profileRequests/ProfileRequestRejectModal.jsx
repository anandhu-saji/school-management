export default function ProfileRequestRejectModal({
  rejectingRequest,
  rejectReason,
  setRejectReason,
  onClose,
  onConfirmReject,
  actionLoading,
}) {
  if (!rejectingRequest) return null;

  return (
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
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "800",
            color: "#991b1b",
            margin: "0 0 10px 0",
          }}
        >
          Reject Profile Update Request
        </h3>
        <p
          style={{
            fontSize: "13px",
            color: "#475569",
            lineHeight: "1.5",
            margin: "0 0 14px 0",
          }}
        >
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

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
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
            onClick={onConfirmReject}
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
            {actionLoading === rejectingRequest._id
              ? "Rejecting..."
              : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
