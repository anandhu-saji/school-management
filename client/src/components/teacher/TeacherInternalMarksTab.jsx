import { useState, useEffect, useMemo } from "react";
import api from "../../api/axiosclient";
import { calculateKeralaGrade } from "../../utils/gradeCalculator";
import TeacherMarksControlBar from "./TeacherMarksControlBar";
import TeacherMarksEntryTable from "./TeacherMarksEntryTable";

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
  const [completedExams, setCompletedExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [examTerm, setExamTerm] = useState("");
  const [subject, setSubject] = useState(teacherProfile.department || "Mathematics");
  const [evaluationType, setEvaluationType] = useState(EVALUATION_TYPES[0]);
  const [maxMarks, setMaxMarks] = useState(evaluationType === "Continuous Evaluation (CE)" ? 20 : 80);
  const [passMarks, setPassMarks] = useState(evaluationType === "Continuous Evaluation (CE)" ? 6 : 24);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const cleanDivision = useMemo(() => {
    return (
      (selectedDivision || "Class 10-A")
        .replace(/\s*(Mentor|Class Teacher|In-charge|Teacher)\s*$/i, "")
        .replace(/\s*\(.*?\)\s*$/, "")
        .trim() || "Class 10-A"
    );
  }, [selectedDivision]);

  // Fetch completed exams from database
  useEffect(() => {
    let isMounted = true;
    const fetchCompletedExams = async () => {
      try {
        setLoadingExams(true);
        const res = await api.get(`/teacher/completed-exams?division=${encodeURIComponent(cleanDivision)}`);
        if (isMounted && res.data.success && Array.isArray(res.data.exams)) {
          // Strictly filter for completed exams only
          const strictlyCompleted = res.data.exams.filter((e) => e.status === "Completed");
          setCompletedExams(strictlyCompleted);
          if (strictlyCompleted.length > 0) {
            setExamTerm((prev) => {
              const names = strictlyCompleted.map((e) => e.examName || e.term);
              if (prev && names.includes(prev)) return prev;
              const firstExam = strictlyCompleted[0];
              if (firstExam.subject) setSubject(firstExam.subject);
              return firstExam.examName || firstExam.term;
            });
          } else {
            setExamTerm("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch completed exams:", err);
      } finally {
        if (isMounted) setLoadingExams(false);
      }
    };

    fetchCompletedExams();
    return () => {
      isMounted = false;
    };
  }, [cleanDivision]);

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
    if (!examTerm) {
      setRecords([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(
        `/teacher/internal-marks?division=${encodeURIComponent(
          cleanDivision
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
    if (!examTerm || completedExams.length === 0) {
      setFeedback({
        type: "error",
        message: "No completed exam selected. Grades can only be entered for completed exams.",
      });
      return;
    }

    try {
      setSaving(true);
      setFeedback({ type: "", message: "" });

      const payload = {
        classDivision: cleanDivision,
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
              Export Marksheet
            </button>
            <button
              type="button"
              className="btn-save-attendance"
              disabled={saving || loading || completedExams.length === 0}
              onClick={handleSaveMarks}
            >
              {saving ? "Saving Marks..." : " Save & Lock Marks"}
            </button>
          </div>
        </div>

        <TeacherMarksControlBar
          completedExams={completedExams}
          loadingExams={loadingExams}
          examTerm={examTerm}
          setExamTerm={setExamTerm}
          subject={subject}
          setSubject={setSubject}
          subjects={SUBJECTS}
          evaluationType={evaluationType}
          setEvaluationType={setEvaluationType}
          evaluationTypes={EVALUATION_TYPES}
          maxMarks={maxMarks}
          setMaxMarks={setMaxMarks}
          passMarks={passMarks}
          setPassMarks={setPassMarks}
        />
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
      <TeacherMarksEntryTable
        records={records}
        loading={loading}
        cleanDivision={cleanDivision}
        maxMarks={maxMarks}
        passMarks={passMarks}
        handleMarkChange={handleMarkChange}
        handleToggleAbsent={handleToggleAbsent}
        handleRemarkChange={handleRemarkChange}
      />
    </div>
  );
}
