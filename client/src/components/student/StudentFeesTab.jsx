export default function StudentFeesTab({
  feesData,
  totalFeeDue,
  onViewReceipt,
}) {
  return (
    <div>
      <div className="student-section-header">
        <div className="student-section-title-group">
          <h2>Fee Payment Ledger &amp; Official Receipts</h2>
          <p>
            Real-time fee billing, dues clearance, and official receipt vouchers
          </p>
        </div>
      </div>

      {/* Fee Highlights Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div className="dossier-card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>
            TOTAL BILLED FEES
          </span>
          <h3 style={{ fontSize: "24px", margin: "6px 0 0", color: "#0f172a" }}>
            ₹{feesData?.summary?.totalBilled ?? 0}
          </h3>
        </div>

        <div className="dossier-card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#15803d" }}>
            TOTAL AMOUNT PAID
          </span>
          <h3 style={{ fontSize: "24px", margin: "6px 0 0", color: "#15803d" }}>
            ₹{feesData?.summary?.totalPaid ?? 0}
          </h3>
        </div>

        <div className="dossier-card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#dc2626" }}>
            OUTSTANDING DUE
          </span>
          <h3 style={{ fontSize: "24px", margin: "6px 0 0", color: "#dc2626" }}>
            ₹{feesData?.summary?.totalDue ?? totalFeeDue ?? 0}
          </h3>
        </div>

        <div className="dossier-card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb" }}>
            LEDGER STATUS
          </span>
          <h3
            style={{
              fontSize: "16px",
              margin: "6px 0 0",
              color: totalFeeDue === 0 ? "#15803d" : "#b45309",
            }}
          >
            {feesData?.summary?.status || (totalFeeDue === 0 ? "All Dues Cleared ✓" : `₹${totalFeeDue} Pending Due`)}
          </h3>
        </div>
      </div>

      {/* Payments Table */}
      <div className="student-table-container">
        <table className="student-data-table">
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Fee Category</th>
              <th>Term</th>
              <th>Billed Amount</th>
              <th>Paid Amount</th>
              <th>Due Balance</th>
              <th>Payment Date</th>
              <th>Mode</th>
              <th>Status</th>
              <th>Voucher</th>
            </tr>
          </thead>
          <tbody>
            {feesData?.payments?.length > 0 ? (
              feesData.payments.map((p) => (
                <tr key={p._id}>
                  <td>
                    <strong>{p.receiptNumber}</strong>
                  </td>
                  <td>
                    <strong>{p.feeCategory}</strong>
                  </td>
                  <td>{p.term}</td>
                  <td>₹{p.totalAmount}</td>
                  <td style={{ color: "#15803d", fontWeight: "700" }}>
                    ₹{p.amountPaid}
                  </td>
                  <td
                    style={{
                      color: p.dueAmount > 0 ? "#dc2626" : "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    ₹{p.dueAmount}
                  </td>
                  <td>{p.paymentDate}</td>
                  <td style={{ fontSize: "12px", color: "#64748b" }}>
                    {p.paymentMode}
                  </td>
                  <td>
                    <span
                      className={`badge-status ${
                        p.status === "Paid"
                          ? "paid"
                          : p.status === "Partial"
                          ? "partial"
                          : "pending"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="dossier-copy-btn"
                      onClick={() => onViewReceipt(p)}
                    >
                      Receipt ↗
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: "center", padding: "30px" }}>
                  No fee payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
