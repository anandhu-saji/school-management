import { useState, useEffect } from "react";
import api from "../../api/axiosclient";
import { loadRazorpayScript, getRazorpayKeyId } from "../../utils/razorpay";

export default function StudentRazorpayModal({
  isOpen,
  onClose,
  targetFee,
  totalFeeDue,
  studentProfile,
  onPaymentSuccess,
}) {
  const [amount, setAmount] = useState(0);
  const [feeCategory, setFeeCategory] = useState("Annual Fee");
  const [term, setTerm] = useState("Term 1");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [simulatedCheckoutOpen, setSimulatedCheckoutOpen] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  useEffect(() => {
    if (targetFee) {
      setAmount(targetFee.dueAmount > 0 ? targetFee.dueAmount : targetFee.totalAmount || 1000);
      setFeeCategory(targetFee.feeCategory || "Annual Fee");
      setTerm(targetFee.term || "Term 1");
    } else {
      setAmount(totalFeeDue > 0 ? totalFeeDue : 1500);
      setFeeCategory("Annual Fee");
      setTerm("Term 1");
    }
    setErrorMsg("");
    setSimulatedCheckoutOpen(false);
    setPendingOrderData(null);
  }, [targetFee, totalFeeDue, isOpen]);

  if (!isOpen) return null;

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg("Please enter a valid fee payment amount.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on backend API
      const res = await api.post("/student/create-razorpay-order", {
        feePaymentId: targetFee?._id || undefined,
        amount: numAmount,
        feeCategory,
      });

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to create Razorpay order.");
      }

      const { order, keyId } = res.data;

      // 2. Load Razorpay Checkout SDK
      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && window.Razorpay) {
        // Live Razorpay Checkout Modal
        const options = {
          key: keyId || getRazorpayKeyId(),
          amount: order.amount,
          currency: order.currency || "INR",
          name: "GHSS Rajakkad",
          description: `Fee Clearance: ${feeCategory} (${term})`,
          order_id: order.id,
          prefill: {
            name: studentProfile?.name || "Student Scholar",
            email: studentProfile?.email || "student@ghss.edu",
            contact: studentProfile?.parentContact?.replace(/\D/g, "") || "9447000000",
          },
          notes: {
            admissionNumber: studentProfile?.admissionNumber || "ADM-14920",
            classDivision: studentProfile?.classDivision || "Class 10-A",
          },
          theme: {
            color: "#1e3a8a",
          },
          handler: async function (response) {
            try {
              setLoading(true);
              const verifyRes = await api.post("/student/verify-razorpay-payment", {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                feePaymentId: targetFee?._id,
                amountPaid: numAmount,
                feeCategory,
                term,
                remarks: remarks || `Online payment via Razorpay. Ref: ${response.razorpay_payment_id}`,
              });

              if (verifyRes.data.success) {
                onPaymentSuccess(verifyRes.data.payment, verifyRes.data.message);
                onClose();
              }
            } catch (vErr) {
              setErrorMsg(vErr.response?.data?.message || "Payment verification failed.");
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (failResponse) {
          setErrorMsg(failResponse.error?.description || "Payment failed or was cancelled.");
          setLoading(false);
        });
        rzp.open();
      } else {
        // Simulated Razorpay Checkout Dialog (Used in offline environments / sandboxes)
        setPendingOrderData({ order, keyId, numAmount });
        setSimulatedCheckoutOpen(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("Razorpay initiation error:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to initialize Razorpay checkout.");
      setLoading(false);
    }
  };

  const handleSimulatedPaymentComplete = async () => {
    if (!pendingOrderData) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const mockPaymentId = `pay_${Date.now().toString().slice(-8)}`;
      const mockSignature = `mock_sig_${mockPaymentId}`;

      const verifyRes = await api.post("/student/verify-razorpay-payment", {
        orderId: pendingOrderData.order.id,
        paymentId: mockPaymentId,
        signature: mockSignature,
        feePaymentId: targetFee?._id,
        amountPaid: pendingOrderData.numAmount,
        feeCategory,
        term,
        remarks: remarks || `Verified online payment via Razorpay. Txn: ${mockPaymentId}`,
      });

      if (verifyRes.data.success) {
        onPaymentSuccess(verifyRes.data.payment, verifyRes.data.message);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to verify simulated payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-modal-overlay" onClick={onClose}>
      <div
        className="student-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "520px" }}
      >
        <div className="student-modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: "16px" }}>Online Fee Payment</h3>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
              Integrated Razorpay Payment Gateway &bull; GHSS Rajakkad
            </p>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ padding: "16px 20px" }}>
          {errorMsg && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                borderRadius: "6px",
                padding: "10px 14px",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              [Error] {errorMsg}
            </div>
          )}

          {simulatedCheckoutOpen ? (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: "#0284c7",
                  color: "#ffffff",
                  fontSize: "10px",
                  fontWeight: "700",
                  padding: "3px 10px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Razorpay Checkout Simulator
              </div>
              <h4 style={{ margin: "4px 0 10px", color: "#0f172a" }}>
                Confirm Online Clearance of ₹{pendingOrderData?.numAmount}
              </h4>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 16px" }}>
                Order ID: <code>{pendingOrderData?.order?.id}</code> &bull; Currency: INR
              </p>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px dashed #94a3b8",
                  padding: "12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  textAlign: "left",
                  marginBottom: "16px",
                }}
              >
                <div><strong>Beneficiary:</strong> GHSS Rajakkad (Code: 06042)</div>
                <div><strong>Scholar:</strong> {studentProfile?.name} ({studentProfile?.admissionNumber})</div>
                <div><strong>Category:</strong> {feeCategory} ({term})</div>
                <div><strong>Gateway:</strong> Razorpay UPI, Cards &amp; NetBanking</div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="dossier-copy-btn"
                  onClick={() => setSimulatedCheckoutOpen(false)}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-print-dossier"
                  onClick={handleSimulatedPaymentComplete}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : `Complete ₹${pendingOrderData?.numAmount} Payment`}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleInitiatePayment}>
              {/* Student Summary Card */}
              <div
                style={{
                  background: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  marginBottom: "16px",
                  fontSize: "12px",
                  color: "#0369a1",
                }}
              >
                <div>
                  <strong>Scholar Name:</strong> {studentProfile?.name || "Anandhu Saji"} &bull;{" "}
                  <strong>Adm No:</strong> {studentProfile?.admissionNumber || "ADM-14920"}
                </div>
                <div>
                  <strong>Division:</strong> {studentProfile?.classDivision || "Class 10-A"} &bull;{" "}
                  <strong>School Code:</strong> 06042
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                  Fee Category
                </label>
                <input
                  type="text"
                  value={feeCategory}
                  readOnly={Boolean(targetFee)}
                  onChange={(e) => setFeeCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    background: targetFee ? "#f8fafc" : "#ffffff",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                  Academic Term
                </label>
                <input
                  type="text"
                  value={term}
                  readOnly={Boolean(targetFee)}
                  onChange={(e) => setTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    background: targetFee ? "#f8fafc" : "#ffffff",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                  Payment Amount (₹ INR) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #0284c7",
                    borderRadius: "6px",
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#0f172a",
                  }}
                />
                <span style={{ fontSize: "11px", color: "#64748b" }}>
                  {targetFee ? `Pending Due on this item: ₹${targetFee.dueAmount || 0}` : `Total Outstanding Due: ₹${totalFeeDue || 0}`}
                </span>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                  Remarks / Payer Note (Optional)
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Paid by father Santhosh via Google Pay UPI"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#f8fafc",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  marginBottom: "16px",
                  fontSize: "11px",
                  color: "#475569",
                }}
              >
                <span>Secured by <strong>Razorpay</strong> &bull; UPI, Cards, NetBanking</span>
                <span style={{ color: "#16a34a", fontWeight: "700" }}>256-Bit SSL Encrypted</span>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="dossier-copy-btn"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-print-dossier"
                  disabled={loading}
                  style={{
                    background: "#0284c7",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: "700",
                    padding: "8px 18px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  {loading ? "Connecting Razorpay..." : `Pay ₹${amount} with Razorpay`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
