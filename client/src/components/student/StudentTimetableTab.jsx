export default function StudentTimetableTab({
  loadingExams,
  exams,
  onViewHallTicket,
}) {
  return (
    <div>
      <div className="student-section-header">
        <div className="student-section-title-group">
          <h2>Official Examination Timetables &amp; Seating Plan</h2>
          <p>
            Published by Pareeksha Bhavan / SCERT Kerala for Standard 10 &amp; Plus Two
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="primary-button"
            onClick={onViewHallTicket}
          >
            🖨️ View &amp; Print Hall Ticket
          </button>
        </div>
      </div>

      {/* Exam Cards List */}
      {loadingExams ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Loading examination timetables...
        </div>
      ) : exams.length === 0 ? (
        <div className="dossier-card" style={{ textAlign: "center", padding: "40px" }}>
          <p>No exams currently published for your standard.</p>
        </div>
      ) : (
        exams.map((exam) => (
          <div className="exam-item-card" key={exam._id}>
            <div className="exam-item-top">
              <div>
                <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700" }}>
                  {exam.term} • {exam.standard}
                </div>
                <h3 className="exam-subject-title">{exam.subject}</h3>
              </div>
              <span className="badge-status paid">
                ✓ {exam.status || "Approved & Published"}
              </span>
            </div>

            <div className="exam-meta-row">
              <span className="exam-meta-pill">📅 {exam.date}</span>
              <span className="exam-meta-pill">
                ⏰ {exam.startTime} - {exam.endTime} ({exam.duration})
              </span>
              <span className="exam-meta-pill">🏷️ QP Code: {exam.qpCode}</span>
              <span className="exam-meta-pill">🏛️ Hall: {exam.hall}</span>
              <span>
                Max: <strong>{exam.maxMarks}</strong> / Pass:{" "}
                <strong>{exam.passMarks}</strong>
              </span>
            </div>

            {exam.instructions && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#475569",
                }}
              >
                📌 <strong>Instructions:</strong> {exam.instructions}
              </div>
            )}
          </div>
        ))
      )}

      {/* Examination Guidelines Box */}
      <div
        className="dossier-card"
        style={{ marginTop: "20px", background: "#f8fafc" }}
      >
        <h4 style={{ margin: "0 0 8px", fontSize: "14px", color: "#0f172a" }}>
          📋 Mandatory Kerala Pareeksha Bhavan Exam Guidelines:
        </h4>
        <ul
          style={{
            margin: 0,
            paddingLeft: "20px",
            fontSize: "12.5px",
            color: "#475569",
            lineHeight: "1.8",
          }}
        >
          <li>
            Candidates must be seated in their designated hall 15 minutes before the
            commencement of cool-off time.
          </li>
          <li>
            15 minutes cool-off time is designated exclusively for reading question papers;
            no writing is permitted during this window.
          </li>
          <li>
            Carrying mobile phones, smartwatches, programmable calculators, or revision
            sheets into the hall is strictly prohibited under Examination Discipline Act.
          </li>
          <li>
            Candidates must display their authorized Photo Hall Ticket on their desk at all
            times.
          </li>
        </ul>
      </div>
    </div>
  );
}
