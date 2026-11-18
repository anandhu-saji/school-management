export default function SimulatedRazorpayGateway({
  pendingOrderData,
  paymentMethod,
  setPaymentMethod,
  loading,
  onBack,
  onComplete,
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "2px dashed #0284c7",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: "800",
            color: "#0369a1",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Razorpay Payment Sandbox (Dev Mode)
        </span>
        <span
          style={{
            background: "#dbeafe",
            color: "#1e40af",
            fontSize: "10px",
            fontWeight: "700",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          TEST MODE
        </span>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          padding: "12px",
          marginBottom: "14px",
          fontSize: "12.5px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <span style={{ color: "#64748b" }}>Order ID:</span>
          <span style={{ fontWeight: "700", fontFamily: "monospace" }}>
            {pendingOrderData?.order?.id}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <span style={{ color: "#64748b" }}>Payable Amount:</span>
          <span
            style={{ fontWeight: "800", color: "#16a34a", fontSize: "14px" }}
          >
            ₹{pendingOrderData?.numAmount}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Purpose:</span>
          <span>{pendingOrderData?.feeCategory}</span>
        </div>
      </div>

      <div style={{ marginBottom: "14px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "700",
            marginBottom: "6px",
          }}
        >
          Select Simulated Payment Mode:
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
          }}
        >
          {["UPI", "Debit Card", "NetBanking"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPaymentMethod(mode)}
              style={{
                padding: "8px 10px",
                borderRadius: "6px",
                border:
                  paymentMethod === mode
                    ? "2px solid #0284c7"
                    : "1px solid #cbd5e1",
                background: paymentMethod === mode ? "#f0f9ff" : "#ffffff",
                color: paymentMethod === mode ? "#0369a1" : "#475569",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "flex-end",
          marginTop: "16px",
        }}
      >
        <button
          type="button"
          className="dossier-copy-btn"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </button>
        <button
          type="button"
          className="btn-print-dossier"
          onClick={onComplete}
          disabled={loading}
        >
          {loading
            ? "Verifying..."
            : `Complete ₹${pendingOrderData?.numAmount} Payment`}
        </button>
      </div>
    </div>
  );
}
