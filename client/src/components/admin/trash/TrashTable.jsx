export default function TrashTable({
  filteredItems,
  formatDate,
  handleRestore,
  handlePermanentDelete,
  actionInProgress,
}) {
  return (
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
                  onClick={() =>
                    handlePermanentDelete(item.type, item.id, item.title)
                  }
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
  );
}
