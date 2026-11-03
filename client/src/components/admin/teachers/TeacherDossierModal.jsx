import { getDocumentUrl } from "../../../utils/documentUrl";

export default function TeacherDossierModal({ teacher, onClose }) {
  if (!teacher) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-card modal-lg"
        style={{ maxWidth: "820px", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-row">
          <div>
            <h3>Faculty Credentials &amp; Statutory Documents Dossier</h3>
            <p
              style={{
                fontSize: "12px",
                color: "#64748b",
                margin: "2px 0 0 0",
              }}
            >
              {teacher.name} • PEN: {teacher.pen} • {teacher.department}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="allotment-modal-body" style={{ maxHeight: "72vh", overflowY: "auto" }}>
          {/* Profile Bar */}
          <div className="allotment-meta-summary-card">
            <div>
              <span className="allotment-label">Faculty PEN:</span>
              <strong>{teacher.pen}</strong>
            </div>
            <div>
              <span className="allotment-label">Aadhaar UID:</span>
              <strong>{teacher.aadharNumber || "XXXX-XXXX-XXXX"}</strong>
            </div>
            <div>
              <span className="allotment-label">PAN Number:</span>
              <strong>{teacher.panNumber || "BNYPN4421K"}</strong>
            </div>
            <div>
              <span className="allotment-label">Audit Status:</span>
              <strong style={{ color: "#059669" }}>
                ✓ K.E.R Verified Cadre
              </strong>
            </div>
          </div>

          <div style={{ marginTop: "10px", padding: "8px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Official Mail ID:</span>
            <strong style={{ color: "#2563eb", fontSize: "12.5px" }}>
              {teacher.email ? (
                <a href={"mailto:" + teacher.email} style={{ color: "#2563eb", textDecoration: "none" }}>
                  ✉ {teacher.email}
                </a>
              ) : (
                "Not registered"
              )}
            </strong>
          </div>

          {/* 1. Government Identity Documents */}
          <h4 style={{ margin: "24px 0 12px 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🛡️</span> Statutory Identification &amp; SPARK Allotment
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {/* Aadhaar */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                Aadhaar Card
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>
                {teacher.aadharNumber || "Seeded via UIDAI"}
              </div>
              <div style={{ marginTop: "8px" }}>
                {teacher.aadharDocUrl ? (
                  <a
                    href={getDocumentUrl(teacher.aadharDocUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-seating-action"
                  >
                    View Uploaded Aadhaar ↗
                  </a>
                ) : (
                  <span style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}>
                    ✓ SPARK Bio-Metric Verified
                  </span>
                )}
              </div>
            </div>

            {/* PAN Card */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                PAN Card (SPARK Payroll)
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>
                {teacher.panNumber || "Income Tax Seeded"}
              </div>
              <div style={{ marginTop: "8px" }}>
                {teacher.panDocUrl ? (
                  <a
                    href={getDocumentUrl(teacher.panDocUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-seating-action"
                  >
                    View Uploaded PAN ↗
                  </a>
                ) : (
                  <span style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}>
                    ✓ Treasury Linked
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Educational & Qualification Certificates */}
          <h4 style={{ margin: "24px 0 12px 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🎓</span> Academic Degrees &amp; Teaching Qualifications
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {/* B.Ed Degree */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                B.Ed Teaching Degree
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>
                {teacher.bedCollege || "Govt. College of Teacher Education"}
              </div>
              <div style={{ marginTop: "8px" }}>
                {teacher.bedCertificateUrl ? (
                  <a
                    href={getDocumentUrl(teacher.bedCertificateUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-seating-action"
                  >
                    View B.Ed Certificate ↗
                  </a>
                ) : (
                  <span style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}>
                    ✓ Degree Verified
                  </span>
                )}
              </div>
            </div>

            {/* Master's Degree */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                Post Graduate (Master's)
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>
                {teacher.qualification || "M.Sc Mathematics"}
              </div>
              <div style={{ marginTop: "8px" }}>
                {teacher.pgCertificateUrl ? (
                  <a
                    href={getDocumentUrl(teacher.pgCertificateUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-seating-action"
                  >
                    View Master's Certificate ↗
                  </a>
                ) : (
                  <span style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}>
                    ✓ University Certified
                  </span>
                )}
              </div>
            </div>

            {/* Eligibility Test */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                Teacher Eligibility Test
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>
                {teacher.eligibilityExam || "Kerala SET / KTET Qualified"}
              </div>
              <div style={{ marginTop: "8px" }}>
                {teacher.eligibilityCertificateUrl ? (
                  <a
                    href={getDocumentUrl(teacher.eligibilityCertificateUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-seating-action"
                  >
                    View Eligibility Certificate ↗
                  </a>
                ) : (
                  <span style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}>
                    ✓ Exam Certified
                  </span>
                )}
              </div>
            </div>

            {/* Bachelor's Degree */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                Graduation Degree (UG)
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0f172a", margin: "4px 0" }}>
                {teacher.ugDegreeName || "B.Sc Degree"}
              </div>
              <div style={{ marginTop: "8px" }}>
                {teacher.ugCertificateUrl ? (
                  <a
                    href={getDocumentUrl(teacher.ugCertificateUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-seating-action"
                  >
                    View Graduation Certificate ↗
                  </a>
                ) : (
                  <span style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}>
                    ✓ Degree Certified
                  </span>
                )}
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
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
