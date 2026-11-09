export default function TeacherProfileTab({ teacherProfile }) {
  const profile = teacherProfile || {};

  return (
    <div>
      {/* Service Record Header Banner */}
      <section className="headmaster-hero-card" style={{ marginBottom: "20px" }}>
        <div className="badge-row">
          <span className="badge-governance">GOVERNMENT OF KERALA • GENERAL EDUCATION DEPARTMENT</span>
          <span className="badge-sync">SPARK ID &amp; SAMPOORNA LINKED</span>
        </div>
        <h1>{profile.name || "Mrs. Indu B Nair"}</h1>
        <p>
          GHSS Rajakkad (School Code: 06042) • Permanent Employee Number (PEN):{" "}
          <strong>{profile.penNumber || profile.pen || "849201"}</strong>
        </p>
      </section>

      {/* Profile Details Card Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Card 1: Official Cadre & Service Credentials */}
        <div
          className="dossier-card"
          style={{
            background: "#ffffff",
            padding: "22px 24px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
              borderBottom: "1px solid #f1f5f9",
              paddingBottom: "10px",
            }}
          >
            <span style={{ fontSize: "20px" }}></span>
            <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
              Government Cadre &amp; Designation
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="dossier-field-row">
              <span className="label">Government PEN Number:</span>
              <span className="value" style={{ fontFamily: "monospace", fontWeight: "800", color: "#2563eb" }}>
                {profile.penNumber || profile.pen || "PEN-849201"}
              </span>
            </div>
            <div className="dossier-field-row">
              <span className="label">Official Designation:</span>
              <span className="value">{profile.designation || "HSST (Junior)"}</span>
            </div>
            <div className="dossier-field-row">
              <span className="label">Academic Department:</span>
              <span className="value">{profile.department || "Mathematics"}</span>
            </div>
            <div className="dossier-field-row">
              <span className="label">Employment Type:</span>
              <span className="value">
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: "#dcfce7",
                    color: "#15803d",
                    fontWeight: "700",
                    fontSize: "11.5px",
                  }}
                >
                  {profile.employmentType || "Permanent / Sanctioned"}
                </span>
              </span>
            </div>
            <div className="dossier-field-row">
              <span className="label">Assigned Mentorship Class:</span>
              <span className="value" style={{ fontWeight: "700", color: "#1e3a8a" }}>
                {profile.assignedClass || "Class 10-A"}
              </span>
            </div>
            <div className="dossier-field-row">
              <span className="label">Allotted Teaching Periods:</span>
              <span className="value">{profile.periodsPerWeek || 26} Periods / Week</span>
            </div>
          </div>
        </div>

        {/* Card 2: Contact, Identity & Statutory Qualifications */}
        <div
          className="dossier-card"
          style={{
            background: "#ffffff",
            padding: "22px 24px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
              borderBottom: "1px solid #f1f5f9",
              paddingBottom: "10px",
            }}
          >
            <span style={{ fontSize: "20px" }}></span>
            <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
              Statutory Qualifications &amp; Service
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="dossier-field-row">
              <span className="label">Institutional Email ID:</span>
              <span className="value" style={{ color: "#2563eb", fontWeight: "600" }}>
                {profile.email || "kathalanx@gmail.com"}
              </span>
            </div>
            <div className="dossier-field-row">
              <span className="label">Official Phone Number:</span>
              <span className="value">{profile.phone || "+91 94471 22334"}</span>
            </div>
            <div className="dossier-field-row">
              <span className="label">Date of Entry into Service:</span>
              <span className="value">{profile.joiningDate || "02 June 2018"}</span>
            </div>
            <div className="dossier-field-row">
              <span className="label">Academic Qualifications:</span>
              <span className="value">{profile.qualification || "M.Sc. Mathematics, B.Ed, SET"}</span>
            </div>
            <div className="dossier-field-row">
              <span className="label">Gender:</span>
              <span className="value">{profile.gender || "Female"}</span>
            </div>
            <div className="dossier-field-row">
              <span className="label">Service Verification Status:</span>
              <span className="value" style={{ color: "#16a34a", fontWeight: "700" }}>
                ✓ Verified via SPARK / Kerala General Education
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Duty Guidelines Notice Card */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "18px 22px",
          fontSize: "12.5px",
          color: "#475569",
          lineHeight: "1.6",
        }}
      >
        <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#1e293b", marginBottom: "6px" }}>
          Kerala Education Rules (KER) Class Mentor Responsibilities:
        </h4>
        <ul style={{ paddingLeft: "18px", margin: 0 }}>
          <li>Daily morning roll-call attendance must be entered and locked before 10:15 AM each instructional day.</li>
          <li>Continuous Evaluation (CE) scores must be uploaded before the 25th of every terminal evaluation cycle.</li>
          <li>Student Sampoorna KYC and statutory attendance percentage must be reviewed prior to board hall ticket distribution.</li>
        </ul>
      </div>
    </div>
  );
}
