import { getDocumentUrl } from "../../../utils/documentUrl";
import { checkTeacherAgeEligibility } from "../../../utils/ageValidator";

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
}) {
  if (!isOpen) return null;

  const renderDocumentUploadCard = (label, urlKey, nameKey, helpText, icon = "📄") => {
    const fileUrl = formData[urlKey];
    const fileName = formData[nameKey];
    const isUploading = uploadingDoc[urlKey];
    const isPdf =
      fileUrl &&
      (fileUrl.toLowerCase().endsWith(".pdf") ||
        (fileName && fileName.toLowerCase().endsWith(".pdf")));

    return (
      <div className="form-field-group" style={{ marginBottom: "16px" }}>
        <label>{label}</label>
        <span className="helper-text" style={{ marginBottom: "6px" }}>
          {helpText}
        </span>

        {fileUrl ? (
          <div className="uploaded-file-card">
            <div className="uploaded-file-info">
              {isPdf ? (
                <div className="uploaded-pdf-badge">
                  <span>PDF</span>
                </div>
              ) : (
                <img
                  src={getDocumentUrl(fileUrl)}
                  alt={fileName}
                  className="uploaded-file-thumbnail"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <div className="uploaded-file-names">
                <span className="uploaded-file-name" title={fileName}>
                  {fileName}
                </span>
                <span className="uploaded-file-status">
                  ✓ Uploaded &amp; Attached
                </span>
              </div>
            </div>

            <div className="uploaded-file-actions">
              <a
                href={getDocumentUrl(fileUrl)}
                target="_blank"
                rel="noreferrer"
                className="btn-file-preview"
                title="View document in new tab"
              >
                View ↗
              </a>
              <button
                type="button"
                className="btn-file-remove"
                onClick={() => handleRemoveDocument(urlKey, nameKey)}
                title="Remove attached document"
              >
                🗑️
              </button>
            </div>
          </div>
        ) : (
          <label
            className={`upload-dropzone ${isUploading ? "disabled" : ""}`}
            style={{ padding: "14px 18px", marginTop: "4px" }}
          >
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
              style={{ display: "none" }}
              onChange={(e) => handleDocumentUpload(e, urlKey, nameKey)}
              disabled={isUploading}
            />
            <div className="upload-icon-circle" style={{ width: "36px", height: "36px", fontSize: "16px" }}>
              {isUploading ? "⏳" : icon}
            </div>
            <p className="upload-prompt-text" style={{ fontSize: "13px" }}>
              {isUploading ? "Uploading file..." : `Click to browse & upload ${label}`}
            </p>
            <p className="upload-sub-text" style={{ fontSize: "11px" }}>
              Accepts PDF or Images (JPG, PNG) up to 10MB
            </p>
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-card"
        style={{ maxWidth: "760px", maxHeight: "92vh" }}
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
            <span>👤</span> Faculty Cadre Details
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${
              activeModalTab === "idProofs" ? "active" : ""
            }`}
            onClick={() => setActiveModalTab("idProofs")}
          >
            <span>🛡️</span> Statutory ID Proofs
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${
              activeModalTab === "qualifications" ? "active" : ""
            }`}
            onClick={() => setActiveModalTab("qualifications")}
          >
            <span>🎓</span> Academic &amp; Qualification Certificates
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

            {/* ---------------- TAB 1: CADRE DETAILS ---------------- */}
            {activeModalTab === "general" && (
              <div>
                <div className="form-field-group">
                  <label>Faculty Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Mrs. Priya Nair"
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Government PEN Number *</label>
                    <input
                      type="text"
                      name="pen"
                      required
                      placeholder="e.g. 849201"
                      value={formData.pen}
                      onChange={handleFormChange}
                    />
                    <span className="helper-text">
                      Permanent Employee Number (SPARK).
                    </span>
                  </div>
                  <div className="form-field-group">
                    <label>Department &amp; Cadre</label>
                    <input
                      type="text"
                      name="department"
                      placeholder="e.g. HSST Malayalam"
                      value={formData.department}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Assigned Division / Mentorship</label>
                    <input
                      type="text"
                      name="assignedClass"
                      placeholder="e.g. Class 10-A Mentor"
                      value={formData.assignedClass}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Periods / Workload Allotted</label>
                    <input
                      type="text"
                      name="periods"
                      placeholder="e.g. 24 hrs / Week"
                      value={formData.periods}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Official Contact Mobile</label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="+91 94471 23450"
                      value={formData.phone}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Official Email ID (Mail ID)</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="teacher@ghssrajakkad.kerala.gov.in"
                      value={formData.email}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={{ margin: 0 }}>Date of Birth (DOB) *</label>
                      {formData.dob && (
                        (() => {
                          const check = checkTeacherAgeEligibility(formData.dob);
                          return (
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "600",
                                color: check.valid ? "#16a34a" : "#dc2626",
                                background: check.valid ? "#f0fdf4" : "#fef2f2",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              {check.valid ? `✓ ${check.message}` : `⚠ ${check.message}`}
                            </span>
                          );
                        })()
                      )}
                    </div>
                    <input
                      type="text"
                      name="dob"
                      required
                      placeholder="DD/MM/YYYY (e.g. 15/05/1988)"
                      value={formData.dob}
                      onChange={handleFormChange}
                    />
                    <span className="helper-text">
                      Statutory entry age under K.E.R: 25 – 60 years.
                    </span>
                  </div>
                  <div className="form-field-group">
                    <label>Date of Appointment</label>
                    <input
                      type="text"
                      name="appointmentDate"
                      placeholder="DD/MM/YYYY"
                      value={formData.appointmentDate}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Current Duty Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                    >
                      <option value="Active">Active</option>
                      <option value="In Class">In Class</option>
                      <option value="On Duty">On Duty</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                  <div className="form-field-group">
                    <label>Teaching Qualification Summary</label>
                    <input
                      type="text"
                      name="qualification"
                      placeholder="e.g. M.A, B.Ed, SET"
                      value={formData.qualification}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 2: STATUTORY ID PROOFS & UPLOADS ---------------- */}
            {activeModalTab === "idProofs" && (
              <div>
                <div className="form-section-header" style={{ marginBottom: "14px" }}>
                  Statutory Government Identification (SPARK / K.E.R Compliant)
                </div>

                {/* Aadhaar Card */}
                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Aadhaar UID Number</label>
                    <input
                      type="text"
                      name="aadharNumber"
                      placeholder="XXXX-XXXX-XXXX"
                      value={formData.aadharNumber}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div>
                    {renderDocumentUploadCard(
                      "Aadhaar Card Copy",
                      "aadharDocUrl",
                      "aadharDocFileName",
                      "Upload Aadhaar front & back copy (PDF or Image)",
                      "🪪"
                    )}
                  </div>
                </div>

                {/* PAN Card */}
                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Permanent Account Number (PAN)</label>
                    <input
                      type="text"
                      name="panNumber"
                      placeholder="e.g. ABCDE1234F"
                      value={formData.panNumber}
                      onChange={handleFormChange}
                    />
                    <span className="helper-text">
                      Required for government treasury &amp; SPARK payroll.
                    </span>
                  </div>
                  <div>
                    {renderDocumentUploadCard(
                      "PAN Card Copy",
                      "panDocUrl",
                      "panDocFileName",
                      "Upload clear copy of PAN Card (PDF or Image)",
                      "💳"
                    )}
                  </div>
                </div>

                {/* SPARK / Govt Appointment Order */}
                <div>
                  {renderDocumentUploadCard(
                    "Government PEN / SPARK Cadre Appointment Order",
                    "penAllotmentDocUrl",
                    "penAllotmentDocFileName",
                    "Official appointment memo / PEN allotment order issued by Director of General Education (PDF / Image)",
                    "📜"
                  )}
                </div>
              </div>
            )}

            {/* ---------------- TAB 3: QUALIFICATIONS & CERTIFICATES ---------------- */}
            {activeModalTab === "qualifications" && (
              <div>
                <div className="form-section-header" style={{ marginBottom: "14px" }}>
                  Mandatory Academic Degrees &amp; Teaching Eligibility
                </div>

                {/* B.Ed Degree (Essential Teaching Qualification) */}
                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>B.Ed / Teaching Training College *</label>
                    <input
                      type="text"
                      name="bedCollege"
                      placeholder="e.g. Govt. College of Teacher Education, Kozhikode"
                      value={formData.bedCollege}
                      onChange={handleFormChange}
                    />
                    <span className="helper-text">
                      Mandatory pedagogical training certificate under K.E.R.
                    </span>
                  </div>
                  <div>
                    {renderDocumentUploadCard(
                      "B.Ed / Teaching Degree Certificate",
                      "bedCertificateUrl",
                      "bedCertificateFileName",
                      "Upload B.Ed Degree certificate or mark list (PDF/Image)",
                      "🎓"
                    )}
                  </div>
                </div>

                {/* Post Graduate Degree (M.Sc / M.A) */}
                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Master's / Post Graduate Degree</label>
                    <input
                      type="text"
                      name="pgDegreeName"
                      placeholder="e.g. M.Sc Mathematics, First Class"
                      value={formData.pgDegreeName}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div>
                    {renderDocumentUploadCard(
                      "Post Graduate (PG) Certificate",
                      "pgCertificateUrl",
                      "pgCertificateFileName",
                      "Upload Master's Degree certificate (PDF/Image)",
                      "📜"
                    )}
                  </div>
                </div>

                {/* Bachelor's Degree (B.Sc / B.A) */}
                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Bachelor's / Graduation Degree</label>
                    <input
                      type="text"
                      name="ugDegreeName"
                      placeholder="e.g. B.Sc Mathematics"
                      value={formData.ugDegreeName}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div>
                    {renderDocumentUploadCard(
                      "Bachelor's (UG) Certificate",
                      "ugCertificateUrl",
                      "ugCertificateFileName",
                      "Upload Bachelor's Degree certificate (PDF/Image)",
                      "📑"
                    )}
                  </div>
                </div>

                {/* SET / KTET / NET Eligibility */}
                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Teacher Eligibility Test Qualified</label>
                    <input
                      type="text"
                      name="eligibilityExam"
                      placeholder="e.g. Kerala SET / KTET Category III / NET"
                      value={formData.eligibilityExam}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div>
                    {renderDocumentUploadCard(
                      "Eligibility Pass Certificate (SET / KTET)",
                      "eligibilityCertificateUrl",
                      "eligibilityCertificateFileName",
                      "Upload SET, KTET, or NET pass certificate (PDF/Image)",
                      "🏅"
                    )}
                  </div>
                </div>

                {/* Experience Certificate */}
                <div>
                  {renderDocumentUploadCard(
                    "Teaching Experience / Prior Service Book Copy (Optional)",
                    "experienceCertificateUrl",
                    "experienceCertificateFileName",
                    "Prior government or aided school service records (PDF/Image)",
                    "📋"
                  )}
                </div>

                {/* Verification Toggle */}
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px 16px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <input
                    type="checkbox"
                    id="documentsVerified"
                    name="documentsVerified"
                    checked={formData.documentsVerified}
                    onChange={handleFormChange}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label
                    htmlFor="documentsVerified"
                    style={{
                      fontSize: "12.5px",
                      fontWeight: "700",
                      color: "#166534",
                      cursor: "pointer",
                      margin: 0,
                      textTransform: "none",
                    }}
                  >
                    Statutory Document Verification Completed by Headmaster /
                    Chief Admin (Rule 12 K.E.R)
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="modal-footer-row">
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
