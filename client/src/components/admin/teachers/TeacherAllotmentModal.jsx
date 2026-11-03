export default function TeacherAllotmentModal({ teacher, onClose }) {
  if (!teacher) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-card modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-row">
          <div>
            <h3>Teaching Workload &amp; Period Allotment</h3>
            <p
              style={{
                fontSize: "12px",
                color: "#64748b",
                margin: "2px 0 0 0",
              }}
            >
              {teacher.name} • PEN: {teacher.pen} • {teacher.department}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="allotment-modal-body">
          <div className="allotment-meta-summary-card">
            <div>
              <span className="allotment-label">Primary Charge:</span>
              <strong>{teacher.assignedClass}</strong>
            </div>
            <div>
              <span className="allotment-label">Weekly Periods:</span>
              <strong>{teacher.periods}</strong>
            </div>
            <div>
              <span className="allotment-label">Contact:</span>
              <strong>{teacher.phone}</strong>
            </div>
            <div>
              <span className="allotment-label">Status:</span>
              <strong style={{ color: "#059669" }}>
                {teacher.status}
              </strong>
            </div>
          </div>

          <h4 style={{ margin: "20px 0 10px 0", color: "#1e293b" }}>
            Weekly Academic Schedule &amp; Duty Register
          </h4>
          <div className="allotment-table-wrapper">
            <table className="allotment-schedule-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Period 1 (09:30)</th>
                  <th>Period 2 (10:20)</th>
                  <th>Period 3 (11:20)</th>
                  <th>Period 4 (01:15)</th>
                  <th>Period 5 (02:05)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Monday</td>
                  <td>Class 10-A (Maths)</td>
                  <td>Class 10-B (Maths)</td>
                  <td>— Free —</td>
                  <td>Class 9-A (Maths)</td>
                  <td>Mentorship Hour</td>
                </tr>
                <tr>
                  <td>Tuesday</td>
                  <td>Class 10-A (Maths)</td>
                  <td>— Free —</td>
                  <td>Class 9-B (Maths)</td>
                  <td>Class 10-B (Maths)</td>
                  <td>Club Activity</td>
                </tr>
                <tr>
                  <td>Wednesday</td>
                  <td>Class 10-B (Maths)</td>
                  <td>Class 10-A (Maths)</td>
                  <td>Class 9-A (Maths)</td>
                  <td>— Free —</td>
                  <td>Class 10-A (Remedial)</td>
                </tr>
                <tr>
                  <td>Thursday</td>
                  <td>— Free —</td>
                  <td>Class 10-A (Maths)</td>
                  <td>Class 10-B (Maths)</td>
                  <td>Class 9-B (Maths)</td>
                  <td>PTA / Staff Meeting</td>
                </tr>
                <tr>
                  <td>Friday</td>
                  <td>Class 9-A (Maths)</td>
                  <td>Class 9-B (Maths)</td>
                  <td>Class 10-A (Maths)</td>
                  <td>— Free —</td>
                  <td>Remedial / Examination Evaluation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer-row">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
          >
            Close Timetable
          </button>
        </div>
      </div>
    </div>
  );
}
