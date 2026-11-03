export default function ExamSeatingModal({
  isOpen,
  onClose,
  activeSeatingExam,
}) {
  if (!isOpen || !activeSeatingExam) return null;

  return (
    <div className="modal-backdrop">
      <div
        className="modal-container"
        style={{ maxWidth: "780px", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              Hall Seating &amp; Invigilation Plan
            </h2>
            <p style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>
              {activeSeatingExam.subject} ({activeSeatingExam.qpCode}) •{" "}
              {activeSeatingExam.date} ({activeSeatingExam.startTime} –{" "}
              {activeSeatingExam.endTime})
            </p>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Top Banner with Quick Summary */}
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "12px",
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#1e3a8a",
                }}
              >
                Standard / Cadre: {activeSeatingExam.standard}
              </div>
              <div style={{ fontSize: "12px", color: "#3b82f6" }}>
                Total Registered Candidates:{" "}
                <strong>{activeSeatingExam.totalCandidates} Students</strong>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  background: "#1d4ed8",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: "800",
                  padding: "4px 10px",
                  borderRadius: "6px",
                }}
              >
                15 Min Cool-off Active
              </span>
            </div>
          </div>

          {/* Seating Cards Grid */}
          <div className="seating-plan-grid">
            {(activeSeatingExam.seatingPlan &&
            activeSeatingExam.seatingPlan.length > 0
              ? activeSeatingExam.seatingPlan
              : [
                  {
                    hallNumber: "Hall 01",
                    roomName: "Room 101 - Main Academic Block",
                    rollRange: "ADM-14920 to ADM-14960",
                    candidateCount: 40,
                    invigilatorName: "Mrs. Indu B Nair",
                    invigilatorPen: "849201",
                  },
                  {
                    hallNumber: "Hall 02",
                    roomName: "Room 102 - Main Academic Block",
                    rollRange: "ADM-14961 to ADM-15000",
                    candidateCount: 40,
                    invigilatorName: "Sri. George K.",
                    invigilatorPen: "849202",
                  },
                ]
            ).map((hall, idx) => (
              <div className="seating-hall-card" key={idx}>
                <div className="seating-hall-header">
                  <span className="seating-hall-badge">
                    {hall.hallNumber}
                  </span>
                  <span className="seating-candidate-count">
                    👥 {hall.candidateCount} Candidates
                  </span>
                </div>

                <div className="seating-room-name">{hall.roomName}</div>

                <div className="seating-roll-range">
                  <strong>Seated Roll Range:</strong> {hall.rollRange}
                </div>

                <div className="seating-invigilator-box">
                  <span className="seating-invigilator-label">
                    Invigilator:
                  </span>
                  <span className="seating-invigilator-value">
                    {hall.invigilatorName}{" "}
                    <span style={{ color: "#64748b" }}>
                      (PEN: {hall.invigilatorPen})
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* State Board Compliance Box */}
          <div
            style={{
              marginTop: "20px",
              background: "#f8fafc",
              border: "1px dashed #cbd5e1",
              borderRadius: "10px",
              padding: "12px 16px",
              fontSize: "12px",
              color: "#475569",
              lineHeight: "1.5",
            }}
          >
            <strong>Government Examination Instructions:</strong> Question
            booklet seal verification must take place in the presence of 2
            student candidates at 09:25 AM. Answer booklets must be signed &amp;
            numbered by the invigilator before 10:00 AM.
          </div>

          {/* Modal Actions */}
          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              Close Plan
            </button>
            <button
              type="button"
              className="btn-submit"
              onClick={() => window.print()}
            >
              🖨️ Print Seating Chart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
