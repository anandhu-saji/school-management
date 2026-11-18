export const exportStudentNominalRollCsv = (students) => {
  if (!students || !students.length) return;
  const headers = [
    "Roll No",
    "Admission No",
    "Sampoorna ID",
    "Student Name",
    "DOB",
    "Gender",
    "Blood Group",
    "Aadhaar Number",
    "Birth Certificate No",
    "ID Proof Uploaded",
    "Division",
    "Father Name",
    "Mother Name",
    "Guardian Name",
    "Parent Contact",
    "Residential Address",
    "District",
    "PIN Code",
    "Category",
    "Attendance %",
  ];
  const rows = students.map((s) => [
    s.rollNumber,
    s.admissionNumber,
    s.sampoornaId,
    `"${s.name}"`,
    s.dob,
    s.gender,
    s.bloodGroup || "O+",
    `"${s.aadhaarNumber || "Pending"}"`,
    `"${s.birthCertificateNumber || "N/A"}"`,
    s.idProofUrl ? `"Yes (${s.idProofFileName || "Document"})"` : '"No"',
    s.division,
    `"${s.fatherName || ""}"`,
    `"${s.motherName || ""}"`,
    `"${s.guardian || ""}"`,
    s.parentContact,
    `"${s.fullAddress || ""}"`,
    `"${s.address?.district || "Idukki"}"`,
    `"${s.address?.pincode || ""}"`,
    `"${s.category}"`,
    s.attendance,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Sampoorna_Nominal_Roll_Full_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default exportStudentNominalRollCsv;
