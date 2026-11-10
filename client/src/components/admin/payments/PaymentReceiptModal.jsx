export default function PaymentReceiptModal({
  isOpen,
  onClose,
  viewingReceipt,
  formatINR,
}) {
  if (!isOpen || !viewingReceipt) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
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
            Print Official Receipt
          </button>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
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
              <strong>Class &amp; Division:</strong> {viewingReceipt.classDivision} ({viewingReceipt.wing})
            </div>
            <div style={{ textAlign: "right" }}>
              <strong>Roll No:</strong> {viewingReceipt.rollNumber || "-"}
            </div>
          </div>

          <table className="receipt-breakdown-table">
            <thead>
              <tr>
                <th>Fee Category &amp; Particulars</th>
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
              <div className="sig-title">Headmaster</div>
              <div className="sig-role">Headmaster &amp; Accounts Officer</div>
              <div className="sig-date">GHSS Rajakkad</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
