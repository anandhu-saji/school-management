import { useState, useEffect } from "react";
import api from "../../api/axiosclient";

export default function TeacherTimetableTab({
  selectedDivision,
}) {
  const [subView, setSubView] = useState("schedule"); // "schedule" | "duties"
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    weeklySchedule: [],
    exams: [],
    myDuties: [],
    totalDuties: 0,
    teacher: {},
  });

  useEffect(() => {
    let isMounted = true;
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/teacher/timetable?division=${encodeURIComponent(selectedDivision)}`
        );
        if (isMounted && res.data.success && res.data.data) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch timetable:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTimetable();
    return () => {
      isMounted = false;
    };
  }, [selectedDivision]);

  return (
    <div>
      {/* Tab Switcher & Header */}
      <div
        className="dossier-card"
        style={{
          background: "#ffffff",
          padding: "16px 20px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            Teaching Schedule &amp; Examination Invigilation Duties
          </h3>
          <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
            GHSS Rajakkad Academic Calendar &amp; Kerala Pareeksha Bhavan Allotments
          </p>
        </div>

        <div className="filter-group">
          <button
            type="button"
            className={`filter-btn ${subView === "schedule" ? "active" : ""}`}
            onClick={() => setSubView("schedule")}
          >
            📅 Weekly Periods ({data.weeklySchedule?.length || 5} Days)
          </button>
          <button
            type="button"
            className={`filter-btn ${subView === "duties" ? "active" : ""}`}
            onClick={() => setSubView("duties")}
          >
            🛡️ Exam Invigilation ({data.myDuties?.length || 0} Duties)
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Loading timetable and invigilation duties...
        </div>
      ) : subView === "schedule" ? (
        /* ================= 1. WEEKLY TEACHING SCHEDULE ================= */
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {data.weeklySchedule && data.weeklySchedule.length > 0 ? (
            data.weeklySchedule.map((dayItem) => (
              <div
                key={dayItem.day}
                className="dossier-card"
                style={{
                  background: "#ffffff",
                  padding: "18px 22px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "14px",
                    borderBottom: "1px solid #f1f5f9",
                    paddingBottom: "10px",
                  }}
                >
                  <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                    📌 {dayItem.day}
                  </h4>
                  <span
                    style={{
                      fontSize: "11.5px",
                      fontWeight: "700",
                      color: "#2563eb",
                      background: "#eff6ff",
                      padding: "3px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    {dayItem.periods.length} Allotted Periods
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {dayItem.periods.map((p, pIdx) => (
                    <div
                      key={pIdx}
                      style={{
                        padding: "12px 14px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#64748b",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        {p.period}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#0f172a",
                          marginBottom: "4px",
                        }}
                      >
                        {p.subject}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: "11.5px",
                          color: "#475569",
                        }}
                      >
                        <span style={{ fontWeight: "600", color: "#2563eb" }}>
                          🏫 {p.division}
                        </span>
                        <span>📍 {p.room}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              No timetable periods scheduled.
            </div>
          )}
        </div>
      ) : (
        /* ================= 2. OFFICIAL EXAMS & INVIGILATION DUTIES ================= */
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Invigilation Duties Overview Banner */}
          <div
            style={{
              padding: "16px 20px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#1e3a8a", margin: 0 }}>
                Official Pareeksha Bhavan Exam Invigilation Roster
              </h4>
              <p style={{ fontSize: "12px", color: "#3b82f6", margin: "3px 0 0 0" }}>
                You have <strong>{data.myDuties?.length || 0} assigned invigilation sessions</strong> for upcoming board / terminal exams.
              </p>
            </div>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                background: "#2563eb",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              School Code: 06042
            </span>
          </div>

          {data.exams && data.exams.length > 0 ? (
            data.exams.map((exam) => (
              <div
                key={exam._id}
                className="exam-item-card"
                style={{
                  borderLeft: exam.isMyDuty ? "5px solid #2563eb" : "1px solid #e2e8f0",
                  background: exam.isMyDuty ? "#f8fbff" : "#ffffff",
                }}
              >
                <div className="exam-item-top">
                  <div>
                    <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700" }}>
                      {exam.term} • {exam.standard}
                    </div>
                    <h3 className="exam-subject-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span>{exam.subject}</span>
                      {exam.isMyDuty && (
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: "#dbeafe",
                            color: "#1e40af",
                            fontWeight: "800",
                          }}
                        >
                          ⭐ YOUR INVIGILATION DUTY
                        </span>
                      )}
                    </h3>
                  </div>
                  <span className="badge-status paid">
                    ✓ {exam.status || "Approved & Published"}
                  </span>
                </div>

                <div className="exam-meta-row" style={{ marginTop: "10px" }}>
                  <span className="exam-meta-pill">📅 {exam.date}</span>
                  <span className="exam-meta-pill">
                    ⏰ {exam.startTime} - {exam.endTime} ({exam.duration})
                  </span>
                  <span className="exam-meta-pill">🏷️ QP Code: {exam.qpCode}</span>
                  <span className="exam-meta-pill">🏛️ Hall: {exam.hall}</span>
                  <span className="exam-meta-pill">
                    👥 Candidates: {exam.totalCandidates || 242}
                  </span>
                  <span>
                    Invigilator: <strong>{exam.invigilatorName || exam.invigilator || "Staff"}</strong>
                  </span>
                </div>

                {exam.instructions && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "10px 14px",
                      background: "#f1f5f9",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#334155",
                    }}
                  >
                    <strong>Instructions:</strong> {exam.instructions}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              No exams scheduled in repository.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
