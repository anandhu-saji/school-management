import { useRef } from "react";
import { ACADEMIC_WINGS, normalizeClassDivision } from "../../../utils/classData";
import { getDocumentUrl } from "../../../utils/documentUrl";
import { checkStudentAgeEligibility } from "../../../utils/ageValidator";
import EmailOtpVerification from "../../common/EmailOtpVerification";

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

  if (!isOpen) return null;

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

            {/* TAB 1: ACADEMIC & PERSONAL */}
            {activeModalTab === "personal" && (
              <div>
                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Student Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Aaditya S. Kumar"
                      value={formData.name}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Student Email ID (Mail ID)</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="student@ghss.edu"
                      value={formData.email}
                      onChange={handleFormChange}
                    />
                    <EmailOtpVerification
                      email={formData.email}
                      purpose="student_admission"
                      isVerified={isEmailVerified}
                      setIsVerified={setIsEmailVerified}
                      disabled={Boolean(editingStudent)}
                    />
                    {!editingStudent && (
                      <div
                        style={{
                          marginTop: "6px",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          fontSize: "11.5px",
                          color: "#1e40af",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>🔑</span>
                        <span>
                          Primary login password: <strong>Student@123</strong>. Students can customize it in their portal.
                        </span>
                      </div>
                    )}</div>
                </div>

                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Roll Number</label>
                    <input
                      type="number"
                      name="rollNumber"
                      placeholder="e.g. 1"
                      value={formData.rollNumber}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Class &amp; Division</label>
                    <select
                      name="division"
                      value={normalizeClassDivision(formData.division)?.name || formData.division}
                      onChange={handleFormChange}
                    >
                      {ACADEMIC_WINGS.map((wing) => (
                        <optgroup key={wing.code} label={wing.wing}>
                          {wing.classes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.stream})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Admission Number</label>
                    <input
                      type="text"
                      name="admissionNumber"
                      placeholder="ADM-14920"
                      value={formData.admissionNumber}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Sampoorna ID</label>
                    <input
                      type="text"
                      name="sampoornaId"
                      placeholder="SMP-06042-881"
                      value={formData.sampoornaId}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row-grid-3">
                  <div className="form-field-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={{ margin: 0 }}>Date of Birth *</label>
                      {formData.dob && (
                        (() => {
                          const check = checkStudentAgeEligibility(formData.dob, formData.division);
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
                              {check.valid ? `✓ ${check.message}` : `${check.message}`}
                            </span>
                          );
                        })()
                      )}
                    </div>
                    <input
                      type="text"
                      name="dob"
                      placeholder="DD/MM/YYYY (e.g. 14/05/2010)"
                      value={formData.dob}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleFormChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-field-group">
                    <label>Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleFormChange}
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-grid-3">
                  <div className="form-field-group">
                    <label>Social Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="OEC">OEC</option>
                    </select>
                  </div>
                  <div className="form-field-group">
                    <label>Religion</label>
                    <select
                      name="religion"
                      value={formData.religion}
                      onChange={handleFormChange}
                    >
                      <option value="Hindu">Hindu</option>
                      <option value="Christian">Christian</option>
                      <option value="Muslim">Muslim</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-field-group">
                    <label>Caste / Community</label>
                    <input
                      type="text"
                      name="caste"
                      placeholder="e.g. Nair, Ezhava, etc."
                      value={formData.caste}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: STATUTORY ID PROOFS & KYC (WITH FILE UPLOAD) */}
            {activeModalTab === "idproofs" && (
              <div>
                <div className="form-section-header">
                  Government Identity Documents &amp; Upload
                </div>

                {/* Aadhaar Number Field */}
                <div className="form-field-group">
                  <label>Aadhaar Card Number (12-Digit UID)</label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    maxLength="14"
                    placeholder="XXXX XXXX XXXX (e.g. 5482 9102 3841)"
                    value={formData.aadhaarNumber}
                    onChange={handleFormChange}
                  />
                  <span className="helper-text">
                    Mandatory for UDISE+ and Kerala Sampoorna direct scholarship
                    seeding.
                  </span>
                </div>

                {/* 1. Upload Aadhaar / Primary ID Proof File */}
                <div className="form-field-group" style={{ marginBottom: "20px" }}>
                  <label>Upload Aadhaar / ID Proof Document (Image or PDF)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileUpload(e, "idProof")}
                  />

                  {formData.idProofUrl ? (
                    <div className="uploaded-file-card">
                      <div className="uploaded-file-info">
                        {formData.idProofFileType === "pdf" ? (
                          <div className="uploaded-pdf-badge">
                            <span>PDF</span>
                          </div>
                        ) : (
                          <img
                            src={getDocumentUrl(formData.idProofUrl)}
                            alt="ID Proof Preview"
                            className="uploaded-file-thumbnail"
                          />
                        )}
                        <div className="uploaded-file-names">
                          <span className="uploaded-file-name">
                            {formData.idProofFileName || "Aadhaar_Proof_Document"}
                          </span>
                          <span className="uploaded-file-status">
                            ✓ Uploaded &amp; Attached
                          </span>
                        </div>
                      </div>
                      <div className="uploaded-file-actions">
                        <a
                          href={getDocumentUrl(formData.idProofUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-file-preview"
                        >
                          View / Open ↗
                        </a>
                        <button
                          type="button"
                          className="btn-file-remove"
                          onClick={() => handleRemoveUploadedFile("idProof")}
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`upload-dropzone ${
                        uploadingIdProof ? "disabled" : ""
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="upload-icon-circle">
                        {uploadingIdProof ? "..." : "Upload"}
                      </div>
                      <p className="upload-prompt-text">
                        {uploadingIdProof
                          ? "Uploading document to secure storage..."
                          : "Click to upload Aadhaar / ID Proof file"}
                      </p>
                      <p className="upload-sub-text">
                        Supports PDF documents or Image files (JPG, PNG, WEBP)
                        up to 10MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Birth Certificate Number Field */}
                <div className="form-field-group">
                  <label>Birth Certificate Registration Number</label>
                  <input
                    type="text"
                    name="birthCertificateNumber"
                    placeholder="e.g. KL-2010-060421-BC"
                    value={formData.birthCertificateNumber}
                    onChange={handleFormChange}
                  />
                </div>

                {/* 2. Upload Birth Certificate File (Optional) */}
                <div className="form-field-group" style={{ marginBottom: "20px" }}>
                  <label>Upload Birth Certificate Copy (Optional - Image or PDF)</label>
                  <input
                    type="file"
                    ref={bcFileInputRef}
                    accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileUpload(e, "birthCertificate")}
                  />

                  {formData.birthCertificateUrl ? (
                    <div className="uploaded-file-card">
                      <div className="uploaded-file-info">
                        <div className="uploaded-pdf-badge" style={{ background: "#e0f2fe", color: "#0369a1", borderColor: "#bae6fd" }}>
                          <span>DOC</span>
                        </div>
                        <div className="uploaded-file-names">
                          <span className="uploaded-file-name">
                            {formData.birthCertificateFileName || "Birth_Certificate"}
                          </span>
                          <span className="uploaded-file-status">
                            ✓ Uploaded &amp; Attached
                          </span>
                        </div>
                      </div>
                      <div className="uploaded-file-actions">
                        <a
                          href={getDocumentUrl(formData.birthCertificateUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-file-preview"
                        >
                          View / Open ↗
                        </a>
                        <button
                          type="button"
                          className="btn-file-remove"
                          onClick={() => handleRemoveUploadedFile("birthCertificate")}
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`upload-dropzone ${
                        uploadingBcProof ? "disabled" : ""
                      }`}
                      onClick={() => bcFileInputRef.current?.click()}
                    >
                      <div className="upload-icon-circle" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                        {uploadingBcProof ? "..." : "Upload"}
                      </div>
                      <p className="upload-prompt-text">
                        {uploadingBcProof
                          ? "Uploading certificate..."
                          : "Click to upload Birth Certificate file (Image or PDF)"}
                      </p>
                      <p className="upload-sub-text">
                        Local Self Government / Corporation registration certificate
                      </p>
                    </div>
                  )}
                </div>

                <div className="form-field-group">
                  <label>Visible Identification Marks (Govt. SSLC)</label>
                  <input
                    type="text"
                    name="identificationMarks"
                    placeholder="e.g. A mole on the right cheek / A small scar on the left forehead"
                    value={formData.identificationMarks}
                    onChange={handleFormChange}
                  />
                  <span className="helper-text">
                    Recorded on the SSLC Book &amp; Hall Ticket for identification.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: PARENTS & GUARDIANS */}
            {activeModalTab === "family" && (
              <div>
                <div className="form-section-header">
                  Parent &amp; Guardian Information
                </div>

                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Father's Full Name</label>
                    <input
                      type="text"
                      name="fatherName"
                      placeholder="e.g. Santhosh Kumar K."
                      value={formData.fatherName}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Mother's Full Name</label>
                    <input
                      type="text"
                      name="motherName"
                      placeholder="e.g. Rekha Santhosh"
                      value={formData.motherName}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Primary Guardian Name *</label>
                    <input
                      type="text"
                      name="guardian"
                      placeholder="e.g. Santhosh Kumar K."
                      value={formData.guardian}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Relationship with Student</label>
                    <select
                      name="guardianRelation"
                      value={formData.guardianRelation}
                      onChange={handleFormChange}
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Grandfather">Grandfather</option>
                      <option value="Grandmother">Grandmother</option>
                      <option value="Uncle">Uncle</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Primary Mobile (SMS / WhatsApp) *</label>
                    <input
                      type="text"
                      name="parentContact"
                      placeholder="+91 94473 11820"
                      value={formData.parentContact}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Emergency / Alternate Contact</label>
                    <input
                      type="text"
                      name="altContact"
                      placeholder="+91 98460 00000"
                      value={formData.altContact}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: RESIDENTIAL ADDRESS & PREVIOUS SCHOOL */}
            {activeModalTab === "address" && (
              <div>
                <div className="form-section-header">
                  Permanent Residential Address
                </div>

                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>House Name / Flat No</label>
                    <input
                      type="text"
                      name="houseName"
                      placeholder="e.g. Parambil House"
                      value={formData.houseName}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Street / Locality</label>
                    <input
                      type="text"
                      name="street"
                      placeholder="e.g. Near GHSS Junction"
                      value={formData.street}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row-grid-3">
                  <div className="form-field-group">
                    <label>Post Office</label>
                    <input
                      type="text"
                      name="postOffice"
                      placeholder="e.g. Rajakkad P.O"
                      value={formData.postOffice}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-field-group">
                    <label>District</label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleFormChange}
                    >
                      <option value="Idukki">Idukki</option>
                      <option value="Ernakulam">Ernakulam</option>
                      <option value="Kottayam">Kottayam</option>
                      <option value="Thrissur">Thrissur</option>
                      <option value="Palakkad">Palakkad</option>
                      <option value="Thiruvananthapuram">
                        Thiruvananthapuram
                      </option>
                      <option value="Kozhikode">Kozhikode</option>
                      <option value="Malappuram">Malappuram</option>
                      <option value="Kannur">Kannur</option>
                      <option value="Kollam">Kollam</option>
                      <option value="Alappuzha">Alappuzha</option>
                      <option value="Pathanamthitta">Pathanamthitta</option>
                      <option value="Wayanad">Wayanad</option>
                      <option value="Kasaragod">Kasaragod</option>
                    </select>
                  </div>
                  <div className="form-field-group">
                    <label>PIN Code</label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="685566"
                      maxLength="6"
                      value={formData.pincode}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-section-header">
                  Previous Education &amp; Transfer
                  Certificate
                </div>

                <div className="form-row-grid-2">
                  <div className="form-field-group">
                    <label>Previous Institution Attended</label>
                    <input
                      type="text"
                      name="previousSchool"
                      placeholder="e.g. St. Mary's High School"
                      value={formData.previousSchool}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Transfer Certificate (TC) Number</label>
                    <input
                      type="text"
                      name="tcNumber"
                      placeholder="e.g. TC/2025/482"
                      value={formData.tcNumber}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>
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

            {/* Quick Next Tab navigation helper */}
            {activeModalTab !== "address" ? (
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => {
                  if (activeModalTab === "personal")
                    setActiveModalTab("idproofs");
                  else if (activeModalTab === "idproofs")
                    setActiveModalTab("family");
                  else if (activeModalTab === "family")
                    setActiveModalTab("address");
                }}
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
