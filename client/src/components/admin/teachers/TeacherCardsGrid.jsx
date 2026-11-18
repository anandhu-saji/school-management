export default function TeacherCardsGrid({
  loading,
  paginatedTeachers,
  setAllotmentTeacher,
  setDossierTeacher,
  setDelegationTeacher,
  openEditModal,
}) {
  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          color: "#64748b",
          fontWeight: "600",
        }}
      >
        Loading Faculty Directory &amp; PEN Allocation...
      </div>
    );
  }

  if (paginatedTeachers.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          color: "#64748b",
        }}
      >
        No matching faculty records found.
      </div>
    );
  }

  return (
    <div className="teachers-directory-grid">
      {paginatedTeachers.map((t) => {
        let statusClass = "status-pill-active";
        if (t.status === "In Class") statusClass = "status-pill-in-class";
        else if (t.status === "On Duty") statusClass = "status-pill-on-duty";
        else if (t.status === "On Leave") statusClass = "status-pill-on-leave";

        const hasAadhaar = !!t.aadharDocUrl;
        const hasBed = !!t.bedCertificateUrl;

        return (
          <div className="teacher-card" key={t._id}>
            {/* Top Row: Avatar, Name, Dept, Mentor Pill & Status */}
            <div className="teacher-card-header">
              <div className="teacher-profile-left">
                <div className="teacher-avatar-circle">
                  {t.initials || "TR"}
                </div>
                <div className="teacher-meta-name-col">
                  <h3 className="teacher-name-title">
                    <span>{t.name}</span>
                    <span
                      className="teacher-verified-icon"
                      title="Verified Permanent Cadre"
                    >
                      ✓
                    </span>
                  </h3>
                  <div className="teacher-dept-subtext">
                    {t.department}
                  </div>
                  <span className="mentor-charge-pill">
                    {t.assignedClass}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <span className={statusClass}>
                <span className="status-dot"></span>
                {t.status}
              </span>
            </div>

            {/* Metadata Rows: PEN, Official Contact, Periods Allotted */}
            <div className="teacher-card-body">
              <div className="teacher-meta-row">
                <span className="teacher-meta-label">PEN Number</span>
                <span className="teacher-meta-value">{t.pen}</span>
              </div>
              {t.dob && (
                <div className="teacher-meta-row">
                  <span className="teacher-meta-label">Date of Birth</span>
                  <span className="teacher-meta-value">
                    {t.dob} {t.age ? `(${t.age} yrs)` : ""}
                  </span>
                </div>
              )}
              <div className="teacher-meta-row">
                <span className="teacher-meta-label">Official Contact</span>
                <span className="teacher-meta-value">{t.phone}</span>
              </div>
              <div className="teacher-meta-row">
                <span className="teacher-meta-label">Official Mail ID</span>
                <span
                  className="teacher-meta-value"
                  style={{ fontSize: "12px", color: "#2563eb", wordBreak: "break-all" }}
                >
                  {t.email ? t.email : "Not registered"}
                </span>
              </div>
              <div className="teacher-meta-row">
                <span className="teacher-meta-label">Periods Allotted</span>
                <span className="teacher-meta-value">{t.periods}</span>
              </div>
              <div className="teacher-meta-row">
                <span className="teacher-meta-label">Submitted Proofs</span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#059669",
                    background: "#d1fae5",
                    padding: "2px 8px",
                    borderRadius: "10px",
                  }}
                >
                  {hasAadhaar && hasBed
                    ? "✓ Aadhaar & B.Ed Attached"
                    : hasAadhaar || hasBed
                    ? "✓ Partial Dossier Attached"
                    : "KYC & SPARK Seeded"}
                </span>

                {t.isAdmissionAdmin && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: t.isAdmissionAdminActive ? "#ecfdf5" : "#fef2f2",
                      color: t.isAdmissionAdminActive ? "#065f46" : "#991b1b",
                      border: `1px solid ${t.isAdmissionAdminActive ? "#a7f3d0" : "#fecaca"}`,
                    }}
                    title={
                      t.admissionAdminNote ||
                      (t.isAdmissionAdminActive
                        ? "Active Temporary Admission Admin"
                        : "Expired Temporary Admission Admin")
                    }
                  >
                    {t.isAdmissionAdminActive
                      ? "🎓 Admission Admin"
                      : "⌛ Admission Admin (Expired)"}
                  </span>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="teacher-card-footer">
              <button
                type="button"
                className="btn-allotment-link"
                onClick={() => setAllotmentTeacher(t)}
                title="View Teaching Timetable &amp; Duty Allotment"
              >
                Allotment
              </button>
              <button
                type="button"
                className="btn-allotment-link"
                style={{ color: "#0d9488" }}
                onClick={() => setDossierTeacher(t)}
                title="Inspect Submitted ID Proofs &amp; Qualification Certificates"
              >
                Dossier
              </button>
              <button
                type="button"
                className="btn-allotment-link"
                style={{
                  color: t.isAdmissionAdminActive ? "#2563eb" : "#475569",
                  fontWeight: t.isAdmissionAdminActive ? "800" : "600",
                }}
                onClick={() => setDelegationTeacher(t)}
                title="Manage Temporary Student Admission Admin Privileges"
              >
                🎓 Admission Admin
              </button>
              <button
                type="button"
                className="btn-edit-profile-link"
                onClick={() => openEditModal(t)}
                title="Edit Faculty Record &amp; Documents"
              >
                Edit Profile
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
