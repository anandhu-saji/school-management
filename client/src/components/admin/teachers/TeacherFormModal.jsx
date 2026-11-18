import { useState, useEffect } from "react";
import api from "../../../api/axiosclient";
import { ACADEMIC_WINGS, ALL_CLASSES, fetchDynamicWings } from "../../../utils/classData";
import TeacherCadreTab from "./tabs/TeacherCadreTab";
import TeacherIdProofsTab from "./tabs/TeacherIdProofsTab";
import TeacherQualificationsTab from "./tabs/TeacherQualificationsTab";
import "../../../Styles/AdminDash.css";

// Helper to normalize teacher assigned class to standard Kerala 2.0 academic division
const resolveAssignedClass = (raw) => {
  if (!raw) return "";
  const directMatch = ALL_CLASSES.find((c) => c.name === raw || c.id === raw);
  if (directMatch) return directMatch.name;

  const normalized = String(raw).replace(/[\s-]/g, "").replace(/mentor$/i, "").toLowerCase();
  const fuzzyMatch = ALL_CLASSES.find(
    (c) =>
      c.name.replace(/[\s-]/g, "").toLowerCase() === normalized ||
      c.id.replace(/[\s-]/g, "").toLowerCase() === normalized
  );
  if (fuzzyMatch) return fuzzyMatch.name;
  return raw;
};

export default function TeacherFormModal({
  isOpen,
  onClose,
  editingTeacher,
  activeModalTab,
  setActiveModalTab,
  formData,
  handleFormChange,
  handleDocumentUpload,
  handleRemoveDocument,
  uploadingDoc,
  formSubmitting,
  handleFormSubmit,
  handleDeleteTeacher,
  feedback,
  isEmailVerified,
  setIsEmailVerified,
}) {
  const [academicWings, setAcademicWings] = useState(ACADEMIC_WINGS);

  useEffect(() => {
    if (isOpen) {
      fetchDynamicWings(api).then(setAcademicWings);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentAssignedClass = resolveAssignedClass(formData.assignedClass);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-card modal-lg"
        style={{
          maxWidth: "780px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-row">
          <div>
            <h3>
              {editingTeacher
                ? `Edit Faculty: ${editingTeacher.name}`
                : "Add Teaching Faculty & Submit Credentials"}
            </h3>
            <p
              style={{
                fontSize: "12px",
                color: "#64748b",
                margin: "2px 0 0 0",
              }}
            >
              Kerala Sampoorna Faculty Onboarding &amp; Statutory Credentials
              Dossier
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* TAB NAVIGATION HEADER */}
        <div className="modal-tab-nav">
          <button
            type="button"
            className={`modal-tab-btn ${
              activeModalTab === "general" ? "active" : ""
            }`}
            onClick={() => setActiveModalTab("general")}
          >
            Faculty Cadre Details
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${
              activeModalTab === "idProofs" ? "active" : ""
            }`}
            onClick={() => setActiveModalTab("idProofs")}
          >
            Statutory ID Proofs
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${
              activeModalTab === "qualifications" ? "active" : ""
            }`}
            onClick={() => setActiveModalTab("qualifications")}
          >
            Academic &amp; Qualification Certificates
          </button>
        </div>

        <form
          onSubmit={handleFormSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <div
            className="modal-form-body"
            style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
          >
            {feedback.message && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  fontWeight: "600",
                  background:
                    feedback.type === "error" ? "#fee2e2" : "#dcfce7",
                  color: feedback.type === "error" ? "#b91c1c" : "#15803d",
                }}
              >
                {feedback.message}
              </div>
            )}

            {/* TAB 1: CADRE DETAILS */}
            {activeModalTab === "general" && (
              <TeacherCadreTab
                formData={formData}
                handleFormChange={handleFormChange}
                editingTeacher={editingTeacher}
                currentAssignedClass={currentAssignedClass}
                academicWings={academicWings}
                isEmailVerified={isEmailVerified}
                setIsEmailVerified={setIsEmailVerified}
              />
            )}

            {/* TAB 2: STATUTORY ID PROOFS */}
            {activeModalTab === "idProofs" && (
              <TeacherIdProofsTab
                formData={formData}
                handleFormChange={handleFormChange}
                uploadingDoc={uploadingDoc}
                handleDocumentUpload={handleDocumentUpload}
                handleRemoveDocument={handleRemoveDocument}
              />
            )}

            {/* TAB 3: QUALIFICATIONS */}
            {activeModalTab === "qualifications" && (
              <TeacherQualificationsTab
                formData={formData}
                handleFormChange={handleFormChange}
                uploadingDoc={uploadingDoc}
                handleDocumentUpload={handleDocumentUpload}
                handleRemoveDocument={handleRemoveDocument}
              />
            )}
          </div>

          {/* Modal Footer Controls */}
          <div
            className="modal-footer-row"
            style={{ flexShrink: 0, marginTop: "auto" }}
          >
            {editingTeacher && (
              <button
                type="button"
                className="btn-modal-delete"
                onClick={handleDeleteTeacher}
                disabled={formSubmitting}
              >
                Delete Faculty Record
              </button>
            )}
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
              disabled={formSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-modal-save"
              disabled={formSubmitting}
            >
              {formSubmitting
                ? "Saving..."
                : editingTeacher
                ? "Update Faculty & Credentials"
                : "Register Faculty & Save Dossier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
