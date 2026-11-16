import { useState, useEffect } from "react";
import api from "../../../api/axiosclient";
import "../../../Styles/AdminDash.css";

const WING_OPTIONS = [
  {
    code: "lp_school",
    name: "Lower Primary (LP School)",
    short: "LP School",
    standards: ["Class 1", "Class 2", "Class 3", "Class 4"],
    defaultStream: "Primary",
  },
  {
    code: "up_school",
    name: "Upper Primary (UP School)",
    short: "UP School",
    standards: ["Class 5", "Class 6", "Class 7"],
    defaultStream: "General",
  },
  {
    code: "high_school",
    name: "High School Section",
    short: "High School",
    standards: ["Class 8", "Class 9", "Class 10"],
    defaultStream: "General",
  },
  {
    code: "higher_secondary",
    name: "Higher Secondary Section",
    short: "Higher Secondary",
    standards: ["Class 11", "Class 12"],
    defaultStream: "Bio-Maths",
  },
];

export default function AddClassModal({ isOpen, onClose, onClassAdded }) {
  const [selectedWingCode, setSelectedWingCode] = useState("high_school");
  const [standard, setStandard] = useState("Class 10");
  const [isCustomStandard, setIsCustomStandard] = useState(false);
  const [customStandard, setCustomStandard] = useState("");
  const [section, setSection] = useState("C");
  const [stream, setStream] = useState("General");
  const [room, setRoom] = useState("Room 16 (Main Block)");
  const [mentor, setMentor] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(45);
  const [teachersList, setTeachersList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Fetch registered teachers for mentor assignment
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const fetchTeachers = async () => {
      try {
        const res = await api.get("/admin/teachers");
        if (isMounted && res.data.success) {
          setTeachersList(res.data.teachers || []);
        }
      } catch {
        // ignore
      }
    };
    fetchTeachers();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // When wing changes, update default standard and stream
  const handleWingChange = (wingCode) => {
    setSelectedWingCode(wingCode);
    const foundWing = WING_OPTIONS.find((w) => w.code === wingCode);
    if (foundWing) {
      setIsCustomStandard(false);
      setStandard(foundWing.standards[foundWing.standards.length - 1] || "Class 10");
      setStream(foundWing.defaultStream);
      setRoom(`${foundWing.short} Academic Block`);
    }
  };

  if (!isOpen) return null;

  const currentWing =
    WING_OPTIONS.find((w) => w.code === selectedWingCode) || WING_OPTIONS[2];

  const resolvedStandard = isCustomStandard
    ? customStandard.trim() || "Class Custom"
    : standard;
  const cleanStandardNum = resolvedStandard.replace(/^Class\s*/i, "").trim();
  const canonId = `${cleanStandardNum}-${section.trim() || "A"}`;
  const canonName = `Class ${canonId}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!section.trim()) {
      setFeedback({ type: "error", message: "Section / Division is required." });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        standard: resolvedStandard,
        section: section.trim(),
        wing: currentWing.name,
        wingShort: currentWing.short,
        wingCode: currentWing.code,
        stream: stream.trim() || "General",
        room: room.trim() || `${currentWing.short} Academic Room`,
        mentor: mentor.trim() || "Assigned Class Mentor",
        maxCapacity: Number(maxCapacity) || 45,
      };

      const res = await api.post("/admin/classes", payload);
      if (res.data.success) {
        if (onClassAdded) {
          onClassAdded(res.data.class);
        }
        onClose();
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to add academic division.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content-card modal-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "660px", width: "95%" }}
      >
        <div className="modal-header-row">
          <div>
            <h3>Add New Academic Class &amp; Division</h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
              Register a new academic division to the school roster for GHSS Rajakkad.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {feedback && (
          <div
            style={{
              padding: "10px 14px",
              margin: "14px 24px 0 24px",
              borderRadius: "6px",
              backgroundColor: feedback.type === "error" ? "#fee2e2" : "#dcfce7",
              color: feedback.type === "error" ? "#991b1b" : "#166534",
              border: `1px solid ${feedback.type === "error" ? "#fca5a5" : "#86efac"}`,
              fontSize: "13px",
            }}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-form-body">
            {/* Live Preview Pill Card */}
            <div className="live-class-preview-card">
              <div>
                <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
                  PREVIEW DIVISION NAME
                </span>
                <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>
                  {canonName}
                </div>
                <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>
                  ID: <strong>{canonId}</strong> &bull; {currentWing.short} &bull; Stream: {stream || "General"}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#e0f2fe",
                  color: "#0369a1",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  border: "1px solid #bae6fd",
                }}
              >
                {currentWing.short}
              </div>
            </div>

            {/* Academic Wing Selector */}
            <div className="form-field-group" style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#1e293b" }}>
                Academic Wing *
              </label>
              <div className="wing-select-grid">
                {WING_OPTIONS.map((w) => (
                  <button
                    key={w.code}
                    type="button"
                    onClick={() => handleWingChange(w.code)}
                    className={`wing-select-btn ${selectedWingCode === w.code ? "active" : ""}`}
                  >
                    <div className="wing-select-title">
                      {w.short}
                    </div>
                    <div className="wing-select-desc">{w.standards}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              {/* Standard / Grade */}
              <div className="form-field-group">
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#1e293b" }}>
                  Standard / Grade *
                </label>
                {!isCustomStandard ? (
                  <select
                    value={standard}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setIsCustomStandard(true);
                      } else {
                        setStandard(e.target.value);
                      }
                    }}
                    className="form-input"
                    style={{ width: "100%", height: "42px" }}
                  >
                    {currentWing.standards.map((std) => (
                      <option key={std} value={std}>
                        {std}
                      </option>
                    ))}
                    <option value="custom">+ Custom Standard / KG</option>
                  </select>
                ) : (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      placeholder="e.g. Class 10 or UKG"
                      value={customStandard}
                      onChange={(e) => setCustomStandard(e.target.value)}
                      className="form-input"
                      style={{ flex: 1, height: "42px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomStandard(false)}
                      className="btn-modal-cancel"
                      style={{ height: "42px", padding: "0 12px" }}
                    >
                      Select
                    </button>
                  </div>
                )}
              </div>

              {/* Section / Division */}
              <div className="form-field-group">
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#1e293b" }}>
                  Section / Division *
                </label>
                <input
                  type="text"
                  placeholder="e.g. C, D, Science, Commerce"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="form-input"
                  style={{ width: "100%", height: "42px" }}
                  required
                />
                <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                  {["A", "B", "C", "D", "E"].map((btnSec) => (
                    <button
                      key={btnSec}
                      type="button"
                      onClick={() => setSection(btnSec)}
                      className={`division-letter-pill ${section === btnSec ? "active" : ""}`}
                    >
                      {btnSec}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              {/* Stream */}
              <div className="form-field-group">
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#1e293b" }}>
                  Academic Stream / Curriculum
                </label>
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="form-input"
                  style={{ width: "100%", height: "42px" }}
                >
                  <option value="General">General</option>
                  <option value="Primary">Primary (LP)</option>
                  <option value="General (SSLC Cadre)">General (SSLC Cadre)</option>
                  <option value="Bio-Maths">Science (Bio-Maths)</option>
                  <option value="Computer App">Commerce (Computer App)</option>
                  <option value="Humanities">Humanities (Sociology/Hist)</option>
                  <option value="Vocational">Vocational / Skill</option>
                </select>
              </div>

              {/* Max Capacity */}
              <div className="form-field-group">
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#1e293b" }}>
                  Target Capacity (Seats)
                </label>
                <input
                  type="number"
                  min="10"
                  max="70"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  className="form-input"
                  style={{ width: "100%", height: "42px" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {/* Room Allocation */}
              <div className="form-field-group">
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#1e293b" }}>
                  Classroom / Room Allocation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room 16 (Main Block)"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="form-input"
                  style={{ width: "100%", height: "42px" }}
                />
              </div>

              {/* Class Mentor */}
              <div className="form-field-group">
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#1e293b" }}>
                  Class Mentor / Teacher In-charge
                </label>
                <input
                  list="teachers-datalist"
                  placeholder="Select or enter teacher name"
                  value={mentor}
                  onChange={(e) => setMentor(e.target.value)}
                  className="form-input"
                  style={{ width: "100%", height: "42px" }}
                />
                <datalist id="teachers-datalist">
                  {teachersList.map((t) => (
                    <option key={t._id} value={`${t.name} (${t.designation || "Faculty"})`} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer-row">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-modal-save"
              disabled={submitting}
            >
              {submitting ? "Adding Division..." : `+ Add ${canonName}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
