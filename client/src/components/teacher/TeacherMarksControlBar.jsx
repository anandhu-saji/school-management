export default function TeacherMarksControlBar({
  completedExams,
  loadingExams,
  examTerm,
  setExamTerm,
  subject,
  setSubject,
  subjects,
  evaluationType,
  setEvaluationType,
  evaluationTypes,
  maxMarks,
  setMaxMarks,
  passMarks,
  setPassMarks,
}) {
  return (
    <>
      {/* Form Controls Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "5px",
            }}
          >
            <label
              style={{
                margin: 0,
                fontSize: "11px",
                fontWeight: "700",
                color: "#64748b",
              }}
            >
              COMPLETED EXAMINATION *
            </label>
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: "700",
                color: completedExams.length > 0 ? "#15803d" : "#b45309",
                background: completedExams.length > 0 ? "#dcfce7" : "#fef3c7",
                padding: "1px 7px",
                borderRadius: "10px",
              }}
            >
              {completedExams.length > 0 ? "✓ Completed Only" : "0 Completed"}
            </span>
          </div>
          <select
            value={examTerm}
            onChange={(e) => {
              const selectedVal = e.target.value;
              setExamTerm(selectedVal);
              const matched = completedExams.find(
                (ex) => (ex.examName || ex.term) === selectedVal
              );
              if (matched && matched.subject) {
                setSubject(matched.subject);
              }
            }}
            disabled={loadingExams || completedExams.length === 0}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              fontWeight: "600",
              background: completedExams.length === 0 ? "#f8fafc" : "#ffffff",
              color: completedExams.length === 0 ? "#94a3b8" : "#0f172a",
            }}
          >
            {loadingExams ? (
              <option value="">Loading completed examinations...</option>
            ) : completedExams.length === 0 ? (
              <option value="">No Completed Exams Available</option>
            ) : (
              completedExams.map((t) => {
                const name = t.examName || t.term;
                return (
                  <option key={t._id || name} value={name}>
                    {name} — {t.subject} ({t.standard})
                  </option>
                );
              })
            )}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: "700",
              color: "#64748b",
              marginBottom: "5px",
            }}
          >
            SUBJECT
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              fontWeight: "600",
              background: "#ffffff",
            }}
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: "700",
              color: "#64748b",
              marginBottom: "5px",
            }}
          >
            ASSESSMENT COMPONENT
          </label>
          <select
            value={evaluationType}
            onChange={(e) => setEvaluationType(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              fontWeight: "600",
              background: "#ffffff",
            }}
          >
            {evaluationTypes.map((et) => (
              <option key={et} value={et}>
                {et}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "700",
                color: "#64748b",
                marginBottom: "5px",
              }}
            >
              MAX MARKS
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={maxMarks}
              onChange={(e) => setMaxMarks(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                fontWeight: "700",
                textAlign: "center",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "700",
                color: "#64748b",
                marginBottom: "5px",
              }}
            >
              PASS MARKS
            </label>
            <input
              type="number"
              min="0"
              max={maxMarks}
              value={passMarks}
              onChange={(e) => setPassMarks(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                fontWeight: "700",
                textAlign: "center",
              }}
            />
          </div>
        </div>
      </div>

      {completedExams.length === 0 && !loadingExams && (
        <div
          style={{
            marginTop: "16px",
            padding: "14px 18px",
            borderRadius: "10px",
            background: "#fffbeb",
            border: "1px solid #fef3c7",
            color: "#92400e",
            fontSize: "13px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "20px", lineHeight: "1" }}>⚠️</span>
          <div>
            <div style={{ fontWeight: "700" }}>
              Only Completed Exams Appear Here for Marking Grades
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#b45309",
                marginTop: "3px",
                fontWeight: "500",
              }}
            >
              No completed examinations are currently registered for grade entry.
              Only exams that have been officially conducted and marked as
              &quot;Completed&quot; in the Examination Registry appear in this
              evaluation grid.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
