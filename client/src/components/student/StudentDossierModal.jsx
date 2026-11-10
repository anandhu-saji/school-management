import { getDocumentUrl } from "../../utils/documentUrl";

export default function StudentDossierModal({
  isOpen,
  onClose,
  displayName,
  displayClass,
  studentProfile,
  user,
  copiedField,
  onCopy,
  getInitials,
}) {
  if (!isOpen) return null;

  return (
    <div className="student-modal-overlay" onClick={onClose}>
      <div
        className="student-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "860px" }}
      >
        <div className="student-modal-header">
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              My Identity &amp; Statutory Documents Dossier
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#64748b" }}>
              Government of Kerala • General Education Dept. • Sampoorna 2.0 Form 6A
            </p>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Profile Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            background: "#f8fafc",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: "800",
              flexShrink: 0,
            }}
          >
            {getInitials(displayName)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>
              {displayName}
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
              {displayClass} • Roll #{studentProfile?.rollNumber || 14} •{" "}
              <strong>{studentProfile?.email || user?.email}</strong>
            </p>
          </div>
          <span
            style={{
              background: "#dcfce7",
              color: "#15803d",
              padding: "5px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
              border: "1px solid #bbf7d0",
            }}
          >
            ✓ Form 6A Certified
          </span>
        </div>

        {/* Dossier Grid */}
        <div className="student-dossier-grid" style={{ marginBottom: "16px" }}>
          {/* 1. Official Statutory Identification */}
          <div className="dossier-card">
            <div className="dossier-card-header">
              <div className="dossier-card-title">
                <span className="icon"></span>
                Statutory Identification
              </div>
            </div>

            <div className="dossier-field-list">
              <div className="dossier-field-item">
                <label>Sampoorna Student UID</label>
                <div className="dossier-field-value">
                  {studentProfile?.sampoornaId || "SMP-06042-892"}
                  <button
                    className="dossier-copy-btn"
                    onClick={() =>
                      onCopy(
                        studentProfile?.sampoornaId || "SMP-06042-892",
                        "sampoorna-modal"
                      )
                    }
                  >
                    {copiedField === "sampoorna-modal" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="dossier-field-item">
                <label>Admission Number</label>
                <div className="dossier-field-value">
                  {studentProfile?.admissionNumber || "ADM-14920"}
                  <button
                    className="dossier-copy-btn"
                    onClick={() =>
                      onCopy(
                        studentProfile?.admissionNumber || "ADM-14920",
                        "adm-modal"
                      )
                    }
                  >
                    {copiedField === "adm-modal" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="dossier-field-item">
                <label>Aadhaar UID Number</label>
                <div className="dossier-field-value">
                  {studentProfile?.aadhaarNumber || "9482-1049-2810"}
                </div>
              </div>

              <div className="dossier-field-item">
                <label>Birth Certificate No</label>
                <div className="dossier-field-value">
                  {studentProfile?.birthCertificateNumber || "BC/IDK/2010/8812"}
                </div>
              </div>

              <div className="dossier-field-item">
                <label>Date of Birth</label>
                <div className="dossier-field-value">
                  {studentProfile?.dob || "14 May 2010"}
                </div>
              </div>

              <div className="dossier-field-item">
                <label>Gender &amp; Blood Group</label>
                <div className="dossier-field-value">
                  {studentProfile?.gender || "Male"} •{" "}
                  <span style={{ color: "#dc2626", fontWeight: "700" }}>
                    {studentProfile?.bloodGroup || "O+"}
                  </span>
                </div>
              </div>

              <div className="dossier-field-item">
                <label>Category &amp; Caste</label>
                <div className="dossier-field-value">
                  {studentProfile?.category || "General"}{" "}
                  {studentProfile?.caste ? `(${studentProfile.caste})` : ""}
                </div>
              </div>

              <div className="dossier-field-item">
                <label>Transfer Certificate</label>
                <div className="dossier-field-value">
                  {studentProfile?.tcNumber || "TC/2024/0912"}
                </div>
              </div>

              <div className="dossier-field-item dossier-field-full">
                <label>Identification Marks (As in TC)</label>
                <div className="dossier-field-value">
                  {studentProfile?.identificationMarks || "Mole on left collarbone"}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Attached Government Documents */}
          <div className="dossier-card">
            <div className="dossier-card-header">
              <div className="dossier-card-title">
                <span className="icon"></span>
                Attached Identity Documents
              </div>
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                PDF / High-Res Image
              </span>
            </div>

            {/* Aadhaar Card Box */}
            <div
              className={`student-doc-card ${
                studentProfile?.idProofUrl ? "attached" : ""
              }`}
            >
              <div className="student-doc-info">
                <div className="student-doc-icon-circle">ID</div>
                <div className="student-doc-text">
                  <h4>Aadhaar Card Copy (UIDAI)</h4>
                  <p>
                    {studentProfile?.idProofFileName ||
                      (studentProfile?.idProofUrl
                        ? "Scanned_Aadhaar_UID.pdf"
                        : "Verified UID Record on File")}
                  </p>
                </div>
              </div>
              <div className="student-doc-actions">
                {studentProfile?.idProofUrl ? (
                  <a
                    href={getDocumentUrl(studentProfile.idProofUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-doc-view"
                  >
                    View Document ↗
                  </a>
                ) : (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#059669",
                      background: "#ecfdf5",
                      padding: "4px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    ✓ Seeded via Aadhaar
                  </span>
                )}
              </div>
            </div>

            {/* Birth Certificate Box */}
            <div
              className={`student-doc-card ${
                studentProfile?.birthCertificateUrl ? "attached" : ""
              }`}
            >
              <div className="student-doc-info">
                <div className="student-doc-icon-circle">BC</div>
                <div className="student-doc-text">
                  <h4>Birth Certificate Copy</h4>
                  <p>
                    {studentProfile?.birthCertificateFileName ||
                      (studentProfile?.birthCertificateUrl
                        ? "Birth_Certificate.pdf"
                        : "Civil Registrar Copy Verified")}
                  </p>
                </div>
              </div>
              <div className="student-doc-actions">
                {studentProfile?.birthCertificateUrl ? (
                  <a
                    href={getDocumentUrl(studentProfile.birthCertificateUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-doc-view"
                  >
                    View Document ↗
                  </a>
                ) : (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#059669",
                      background: "#ecfdf5",
                      padding: "4px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    ✓ Official Record
                  </span>
                )}
              </div>
            </div>

            {/* Prior School */}
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  color: "#64748b",
                  marginBottom: "4px",
                }}
              >
                Prior School &amp; Transfer Record
              </label>
              <div style={{ fontSize: "13px", color: "#1e293b", fontWeight: "600" }}>
                {studentProfile?.previousSchool || "Govt. U.P. School Rajakkad"}
              </div>
            </div>
          </div>

          {/* 3. Family & Contacts */}
          <div className="dossier-card">
            <div className="dossier-card-header">
              <div className="dossier-card-title">
                <span className="icon"></span>
                Family &amp; Guardian Details
              </div>
            </div>

            <div className="dossier-field-list">
              <div className="dossier-field-item">
                <label>Father's Full Name</label>
                <div className="dossier-field-value">
                  {studentProfile?.fatherName || "Mr. S. K. Pillai"}
                </div>
              </div>

              <div className="dossier-field-item">
                <label>Mother's Full Name</label>
                <div className="dossier-field-value">
                  {studentProfile?.motherName || "Mrs. Lakshmi Pillai"}
                </div>
              </div>

              <div className="dossier-field-item">
                <label>Official Guardian</label>
                <div className="dossier-field-value">
                  {studentProfile?.guardian || "Mr. S. K. Pillai"} (
                  {studentProfile?.guardianRelation || "Father"})
                </div>
              </div>

              <div className="dossier-field-item">
                <label>Primary Phone</label>
                <div className="dossier-field-value">
                  {studentProfile?.parentContact || "+91 94471 22334"}
                </div>
              </div>

              <div className="dossier-field-item dossier-field-full">
                <label>Alternate / Emergency Contact</label>
                <div className="dossier-field-value">
                  {studentProfile?.altContact || "+91 94471 55667"}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Residential Address */}
          <div className="dossier-card">
            <div className="dossier-card-header">
              <div className="dossier-card-title">
                <span className="icon"></span>
                Residential Address
              </div>
            </div>

            <div style={{ fontSize: "13.5px", lineHeight: "1.7", color: "#1e293b" }}>
              <div style={{ fontWeight: "700", color: "#0f172a" }}>
                {studentProfile?.address?.houseName || "Thiruvonam Nilayam"}
              </div>
              <div>
                {studentProfile?.address?.street || "Munnar Road"},{" "}
                {studentProfile?.address?.postOffice || "Rajakkad P.O"}
              </div>
              <div>
                {studentProfile?.address?.district || "Idukki"},{" "}
                {studentProfile?.address?.state || "Kerala"} -{" "}
                <strong>{studentProfile?.address?.pincode || "685566"}</strong>
              </div>

              <div
                style={{
                  marginTop: "12px",
                  padding: "8px 10px",
                  background: "#f1f5f9",
                  borderRadius: "6px",
                  fontSize: "11.5px",
                  color: "#475569",
                }}
              >
                Postal Address: {studentProfile?.fullAddress}
              </div>
            </div>
          </div>
          {/* 5. Portal Login & Security Credentials */}
          <div className="dossier-card" style={{ gridColumn: "1 / -1", background: "#f8fafc", border: "1px solid #cbd5e1" }}>
            <div className="dossier-card-header">
              <div className="dossier-card-title">
                <span className="icon">🔐</span>
                Student Portal Credentials &amp; Security
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                padding: "8px 0",
              }}
            >
              <div>
                <div style={{ fontSize: "13px", color: "#1e293b", marginBottom: "4px" }}>
                  <strong>Login Identifier:</strong>{" "}
                  <code>{studentProfile?.email || "Generated via Admission ID"}</code>
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  Default Primary Password:{" "}
                  <code style={{ background: "#e0e7ff", color: "#3730a3", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                    Student@123
                  </code>
                  {" "}— You can customize your password at any time.
                </div>
              </div>
              {onChangePassword && (
                <button
                  type="button"
                  className="primary-button"
                  style={{
                    padding: "8px 16px",
                    fontSize: "12.5px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onClick={() => {
                    onClose();
                    onChangePassword();
                  }}
                >
                  <span>🔑</span> Customize Password
                </button>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            borderTop: "1px solid #e2e8f0",
            paddingTop: "16px",
          }}
        >
          <button className="secondary-button" onClick={onClose}>
            Close
          </button>
          <button className="primary-button" onClick={() => window.print()}>
            Print Dossier (Form 6A)
          </button>
        </div>
      </div>
    </div>
  );
}
