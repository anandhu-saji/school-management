export default function TeacherMarksEntryTable({
  records,
  loading,
  cleanDivision,
  maxMarks,
  passMarks,
  handleMarkChange,
  handleToggleAbsent,
  handleRemarkChange,
}) {
  return (
    <div className="roster-card">
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Loading student roster and assessment records...
        </div>
      ) : records.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          No students registered for {cleanDivision}.
        </div>
      ) : (
        <table className="roster-table">
          <thead>
            <tr>
              <th style={{ width: "50px" }}>Roll</th>
              <th>Candidate Name</th>
              <th>Admission #</th>
              <th style={{ width: "130px", textAlign: "center" }}>
                Marks (Max: {maxMarks})
              </th>
              <th style={{ width: "80px", textAlign: "center" }}>Absent</th>
              <th style={{ width: "80px", textAlign: "center" }}>Grade</th>
              <th>Teacher Remarks &amp; Feedback</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const isPassing = Number(r.marksObtained) >= Number(passMarks);
              return (
                <tr
                  key={r.studentId}
                  className={r.isAbsent ? "row-absent" : ""}
                >
                  <td style={{ fontWeight: "700" }}>{r.rollNumber}</td>
                  <td>
                    <strong>{r.studentName}</strong>
                  </td>
                  <td
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontFamily: "monospace",
                    }}
                  >
                    {r.admissionNumber}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <input
                      type="number"
                      min="0"
                      max={maxMarks}
                      disabled={r.isAbsent}
                      value={r.marksObtained}
                      onChange={(e) =>
                        handleMarkChange(r.studentId, e.target.value)
                      }
                      placeholder="0"
                      style={{
                        width: "75px",
                        padding: "6px 10px",
                        borderRadius: "7px",
                        border: `1px solid ${
                          r.marksObtained === ""
                            ? "#cbd5e1"
                            : isPassing
                            ? "#86efac"
                            : "#fca5a5"
                        }`,
                        background: r.isAbsent ? "#f1f5f9" : "#ffffff",
                        fontSize: "14px",
                        fontWeight: "700",
                        textAlign: "center",
                        color: r.isAbsent ? "#94a3b8" : "#0f172a",
                      }}
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(r.isAbsent)}
                      onChange={(e) =>
                        handleToggleAbsent(r.studentId, e.target.checked)
                      }
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                      }}
                      title="Mark candidate absent"
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontWeight: "800",
                        fontSize: "12px",
                        background:
                          r.grade === "A+" || r.grade === "A"
                            ? "#dcfce7"
                            : r.grade === "B+" || r.grade === "B"
                            ? "#dbeafe"
                            : r.grade === "C+" || r.grade === "C"
                            ? "#fef3c7"
                            : r.grade === "AB"
                            ? "#f1f5f9"
                            : "#fee2e2",
                        color:
                          r.grade === "A+" || r.grade === "A"
                            ? "#15803d"
                            : r.grade === "B+" || r.grade === "B"
                            ? "#1d4ed8"
                            : r.grade === "C+" || r.grade === "C"
                            ? "#b45309"
                            : r.grade === "AB"
                            ? "#64748b"
                            : "#b91c1c",
                      }}
                    >
                      {r.grade || "-"}
                    </span>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={r.remarks || ""}
                      onChange={(e) =>
                        handleRemarkChange(r.studentId, e.target.value)
                      }
                      placeholder="e.g. Good assignment, Needs practice..."
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12.5px",
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
