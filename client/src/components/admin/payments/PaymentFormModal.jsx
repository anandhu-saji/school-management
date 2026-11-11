import { ALL_CLASSES, getAcademicWingForClass, normalizeClassDivision } from "../../../utils/classData";

export default function PaymentFormModal({
  isOpen,
  onClose,
  editingPayment,
  paymentForm,
  setPaymentForm,
  formSubmitting,
  onSave,
  studentSearchQuery,
  setStudentSearchQuery,
  filteredStudentsForLookup,
  onSelectStudent,
  formatINR,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-card modal-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "720px" }}
      >
        {/* Modal Header */}
        <div className="modal-header-row">
          <div>
            <h3>{editingPayment ? "Edit Payment Record" : "Record Student Fee Payment"}</h3>
            <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0 }}>
              GHSS Rajakkad • Official Accounts &amp; Revenue Counter
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={onSave}>
          <div className="modal-form-body">
            {/* Student Search & Quick Autocomplete */}
            {!editingPayment && (
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label>Quick Student Autocomplete (Search by Name or Admission #):</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Type student name (e.g., Anandhu, Aparna, Alan)..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                  />
                  {filteredStudentsForLookup.length > 0 && (
                    <div className="autocomplete-dropdown">
                      {filteredStudentsForLookup.map((st) => (
                        <div
                          key={st._id}
                          className="autocomplete-item"
                          onClick={() => onSelectStudent(st)}
                        >
                          <strong>{st.name}</strong>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>
                            {st.admissionNumber} • {st.classDivision}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="form-row-2">
              <div className="form-group">
                <label>Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={paymentForm.studentName}
                  onChange={(e) => setPaymentForm({ ...paymentForm, studentName: e.target.value })}
                  placeholder="e.g. Anandhu Saji"
                />
              </div>
              <div className="form-group">
                <label>Admission Number *</label>
                <input
                  type="text"
                  required
                  value={paymentForm.admissionNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, admissionNumber: e.target.value })}
                  placeholder="e.g. ADM-14920"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Class Division *</label>
                <select
                  value={paymentForm.classDivision}
                  onChange={(e) => {
                    const val = e.target.value;
                    const derivedWing = getAcademicWingForClass(val);
                    setPaymentForm({ ...paymentForm, classDivision: val, wing: derivedWing });
                  }}
                >
                  {ALL_CLASSES.map((cls) => (
                    <option key={cls.id} value={cls.name}>
                      {cls.name} ({cls.stream})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fee Category *</label>
                <select
                  value={paymentForm.feeCategory}
                  onChange={(e) => setPaymentForm({ ...paymentForm, feeCategory: e.target.value })}
                >
                  <option value="Bus Fee">Bus Fee (School Transport)</option>
                  <option value="Annual Fee">Annual Composite Tuition</option>
                  <option value="PTA Fund">PTA Welfare &amp; Development</option>
                  <option value="Lab &amp; Computer Fee">IT Lab &amp; Science Practicals</option>
                  <option value="Special / Exam Fee">Special / Examination Fee</option>
                  <option value="Sports &amp; Library">Sports &amp; Library Club</option>
                  <option value="Uniform &amp; Books">Uniform &amp; Textbooks</option>
                </select>
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label>Total Fee Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={paymentForm.totalAmount}
                  onChange={(e) => {
                    const tot = Number(e.target.value);
                    setPaymentForm({ ...paymentForm, totalAmount: tot });
                  }}
                />
              </div>

              <div className="form-group">
                <label>Amount Paid Now (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={paymentForm.amountPaid}
                  onChange={(e) => {
                    const paid = Number(e.target.value);
                    setPaymentForm({ ...paymentForm, amountPaid: paid });
                  }}
                />
              </div>

              <div className="form-group">
                <label>Balance Due (₹)</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={formatINR(Math.max(0, (paymentForm.totalAmount || 0) - (paymentForm.amountPaid || 0)))}
                  style={{
                    backgroundColor: "#f8fafc",
                    fontWeight: "700",
                    color:
                      (paymentForm.totalAmount || 0) - (paymentForm.amountPaid || 0) > 0 ? "#b91c1c" : "#15803d",
                  }}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Payment Mode *</label>
                <select
                  value={paymentForm.paymentMode}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                >
                  <option value="Razorpay / Online">Razorpay / Online Gateway</option>
                  <option value="UPI / Online (Google Pay / PhonePe)">
                    UPI / Online (Google Pay / PhonePe)
                  </option>
                  <option value="Net Banking">Net Banking / IMPS</option>
                  <option value="Cash at School Counter">Cash at School Counter</option>
                  <option value="Bank Challan (SBT/SBI)">Bank Challan (SBI/SBT)</option>
                  <option value="Demand Draft">Demand Draft (DD)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Transaction / Challan Reference #</label>
                <input
                  type="text"
                  value={paymentForm.transactionReference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                  placeholder="e.g. UPI/6294029402 or CHL-9402"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  required
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Term / Period</label>
                <select
                  value={paymentForm.term}
                  onChange={(e) => setPaymentForm({ ...paymentForm, term: e.target.value })}
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                  <option value="Annual">Annual Composite</option>
                  <option value="Monthly Bus Pass">Monthly Bus Pass</option>
                  <option value="One-Time">One-Time Special</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Remarks / Notes (Route, Concessions, or Details)</label>
              <input
                type="text"
                value={paymentForm.remarks}
                onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                placeholder="e.g. School Bus Route 03 - Rajakkad to Kallar • Month of October"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer-row">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-modal-save" disabled={formSubmitting}>
              {formSubmitting ? "Saving to DB..." : editingPayment ? "Update Payment" : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
