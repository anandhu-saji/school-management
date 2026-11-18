import { normalizeClassDivision, getAcademicWingForClass } from "../../../utils/classData";

export default function PaymentTable({
  loading,
  payments,
  formatINR,
  handleOpenReceiptModal,
  handleOpenRecordModal,
  handleDeletePayment,
  totalPages,
  currentPage,
  setCurrentPage,
  totalRecords,
}) {
  return (
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
                    <div className="class-div-pill">
                      {normalizeClassDivision(p.classDivision)?.name || p.classDivision}
                    </div>
                    <div className="wing-tag-sub">
                      {getAcademicWingForClass(p.classDivision) || p.wing}
                    </div>
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
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalRecords} total entries)
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
  );
}
