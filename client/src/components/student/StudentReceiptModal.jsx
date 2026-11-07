export default function StudentReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  return (
    <div className="student-modal-overlay" onClick={onClose}>
      <div
        className="student-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "600px" }}
      >
        <div className="student-modal-header">
          <h3>Official Fee Receipt Voucher</h3>
          <button className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>

        <div
          id="printable-student-receipt"
          style={{
            border: "2px solid #0f172a",
            borderRadius: "8px",
            padding: "20px",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              textAlign: "center",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "12px",
              marginBottom: "14px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", textTransform: "uppercase" }}>
              GOVERNMENT HIGHER SECONDARY SCHOOL RAJAKKAD
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>
              School Code: 06042 • Idukki District, Kerala
            </p>
            <div
              style={{
                display: "inline-block",
                background: "#0f172a",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: "700",
                padding: "2px 10px",
                borderRadius: "4px",
                marginTop: "6px",
              }}
            >
              FEE PAYMENT RECEIPT (STUDENT COPY)
            </div>
          </div>

          <div
            className="receipt-info-grid"
            style={{
              fontSize: "12.5px",
              marginBottom: "16px",
            }}
          >
            <div>
              <strong>Receipt Number:</strong> {receipt.receiptNumber}
            </div>
            <div>
              <strong>Payment Date:</strong> {receipt.paymentDate}
            </div>
            <div>
              <strong>Student Name:</strong> {receipt.studentName}
            </div>
            <div>
              <strong>Admission No:</strong> {receipt.admissionNumber}
            </div>
            <div>
              <strong>Class &amp; Division:</strong> {receipt.classDivision}
            </div>
            <div>
              <strong>Academic Term:</strong> {receipt.term}
            </div>
            <div>
              <strong>Payment Mode:</strong> {receipt.paymentMode}
            </div>
            <div>
              <strong>Transaction Ref:</strong>{" "}
              {receipt.transactionReference || "COUNTER-CASH"}
            </div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "14px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                fontSize: "13px",
              }}
            >
              <span>Fee Category:</span>
              <strong>{receipt.feeCategory}</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                fontSize: "13px",
              }}
            >
              <span>Total Amount Billed:</span>
              <span>₹{receipt.totalAmount}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px dashed #cbd5e1",
                paddingTop: "8px",
                fontSize: "14px",
                fontWeight: "800",
                color: "#15803d",
              }}
            >
              <span>Amount Paid:</span>
              <span>₹{receipt.amountPaid}</span>
            </div>
            {receipt.dueAmount > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "6px",
                  fontSize: "12.5px",
                  color: "#dc2626",
                }}
              >
                <span>Remaining Balance:</span>
                <span>₹{receipt.dueAmount}</span>
              </div>
            )}
          </div>

          {receipt.remarks && (
            <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 14px" }}>
              Note: {receipt.remarks}
            </p>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingTop: "14px",
              borderTop: "1px dashed #cbd5e1",
              fontSize: "11px",
            }}
          >
            <div>Collected By: {receipt.collectedBy}</div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  borderTop: "1px solid #0f172a",
                  width: "120px",
                  paddingTop: "3px",
                }}
              >
                Authorized Cashier
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "16px",
          }}
        >
          <button className="secondary-button" onClick={onClose}>
            Close
          </button>
          <button className="primary-button" onClick={() => window.print()}>
            🖨️ Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
