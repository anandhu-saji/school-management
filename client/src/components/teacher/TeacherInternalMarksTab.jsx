import { useState, useEffect, useMemo } from "react";
import api from "../../api/axiosclient";
import { calculateKeralaGrade } from "../../utils/gradeCalculator";

const EXAM_TERMS = [
  "First Terminal Examination 2026",
  "Second Terminal Examination 2026",
  "Onam Model Exam 2026",
  "SSLC Board Model Examination March 2026",
  "Unit Assessment 1",
  "Unit Assessment 2",
];

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Malayalam",
  "Social Science",
  "Hindi",
  "Information Technology",
];

const EVALUATION_TYPES = [
  "Continuous Evaluation (CE)",
  "Written Exam",
  "Practical / Lab",
  "Assignment / Project",
];

export default function TeacherInternalMarksTab({
  selectedDivision,
  teacherProfile,
}) {
  const [examTerm, setExamTerm] = useState(EXAM_TERMS[0]);
  const [subject, setSubject] = useState(teacherProfile.department || "Mathematics");
  const [evaluationType, setEvaluationType] = useState(EVALUATION_TYPES[0]);
  const [maxMarks, setMaxMarks] = useState(evaluationType === "Continuous Evaluation (CE)" ? 20 : 80);
  const [passMarks, setPassMarks] = useState(evaluationType === "Continuous Evaluation (CE)" ? 6 : 24);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Update default maxMarks when evaluationType changes
  useEffect(() => {
    if (evaluationType === "Continuous Evaluation (CE)") {
      setMaxMarks(20);
      setPassMarks(6);
    } else {
      setMaxMarks(80);
      setPassMarks(24);
    }
  }, [evaluationType]);

  // Load marks from backend
  const fetchMarks = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/teacher/internal-marks?division=${encodeURIComponent(
          selectedDivision
        )}&term=${encodeURIComponent(examTerm)}&subject=${encodeURIComponent(
          subject
        )}&type=${encodeURIComponent(evaluationType)}`
      );

      if (res.data.success && res.data.data) {
        const data = res.data.data;
        if (data.maxMarks) setMaxMarks(data.maxMarks);
        if (data.passMarks) setPassMarks(data.passMarks);
        setRecords(data.records || []);
      }
    } catch (err) {
      console.error("Failed to fetch marks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDivision, examTerm, subject, evaluationType]);

  // Handle mark change for an individual student
  const handleMarkChange = (studentId, value) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.studentId === studentId) {
          const numVal = value === "" ? "" : Number(value);
          const validated =
            numVal === ""
              ? ""
              : Math.max(0, Math.min(Number(maxMarks), numVal));

          const gradeRes = calculateKeralaGrade(
            validated === "" ? 0 : validated,
            maxMarks,
            r.isAbsent
          );

          return {
            ...r,
            marksObtained: validated,
            grade: validated === "" ? "-" : gradeRes.grade,
          };
        }
        return r;
      })
    );
  };

  // Toggle Absent checkbox
  const handleToggleAbsent = (studentId, isAbsent) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.studentId === studentId) {
          const gradeRes = calculateKeralaGrade(r.marksObtained, maxMarks, isAbsent);
          return {
            ...r,
            isAbsent,
            grade: isAbsent ? "AB" : gradeRes.grade,
          };
        }
        return r;
      })
    );
  };

  // Handle remarks change
  const handleRemarkChange = (studentId, remarks) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, remarks } : r))
    );
  };

  // Live Summary Calculation
  const stats = useMemo(() => {
    const present = records.filter((r) => !r.isAbsent && r.marksObtained !== "");
    const scores = present.map((r) => Number(r.marksObtained));

    const total = scores.reduce((acc, curr) => acc + curr, 0);
    const average = present.length > 0 ? (total / present.length).toFixed(1) : "0.0";
    const highest = scores.length > 0 ? Math.max(...scores) : 0;
    const lowest = scores.length > 0 ? Math.min(...scores) : 0;
    const passed = present.filter((r) => Number(r.marksObtained) >= Number(passMarks)).length;
    const passPercentage = present.length > 0 ? Math.round((passed / present.length) * 100) : 0;

    return {
      average,
      highest,
      lowest,
      passPercentage,
      evaluatedCount: present.length,
      totalCount: records.length,
    };
  }, [records, passMarks]);

  // Save to database
  const handleSaveMarks = async () => {
    try {
      setSaving(true);
      setFeedback({ type: "", message: "" });

      const payload = {
        classDivision: selectedDivision,
        examTerm,
        subject,
        evaluationType,
        maxMarks: Number(maxMarks),
        passMarks: Number(passMarks),
        records: records.map((r) => ({
          studentId: r.studentId,
          rollNumber: r.rollNumber,
          admissionNumber: r.admissionNumber,
          studentName: r.studentName,
          marksObtained: r.isAbsent ? 0 : Number(r.marksObtained) || 0,
          isAbsent: Boolean(r.isAbsent),
          grade: r.grade,
          remarks: r.remarks,
        })),
        status: "Submitted",
      };

      const res = await api.post("/teacher/internal-marks", payload);
      if (res.data.success) {
        setFeedback({
          type: "success",
          message: `Continuous Evaluation Marks for ${subject} (${examTerm}) saved & locked successfully!`,
        });
        setTimeout(() => setFeedback({ type: "", message: "" }), 3500);
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to save marks.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Configuration & Selection Card */}
      <div
        className="dossier-card"
        style={{
          background: "#ffffff",
          padding: "20px 24px",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
              Continuous Evaluation (CE) &amp; Internal Marks Register
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
              Official Kerala General Education Pareeksha Bhavan Terminal Assessment Grid
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="btn-print-screen"
              onClick={() => window.print()}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🖨️ Export Marksheet
            </button>
            <button
              type="button"
              className="btn-save-attendance"
              disabled={saving || loading}
              onClick={handleSaveMarks}
            >
              {saving ? "Saving Marks..." : "💾 Save & Lock Marks"}
            </button>
          </div>
        </div>

        {/* Form Controls Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "5px" }}>
              EXAMINATION TERM
            </label>
            <select
              value={examTerm}
              onChange={(e) => setExamTerm(e.target.value)}
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
              {EXAM_TERMS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "5px" }}>
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
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "5px" }}>
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
              {EVALUATION_TYPES.map((et) => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "5px" }}>
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
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "5px" }}>
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
      </div>

      {/* Real-time Class Metrics Grid */}
      <div className="overview-stats-grid" style={{ marginBottom: "20px" }}>
        <div className="overview-stat-card">
          <span className="card-label">CLASS AVERAGE</span>
          <div className="overview-number">{stats.average} / {maxMarks}</div>
          <div className="sub-text">{stats.evaluatedCount} of {stats.totalCount} evaluated</div>
        </div>
        <div className="overview-stat-card">
          <span className="card-label">TOP SCORE</span>
          <div className="overview-number text-green">{stats.highest} Marks</div>
          <div className="sub-text">Peak performance in division</div>
        </div>
        <div className="overview-stat-card">
          <span className="card-label">LOWEST SCORE</span>
          <div className="overview-number text-red">{stats.lowest} Marks</div>
          <div className="sub-text">Passing threshold: {passMarks}</div>
        </div>
        <div className="overview-stat-card">
          <span className="card-label">PASS RATE</span>
          <div className="overview-number text-teal">{stats.passPercentage}%</div>
          <div className="sub-text">Kerala SCERT Minimum Cleared</div>
        </div>
      </div>

      {/* Feedback Message */}
      {feedback.message && (
        <div className={`feedback-alert ${feedback.type}`} style={{ marginBottom: "16px" }}>
          {feedback.message}
        </div>
      )}

      {/* Marks Entry Table */}
      <div className="roster-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            Loading student roster and assessment records...
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            No students registered for {selectedDivision}.
          </div>
        ) : (
          <table className="roster-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>Roll</th>
                <th>Candidate Name</th>
                <th>Admission #</th>
                <th style={{ width: "130px", textAlign: "center" }}>Marks (Max: {maxMarks})</th>
                <th style={{ width: "80px", textAlign: "center" }}>Absent</th>
                <th style={{ width: "80px", textAlign: "center" }}>Grade</th>
                <th>Teacher Remarks &amp; Feedback</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const isPassing = Number(r.marksObtained) >= Number(passMarks);
                return (
                  <tr key={r.studentId} className={r.isAbsent ? "row-absent" : ""}>
                    <td style={{ fontWeight: "700" }}>{r.rollNumber}</td>
                    <td>
                      <strong>{r.studentName}</strong>
                    </td>
                    <td style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>
                      {r.admissionNumber}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="number"
                        min="0"
                        max={maxMarks}
                        disabled={r.isAbsent}
                        value={r.marksObtained}
                        onChange={(e) => handleMarkChange(r.studentId, e.target.value)}
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
                        onChange={(e) => handleToggleAbsent(r.studentId, e.target.checked)}
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
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
                        onChange={(e) => handleRemarkChange(r.studentId, e.target.value)}
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
    </div>
  );
}
