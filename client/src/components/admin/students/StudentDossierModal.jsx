import { getDocumentUrl } from "../../../utils/documentUrl";

export default function StudentDossierModal({ student, onClose, onEdit }) {
  if (!student) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-card modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-row">
          <div>
            <h3>Student Identity &amp; Statutory KYC Dossier</h3>
            <p
              style={{
                fontSize: "12px",
                color: "#64748b",
                margin: "2px 0 0 0",
              }}
            >
              Kerala Sampoorna Official Student Record • School Code: 06042
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-form-body">
          {/* Header profile brief */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px",
              background: "#eff6ff",
              borderRadius: "12px",
              marginBottom: "20px",
              border: "1px solid #bfdbfe",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "#135bec",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "700",
                }}
              >
                {student.name.charAt(0)}
              </div>
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "#0f172a",
                  }}
                >
                  {student.name}
                </h2>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "13px",
                    color: "#475569",
                  }}
                >
                  Roll No: <strong>{student.rollNoFormatted}</strong> •{" "}
                  {student.division} • Adm No:{" "}
                  <strong>{student.admissionNumber}</strong>
                </p>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <span className="dossier-blood-pill">
                Blood Group: {student.bloodGroup || "O+"}
              </span>
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "12px",
                  color: "#047857",
                  fontWeight: "700",
                }}
              >
                Sampoorna: {student.sampoornaId}
              </div>
            </div>
          </div>

          {/* Dossier Grid */}
          <div className="dossier-preview-grid">
            {/* Statutory ID Proofs */}
            <div className="dossier-card">
              <h4>
                <span>🛡️</span> Statutory ID Proofs &amp; Files
              </h4>
              <div className="dossier-field-row">
                <span className="label">Aadhaar (UID):</span>
                <span className="value">
                  {student.aadhaarNumber ? (
                    <span style={{ color: "#047857" }}>
                      ✓ {student.aadhaarNumber}
                    </span>
                  ) : (
                    <span style={{ color: "#b45309" }}>⚠ Not Linked</span>
                  )}
                </span>
              </div>

              {/* Uploaded Primary ID Proof Document */}
              {student.idProofUrl ? (
                <div className="dossier-doc-preview-box">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "16px" }}>
                      {student.idProofFileType === "pdf" ? "📕" : "🖼️"}
                    </span>
                    <div>
                      <strong style={{ fontSize: "12px", display: "block", color: "#0f172a" }}>
                        {student.idProofFileName || "Aadhaar Card Proof"}
                      </strong>
                      <span style={{ fontSize: "10.5px", color: "#047857" }}>
                        Uploaded Document
                      </span>
                    </div>
                  </div>
                  <a
                    href={getDocumentUrl(student.idProofUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-file-preview"
                  >
                    View Proof ↗
                  </a>
                </div>
              ) : null}

              <div className="dossier-field-row" style={{ marginTop: "8px" }}>
                <span className="label">Birth Certificate:</span>
                <span className="value">
                  {student.birthCertificateNumber || "Registered on File"}
                </span>
              </div>

              {/* Uploaded Birth Certificate Document */}
              {student.birthCertificateUrl ? (
                <div className="dossier-doc-preview-box">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "16px" }}>📋</span>
                    <div>
                      <strong style={{ fontSize: "12px", display: "block", color: "#0f172a" }}>
                        {student.birthCertificateFileName || "Birth_Certificate.pdf"}
                      </strong>
                      <span style={{ fontSize: "10.5px", color: "#047857" }}>
                        Birth Proof File
                      </span>
                    </div>
                  </div>
                  <a
                    href={getDocumentUrl(student.birthCertificateUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-file-preview"
                  >
                    View Copy ↗
                  </a>
                </div>
              ) : null}

              <div className="dossier-field-row">
                <span className="label">Date of Birth:</span>
                <span className="value">{student.dob}</span>
              </div>
              <div className="dossier-field-row">
                <span className="label">Gender:</span>
                <span className="value">{student.gender}</span>
              </div>
              <div className="dossier-field-row">
                <span className="label">Identification Mark:</span>
                <span className="value" style={{ fontSize: "11.5px" }}>
                  {student.identificationMarks || "Recorded in SSLC register"}
                </span>
              </div>
            </div>

            {/* Family & Guardians */}
            <div className="dossier-card">
              <h4>
                <span>👨‍👩‍👧</span> Family &amp; Guardians
              </h4>
              <div className="dossier-field-row">
                <span className="label">Father's Name:</span>
                <span className="value">
                  {student.fatherName || student.guardian}
                </span>
              </div>
              <div className="dossier-field-row">
                <span className="label">Mother's Name:</span>
                <span className="value">
                  {student.motherName || "Not Recorded"}
                </span>
              </div>
              <div className="dossier-field-row">
                <span className="label">Primary Guardian:</span>
                <span className="value">
                  {student.guardian} ({student.guardianRelation || "Father"})
                </span>
              </div>
              <div className="dossier-field-row">
                <span className="label">Contact Mobile:</span>
                <span className="value">{student.parentContact}</span>
              </div>
              <div className="dossier-field-row">
                <span className="label">Student Mail ID:</span>
                <span className="value">
                  {student.email ? (
                    <a
                      href={"mailto:" + student.email}
                      style={{ color: "#2563eb", textDecoration: "none", fontWeight: "600" }}
                    >
                      ✉ {student.email}
                    </a>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>Not registered</span>
                  )}
                </span>
              </div>
              <div className="dossier-field-row">
                <span className="label">Alt / Emergency:</span>
                <span className="value">{student.altContact || "N/A"}</span>
              </div>
            </div>

            {/* Residential Address */}
            <div className="dossier-card">
              <h4>
                <span>📍</span> Residential Address
              </h4>
              <div className="dossier-field-row">
                <span className="label">Full Address:</span>
                <span
                  className="value"
                  style={{
                    maxWidth: "60%",
                    wordBreak: "break-word",
                    fontSize: "12px",
                  }}
                >
                  {student.fullAddress || "Rajakkad P.O, Idukki District, Kerala"}
                </span>
              </div>
              <div className="dossier-field-row">
                <span className="label">District:</span>
                <span className="value">
                  {student.address?.district || "Idukki"}
                </span>
              </div>
              <div className="dossier-field-row">
                <span className="label">PIN Code:</span>
                <span className="value">
                  {student.address?.pincode || "685566"}
                </span>
              </div>
              <div className="dossier-field-row">
                <span className="label">State:</span>
                <span className="value">Kerala</span>
              </div>
            </div>

            {/* Academic & Categorization */}
            <div className="dossier-card">
              <h4>
                <span>🎓</span> Academic &amp; Social Profile
              </h4>
              <div className="dossier-field-row">
                <span className="label">Social Category:</span>
                <span className="value">{student.category}</span>
              </div>
              <div className="dossier-field-row">
                <span className="label">Religion &amp; Caste:</span>
                <span className="value">
                  {student.religion || "Hindu"}{" "}
                  {student.caste ? `(${student.caste})` : ""}
                </span>
              </div>
              <div className="dossier-field-row">
                <span className="label">Previous School:</span>
                <span className="value">
                  {student.previousSchool || "Direct Admission"}
                </span>
              </div>
              <div className="dossier-field-row">
                <span className="label">TC Number:</span>
                <span className="value">{student.tcNumber || "N/A"}</span>
              </div>
              <div className="dossier-field-row">
                <span className="label">Cumulative Attendance:</span>
                <span className="value" style={{ color: "#047857" }}>
                  {student.attendance}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer-row">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn-modal-save"
            onClick={() => {
              const target = student;
              onClose();
              if (onEdit) onEdit(target);
            }}
          >
            ✏️ Edit Records
          </button>
        </div>
      </div>
    </div>
  );
}
