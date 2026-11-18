import { ALL_CLASSES } from "../../utils/classData.js";

export const generateAttendanceDocuments = (insertedStudents) => {
  const workingDates = [];
  const baseDate = new Date();
  for (let dayOffset = 0; dayOffset < 20; dayOffset++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - dayOffset);
    if (d.getDay() !== 0) {
      workingDates.push(d.toISOString().split("T")[0]);
    }
    if (workingDates.length >= 10) break;
  }

  const attendanceDocsToInsert = [];

  workingDates.forEach((dateStr, dayIndex) => {
    ALL_CLASSES.forEach((cls) => {
      const clsStudents = insertedStudents.filter(
        (s) => s.classDivision === cls.name || s.division === cls.id
      );

      const records = clsStudents.map((s, idx) => {
        const isAbsent = (idx + dayIndex) % 14 === 3;
        const isOnLeave = (idx + dayIndex) % 24 === 7;
        const status = isAbsent ? "Absent" : isOnLeave ? "On Leave" : "Present";
        return {
          studentId: s._id,
          rollNumber: s.rollNumber,
          name: s.name,
          status,
          remarks: isAbsent ? "Unexcused Absence" : isOnLeave ? "Medical Leave Application" : "",
        };
      });

      const totalPresent = records.filter((r) => r.status === "Present").length;
      const totalAbsent = records.filter((r) => r.status === "Absent" || r.status === "On Leave").length;

      attendanceDocsToInsert.push({
        date: dateStr,
        classDivision: cls.name,
        division: cls.id,
        records,
        totalPresent,
        totalAbsent,
        presentCount: totalPresent,
        absentCount: totalAbsent,
        markedBy: dayIndex === 0 ? "admin@ghss.edu (Headmaster Sign-off)" : "Class Mentor Verification",
      });
    });
  });

  return attendanceDocsToInsert;
};
