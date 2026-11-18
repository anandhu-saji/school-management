export default function ExamTimetableTable({
  loading,
  paginatedExams,
  handleMarkExamCompleted,
  openSeatingModal,
  openEditExamModal,
  handleDeleteExam,
}) {
  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          color: "#64748b",
          fontWeight: "600",
        }}
      >
        Loading Examination Timetables &amp; Session Schedules...
      </div>
    );
  }

  if (paginatedExams.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          color: "#64748b",
        }}
      >
        No matching examination schedules found.
      </div>
    );
  }

  return (
    <div className="exam-table-container">
      <table className="exam-registry-table">
        <thead>
          <tr>
            <th>Date &amp; Day</th>
            <th>Time &amp; Duration</th>
            <th>Standard / Cadre</th>
            <th>Subject &amp; QP Code</th>
            <th>Exam Halls &amp; Capacity</th>
            <th>Chief Invigilator</th>
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedExams.map((exam) => {
            const isPublished = exam.status === "Approved & Published";
            return (
              <tr key={exam._id}>
                {/* Date & Day */}
                <td>
                  <div className="exam-date-cell">
                    <span className="exam-date-primary">
                      {exam.date.split(",")[0] || exam.date}
                    </span>
                    <span className="exam-date-subtext">
                      {exam.date.split(",")[1] || "Session Day"}
                    </span>
                  </div>
                </td>

                {/* Time & Duration */}
                <td>
                  <div className="exam-time-primary">
                    {exam.startTime} – {exam.endTime}
                  </div>
                  <div className="exam-duration-subtext">
                    {exam.duration || "2 hrs 45 mins"}
                  </div>
                </td>

                {/* Standard */}
                <td>
                  <span className="exam-standard-badge">
                    {exam.standard}
                  </span>
                </td>

                {/* Subject & QP Code */}
                <td>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#4f46e5",
                      marginBottom: "4px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#eef2ff",
                      border: "1px solid #e0e7ff",
                      padding: "2px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    <span>📝</span>
                    <span>{exam.examName || exam.term}</span>
                  </div>
                  <div className="exam-subject-title">
                    {exam.subject}
                  </div>
                  <div className="exam-subject-meta">
                    <span className="exam-qp-badge">
                      QP: {exam.qpCode}
                    </span>
                    <span className="exam-marks-meta">
                      Max: {exam.maxMarks || 80} | Pass:{" "}
                      {exam.passMarks || 24}
                    </span>
                  </div>
                </td>

                {/* Exam Halls */}
                <td>
                  <div className="exam-hall-primary">{exam.hall}</div>
                  <div className="exam-candidates-meta">
                    {exam.totalCandidates} Candidates
                  </div>
                </td>

                {/* Invigilators */}
                <td>
                  <div className="exam-invigilator-text">
                    {exam.invigilator || "Cadre Teacher"}
                  </div>
                </td>

                {/* Status */}
                <td>
                  <span
                    className={
                      exam.status === "Completed"
                        ? "exam-status-completed"
                        : isPublished
                        ? "exam-status-published"
                        : "exam-status-draft"
                    }
                  >
                    <span className="status-dot"></span>
                    {exam.status}
                  </span>
                </td>

                {/* Actions */}
                <td style={{ textAlign: "right" }}>
                  <div
                    className="exam-actions-cell"
                    style={{ justifyContent: "flex-end", gap: "6px" }}
                  >
                    {exam.status !== "Completed" && (
                      <button
                        type="button"
                        className="btn-seating-action"
                        style={{
                          background: "#e0e7ff",
                          color: "#3730a3",
                          border: "1px solid #c7d2fe",
                          padding: "6px 10px",
                          fontWeight: "700",
                        }}
                        onClick={() => handleMarkExamCompleted(exam)}
                        title="Mark Exam as Completed so teachers can enter grades"
                      >
                        ✓ Complete
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-seating-action"
                      onClick={() => openSeatingModal(exam)}
                      title="View Hall Seating Plan &amp; Candidate Range"
                    >
                      Seating Plan
                    </button>
                    <button
                      type="button"
                      className="btn-exam-edit"
                      onClick={() => openEditExamModal(exam)}
                      title="Edit Exam Session"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-exam-delete"
                      onClick={() => handleDeleteExam(exam)}
                      title="Delete Schedule"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
