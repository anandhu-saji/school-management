import { useState } from "react";
import StudentRazorpayModal from "./StudentRazorpayModal";

export default function StudentFeesTab({
  feesData,
  totalFeeDue,
  onViewReceipt,
  onRefreshFees,
  studentProfile,
}) {
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleOpenPayModal = (feeItem = null) => {
    setSelectedFee(feeItem);
    setRazorpayModalOpen(true);
    setFeedback({ type: "", message: "" });
  };

  const handlePaymentSuccess = (payment, message) => {
    setFeedback({
      type: "success",
      message: message || "Payment recorded successfully!",
    });
    if (onRefreshFees) {
      onRefreshFees();
    }
    if (payment && onViewReceipt) {
      setTimeout(() => {
        onViewReceipt(payment);
      }, 600);
    }
  };

  const pendingDue = Number(feesData?.summary?.totalDue ?? totalFeeDue ?? 0);

  return (
    <div>
      <div className="student-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div className="student-section-title-group">
          <h2>Fee Payment Ledger &amp; Official Receipts</h2>
          <p>
            Real-time fee billing, dues clearance, and official receipt vouchers
          </p>
        </div>

        {/* Action Button: Pay Online with Razorpay */}
        <div>
          <button
            type="button"
            onClick={() => handleOpenPayModal(null)}
            style={{
              background: "#0284c7",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "9px 18px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(2, 132, 199, 0.25)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>•</span> Pay Dues via Razorpay
          </button>
        </div>
      </div>

      {feedback.message && (
        <div
          style={{
            background: feedback.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${feedback.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            color: feedback.type === "success" ? "#166534" : "#b91c1c",
            borderRadius: "6px",
            padding: "10px 16px",
            fontSize: "13px",
            fontWeight: "600",
            marginBottom: "16px",
          }}
        >
          {feedback.type === "success" ? "✓ " : "[Error] "}
          {feedback.message}
        </div>
      )}

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
            ₹{pendingDue}
          </h3>
        </div>

        <div className="dossier-card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb" }}>
            LEDGER STATUS
          </span>
          <h3
            style={{
              fontSize: "15px",
              margin: "6px 0 0",
              color: pendingDue === 0 ? "#15803d" : "#b45309",
            }}
          >
            {feesData?.summary?.status || (pendingDue === 0 ? "All Dues Cleared ✓" : `₹${pendingDue} Pending Due`)}
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feesData?.payments?.length > 0 ? (
              feesData.payments.map((p) => {
                const hasDue = Number(p.dueAmount) > 0;
                return (
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
                        color: hasDue ? "#dc2626" : "#64748b",
                        fontWeight: "700",
                      }}
                    >
                      ₹{p.dueAmount}
                    </td>
                    <td>{p.paymentDate}</td>
                    <td style={{ fontSize: "12px", color: "#64748b" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: p.paymentMode?.includes("Razorpay") ? "#e0f2fe" : "#f1f5f9",
                          color: p.paymentMode?.includes("Razorpay") ? "#0369a1" : "inherit",
                          fontWeight: p.paymentMode?.includes("Razorpay") ? "700" : "normal",
                        }}
                      >
                        {p.paymentMode}
                      </span>
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
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {hasDue && (
                          <button
                            type="button"
                            className="dossier-copy-btn"
                            onClick={() => handleOpenPayModal(p)}
                            style={{
                              background: "#0284c7",
                              color: "#ffffff",
                              borderColor: "#0284c7",
                              fontWeight: "700",
                            }}
                            title="Pay pending due via Razorpay"
                          >
                            Pay Due
                          </button>
                        )}
                        <button
                          type="button"
                          className="dossier-copy-btn"
                          onClick={() => onViewReceipt(p)}
                        >
                          Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
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

      {/* Razorpay Online Payment Modal */}
      <StudentRazorpayModal
        isOpen={razorpayModalOpen}
        onClose={() => setRazorpayModalOpen(false)}
        targetFee={selectedFee}
        totalFeeDue={pendingDue}
        studentProfile={studentProfile}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
