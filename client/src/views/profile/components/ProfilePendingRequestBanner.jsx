export default function ProfilePendingRequestBanner({
  pendingReq,
  getFieldLabel,
}) {
  if (!pendingReq || !pendingReq.requestedChanges) return null;

  return (
    <section className="profile-pending-banner">
      <div className="pending-banner-header">
        <div className="pending-tag">
          <span>⏳</span>
          <span>Pending Admin Verification &amp; Approval</span>
        </div>
        <span style={{ fontSize: "12px", color: "#64748b" }}>
          Submitted on:{" "}
          {new Date(pendingReq.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 10px 0" }}>
        You have submitted the following updates. Current records will remain active until the
        Headmaster reviews and approves your request:
      </p>
      <table className="pending-diff-table">
        <thead>
          <tr>
            <th>Field Name</th>
            <th>Current Value</th>
            <th>Requested New Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(pendingReq.requestedChanges).map((key) => (
            <tr key={key}>
              <td>
                <strong>{getFieldLabel(key)}</strong>
              </td>
              <td>
                <span className="diff-val-old">
                  {pendingReq.currentData?.[key] || "—"}
                </span>
              </td>
              <td>
                <span className="diff-val-new">
                  {pendingReq.requestedChanges[key]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
