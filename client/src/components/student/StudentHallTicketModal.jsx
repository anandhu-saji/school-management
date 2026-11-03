export default function StudentHallTicketModal({
  isOpen,
  onClose,
  displayName,
  displayClass,
  studentProfile,
  exams,
}) {
  if (!isOpen) return null;

  return (
    <div className="student-modal-overlay" onClick={onClose}>
      <div
        className="student-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "760px" }}
      >
        <div className="student-modal-header">
          <h3>Kerala Board Examination - Official Hall Ticket</h3>
          <button className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="hall-ticket-container" id="printable-hall-ticket">
          <div className="hall-ticket-header">
            <h2>GOVERNMENT OF KERALA • GENERAL EDUCATION DEPARTMENT</h2>
            <h4>PAREEKSHA BHAVAN, THIRUVANANTHAPURAM</h4>
            <div style={{ fontSize: "12px", fontWeight: "700", marginTop: "4px" }}>
              SSLC BOARD EXAMINATION MARCH 2026 • ADMISSION TICKET
            </div>
          </div>

          <div className="hall-ticket-grid">
            <div className="hall-ticket-details">
              <div>
                <strong>Candidate Name:</strong>
                <div>{displayName}</div>
              </div>
              <div>
                <strong>Sampoorna UID:</strong>
                <div>{studentProfile?.sampoornaId || "SMP-06042-892"}</div>
              </div>
              <div>
                <strong>Roll Number:</strong>
                <div>#{studentProfile?.rollNumber || 14}</div>
              </div>
              <div>
                <strong>Admission No:</strong>
                <div>{studentProfile?.admissionNumber || "ADM-14920"}</div>
              </div>
              <div>
                <strong>Exam Center:</strong>
                <div>G.H.S.S Rajakkad (Code: 06042)</div>
              </div>
              <div>
                <strong>Class &amp; Division:</strong>
                <div>{displayClass}</div>
              </div>
              <div>
                <strong>Date of Birth:</strong>
                <div>{studentProfile?.dob || "14 May 2010"}</div>
              </div>
              <div>
                <strong>Assigned Exam Hall:</strong>
                <div style={{ color: "#1d4ed8", fontWeight: "700" }}>
                  Hall 02 (Room 102 - Science Block)
                </div>
              </div>
            </div>

            <div className="candidate-photo-box">
              <div style={{ fontSize: "28px" }}>🎓</div>
              <div>Affix Attested Photo</div>
            </div>
          </div>

          <table className="student-data-table" style={{ fontSize: "11.5px" }}>
            <thead>
              <tr>
                <th>Date &amp; Day</th>
                <th>Time</th>
                <th>Subject</th>
                <th>QP Code</th>
                <th>Invigilator Initial</th>
              </tr>
            </thead>
            <tbody>
              {(exams.length > 0
                ? exams
                : [
                    { date: "12 Mar 2026, Thu", startTime: "09:30 AM", subject: "Malayalam Part I", qpCode: "MAL-101" },
                    { date: "16 Mar 2026, Mon", startTime: "09:30 AM", subject: "English", qpCode: "ENG-102" },
                    { date: "19 Mar 2026, Thu", startTime: "09:30 AM", subject: "Mathematics", qpCode: "MAT-103" },
                    { date: "23 Mar 2026, Mon", startTime: "09:30 AM", subject: "Physics", qpCode: "PHY-104" },
                  ]
              ).map((e, idx) => (
                <tr key={idx}>
                  <td>{e.date}</td>
                  <td>{e.startTime}</td>
                  <td>
                    <strong>{e.subject}</strong>
                  </td>
                  <td>{e.qpCode}</td>
                  <td style={{ borderBottom: "1px dashed #cbd5e1" }}></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="hall-ticket-footer">
            <div>
              <div className="sign-line">Candidate Signature</div>
            </div>
            <div>
              <div className="sign-line">Headmaster / Chief Supdt.</div>
              <div style={{ fontSize: "10px", color: "#64748b", textAlign: "center" }}>
                Official Seal of G.H.S.S Rajakkad
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "18px",
          }}
        >
          <button className="secondary-button" onClick={onClose}>
            Close
          </button>
          <button className="primary-button" onClick={() => window.print()}>
            🖨️ Print Hall Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
