/**
 * Export official examination timetables to CSV
 */
export function exportExamTimetableCsv(exams) {
  if (!exams || !exams.length) return;
  const headers = [
    "Examination Name",
    "Exam Date",
    "Time Slot",
    "Standard",
    "Subject Name",
    "QP Code",
    "Halls Allotted",
    "Total Candidates",
    "Invigilators on Duty",
    "Status",
  ];
  const rows = exams.map((e) => [
    `"${e.examName || e.term || "General Exam"}"`,
    `"${e.date}"`,
    `"${e.startTime} - ${e.endTime}"`,
    `"${e.standard}"`,
    `"${e.subject}"`,
    `"${e.qpCode}"`,
    `"${e.hall}"`,
    `"${e.totalCandidates}"`,
    `"${e.invigilator}"`,
    `"${e.status}"`,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `Sampoorna_Exam_Timetable_${Date.now()}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
