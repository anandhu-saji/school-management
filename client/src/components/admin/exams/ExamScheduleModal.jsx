import {
  getTodayISODate,
  parseExamDate,
  formatDateToStandard,
  toISODateString,
  validateExamDate,
} from "../../../utils/examDateValidator";

export default function ExamScheduleModal({
  isOpen,
  onClose,
  editingExam,
  formData,
  setFormData,
  formSubmitting,
  onSave,
  feedback,
}) {
  const todayStr = getTodayISODate();

  // Compute ISO string for date picker from current formData.date
  const parsedDate = parseExamDate(formData?.date);
  const isoDateValue = parsedDate ? toISODateString(parsedDate) : "";

  // Real-time validation check
  const dateValidation = formData?.date ? validateExamDate(formData.date) : null;
  const isPastDate = typeof dateValidation === "string" && dateValidation.includes("past");

  const handleDateChange = (e) => {
    const isoVal = e.target.value;
    if (!isoVal) {
      setFormData({ ...formData, date: "" });
      return;
    }
    const d = parseExamDate(isoVal);
    if (d) {
      const formatted = formatDateToStandard(d);
      setFormData({
        ...formData,
        date: formatted,
        examDate: isoVal,
      });
    } else {
      setFormData({
        ...formData,
        date: isoVal,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div
        className="modal-container"
        style={{ maxWidth: "720px", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {editingExam
              ? "Edit Examination Session"
              : "Schedule New Examination Session"}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {feedback.message && (
          <div
            style={{
              margin: "12px 24px 0 24px",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              background: feedback.type === "success" ? "#dcfce7" : "#fee2e2",
              color: feedback.type === "success" ? "#166534" : "#991b1b",
            }}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={onSave} className="modal-form-body">
          {/* Row 1: Exam Term & Standard */}
          <div className="form-row-grid">
            <div className="form-group">
              <label className="form-label">Examination Term / Board</label>
              <select
                className="form-input"
                value={formData.term}
                onChange={(e) =>
                  setFormData({ ...formData, term: e.target.value })
                }
                required
              >
                <option value="SSLC Board Examination March 2026">
                  SSLC Board Examination March 2026
                </option>
                <option value="Plus Two Higher Secondary Board Examination 2026">
                  Plus Two Higher Secondary Board Examination 2026
                </option>
                <option value="High School Annual Evaluation (Class 8 & 9)">
                  High School Annual Evaluation (Class 8 &amp; 9)
                </option>
                <option value="First Terminal Model Evaluation">
                  First Terminal Model Evaluation
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Academic Standard</label>
              <select
                className="form-input"
                value={formData.standard}
                onChange={(e) =>
                  setFormData({ ...formData, standard: e.target.value })
                }
                required
              >
                <option value="Standard 10 (SSLC)">
                  Standard 10 (SSLC Cadre)
                </option>
                <option value="Standard 12 (Plus Two Science)">
                  Standard 12 (Plus Two Science)
                </option>
                <option value="Standard 12 (Plus Two Commerce)">
                  Standard 12 (Plus Two Commerce)
                </option>
                <option value="Standard 9">Standard 9</option>
                <option value="Standard 8">Standard 8</option>
              </select>
            </div>
          </div>

          {/* Row 2: Subject & QP Code */}
          <div className="form-row-grid">
            <div className="form-group">
              <label className="form-label">Subject Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mathematics / Physics"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Question Paper Code (QP) *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. MAT-104 or PHY-105"
                value={formData.qpCode}
                onChange={(e) =>
                  setFormData({ ...formData, qpCode: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Row 3: Exam Date, Start Time & End Time */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr",
              gap: "12px",
            }}
          >
            <div className="form-group">
              <label
                className="form-label"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Date of Exam *</span>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "normal" }}>
                  (Min: Today)
                </span>
              </label>
              <input
                type="date"
                className="form-input"
                min={todayStr}
                value={isoDateValue}
                onChange={handleDateChange}
                style={
                  isPastDate
                    ? { borderColor: "#ef4444", backgroundColor: "#fef2f2" }
                    : {}
                }
                required
              />
              {formData.date && (
                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: isPastDate ? "#dc2626" : "#047857",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {isPastDate ? (
                    <>⚠️ {dateValidation}</>
                  ) : (
                    <>📅 {formData.date}</>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="text"
                className="form-input"
                placeholder="09:30 AM"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="text"
                className="form-input"
                placeholder="12:15 PM"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
              />
            </div>
          </div>

          {/* Row 4: Allocated Halls & Total Candidates */}
          <div className="form-row-grid">
            <div className="form-group">
              <label className="form-label">Allocated Exam Halls</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Halls 01, 02, 03, 04"
                value={formData.hall}
                onChange={(e) =>
                  setFormData({ ...formData, hall: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Candidates</label>
              <input
                type="number"
                className="form-input"
                placeholder="242"
                value={formData.totalCandidates}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalCandidates: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {/* Row 5: Invigilators & Status */}
          <div className="form-row-grid">
            <div className="form-group">
              <label className="form-label">
                Chief Invigilators / Observers
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mrs. Indu B Nair, Sri. George K."
                value={formData.invigilator}
                onChange={(e) =>
                  setFormData({ ...formData, invigilator: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Approval Status</label>
              <select
                className="form-input"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Approved & Published">
                  Approved &amp; Published
                </option>
                <option value="Draft / Scheduled">
                  Draft / Scheduled
                </option>
                <option value="Completed">Completed</option>
                <option value="Postponed">Postponed</option>
              </select>
            </div>
          </div>

          {/* Row 6: Marks Breakdown */}
          <div className="form-row-grid">
            <div className="form-group">
              <label className="form-label">Maximum Marks</label>
              <input
                type="number"
                className="form-input"
                placeholder="80"
                value={formData.maxMarks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxMarks: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Minimum Pass Marks</label>
              <input
                type="number"
                className="form-input"
                placeholder="24"
                value={formData.passMarks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    passMarks: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="form-group">
            <label className="form-label">Special Exam Instructions</label>
            <textarea
              className="form-input"
              rows="2"
              placeholder="e.g. 15 minutes cool-off time provided before writing starts..."
              value={formData.instructions}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
            ></textarea>
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-actions-row">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={formSubmitting || isPastDate}
              title={isPastDate ? "Cannot schedule exam for a past date" : ""}
            >
              {formSubmitting
                ? "Saving Schedule..."
                : editingExam
                ? "Update Schedule"
                : "Save & Publish Exam"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
