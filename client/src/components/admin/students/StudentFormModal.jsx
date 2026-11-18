import { useRef, useState, useEffect } from "react";
import api from "../../../api/axiosclient";
import { ACADEMIC_WINGS, normalizeClassDivision, fetchDynamicWings } from "../../../utils/classData";
import PersonalDetailsTab from "./tabs/PersonalDetailsTab";
import IdProofsTab from "./tabs/IdProofsTab";
import FamilyDetailsTab from "./tabs/FamilyDetailsTab";
import AddressDetailsTab from "./tabs/AddressDetailsTab";
import "../../../Styles/AdminDash.css";

export default function StudentFormModal({
  isOpen,
  onClose,
  editingStudent,
  activeModalTab,
  setActiveModalTab,
  formData,
  handleFormChange,
  handleFileUpload,
  handleRemoveUploadedFile,
  uploadingIdProof,
  uploadingBcProof,
  formSubmitting,
  handleFormSubmit,
  handleDeleteStudent,
  feedback,
  isEmailVerified,
  setIsEmailVerified,
}) {
  const fileInputRef = useRef(null);
  const bcFileInputRef = useRef(null);
  const [academicWings, setAcademicWings] = useState(ACADEMIC_WINGS);

  useEffect(() => {
    if (isOpen) {
      fetchDynamicWings(api).then(setAcademicWings);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizedDiv = normalizeClassDivision(formData.division);
  const currentDivisionName = normalizedDiv
    ? normalizedDiv.name
    : formData.division || "Class 10-A";

  const handleNextTab = () => {
    if (activeModalTab === "personal") setActiveModalTab("idproofs");
    else if (activeModalTab === "idproofs") setActiveModalTab("family");
    else if (activeModalTab === "family") setActiveModalTab("address");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-card modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-row">
          <div>
            <h3>
              {editingStudent
                ? `Edit Student: ${editingStudent.name}`
                : "New Student Admission"}
            </h3>
            <p
              style={{
                fontSize: "12px",
                color: "#64748b",
                margin: "2px 0 0 0",
              }}
            >
              Kerala Sampoorna Student Identity &amp; Statutory KYC Registry
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Modal Tab Strip */}
        <div className="modal-tab-nav">
          <button
            type="button"
            className={`modal-tab-btn ${
              activeModalTab === "personal" ? "active" : ""
            }`}
            onClick={() => setActiveModalTab("personal")}
          >
            Academic &amp; Personal
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${
              activeModalTab === "idproofs" ? "active" : ""
            }`}
            onClick={() => setActiveModalTab("idproofs")}
          >
            ID Proofs &amp; KYC
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${
              activeModalTab === "family" ? "active" : ""
            }`}
            onClick={() => setActiveModalTab("family")}
          >
            Parents &amp; Contacts
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${
              activeModalTab === "address" ? "active" : ""
            }`}
            onClick={() => setActiveModalTab("address")}
          >
            Residence &amp; TC
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="modal-form-body">
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

            {activeModalTab === "personal" && (
              <PersonalDetailsTab
                formData={formData}
                handleFormChange={handleFormChange}
                editingStudent={editingStudent}
                isEmailVerified={isEmailVerified}
                setIsEmailVerified={setIsEmailVerified}
                currentDivisionName={currentDivisionName}
                academicWings={academicWings}
              />
            )}

            {activeModalTab === "idproofs" && (
              <IdProofsTab
                formData={formData}
                handleFormChange={handleFormChange}
                handleFileUpload={handleFileUpload}
                handleRemoveUploadedFile={handleRemoveUploadedFile}
                uploadingIdProof={uploadingIdProof}
                uploadingBcProof={uploadingBcProof}
                fileInputRef={fileInputRef}
                bcFileInputRef={bcFileInputRef}
              />
            )}

            {activeModalTab === "family" && (
              <FamilyDetailsTab
                formData={formData}
                handleFormChange={handleFormChange}
              />
            )}

            {activeModalTab === "address" && (
              <AddressDetailsTab
                formData={formData}
                handleFormChange={handleFormChange}
              />
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="modal-footer-row">
            {editingStudent && (
              <button
                type="button"
                className="btn-modal-delete"
                onClick={handleDeleteStudent}
                disabled={formSubmitting}
              >
                Delete Record
              </button>
            )}

            {activeModalTab !== "address" ? (
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={handleNextTab}
              >
                Next Tab →
              </button>
            ) : null}

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
              disabled={formSubmitting || uploadingIdProof || uploadingBcProof}
            >
              {formSubmitting
                ? "Saving..."
                : editingStudent
                ? "Update Student Record"
                : "Complete Admission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
