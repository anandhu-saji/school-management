/**
 * CSV Export utility for Kerala Sampoorna Government Faculty Cadre
 */
export function exportTeacherRosterCsv(teachers) {
  if (!teachers || !teachers.length) return;
  const headers = [
    "PEN Number",
    "Teacher Full Name",
    "Department / Cadre",
    "Assigned Class / Mentorship",
    "Contact Phone",
    "Periods / Week",
    "Duty Status",
    "Qualification",
    "Appointment Date",
    "Aadhaar Number",
    "Aadhaar Attached",
    "PAN Number",
    "PAN Attached",
    "B.Ed College",
    "B.Ed Attached",
    "Eligibility Exam",
    "SET / KTET Attached",
    "Documents Verified",
  ];

  const rows = teachers.map((t) => [
    t.pen,
    `"${t.name || ""}"`,
    `"${t.department || ""}"`,
    `"${t.assignedClass || ""}"`,
    t.phone,
    `"${t.periods || ""}"`,
    t.status,
    `"${t.qualification || ""}"`,
    t.appointmentDate,
    `"${t.aadharNumber || "Pending"}"`,
    t.aadharDocUrl ? "Yes" : "No",
    `"${t.panNumber || "Pending"}"`,
    t.panDocUrl ? "Yes" : "No",
    `"${t.bedCollege || "N/A"}"`,
    t.bedCertificateUrl ? "Yes" : "No",
    `"${t.eligibilityExam || "N/A"}"`,
    t.eligibilityCertificateUrl ? "Yes" : "No",
    t.documentsVerified ? "Verified (Rule 12 KER)" : "Pending",
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `Sampoorna_Faculty_Cadre_Dossier_${Date.now()}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
