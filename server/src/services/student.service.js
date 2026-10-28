import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import { AttendanceStatus } from "../constants/enums.js";

export class StudentService {
  /**
   * Fetches student profile and calculates dynamic attendance percentages across MongoDB logs
   */
  static async getStudentMetrics({ userId, email }) {
    let student = await Student.findOne({ userId });
    if (!student && email) {
      student = await Student.findOne({ email: email.toLowerCase() });
    }

    if (!student) {
      const error = new Error("Student profile record not found.");
      error.statusCode = 404;
      throw error;
    }

    const cleanClass = (student.className || "10-A").replace(/^Class\s+/i, "").trim();

    // Query all saved attendance registers for this division
    const attendanceSheets = await Attendance.find({
      classDivision: cleanClass,
    });

    let totalWorkingDays = 0;
    let presentDays = 0;
    let absentDays = 0;

    attendanceSheets.forEach((sheet) => {
      if (Array.isArray(sheet.records)) {
        const record = sheet.records.find((rec) => rec.studentId === student.studentId);
        if (record) {
          totalWorkingDays += 1;
          if (record.status === AttendanceStatus.PRESENT) {
            presentDays += 1;
          } else if (record.status === AttendanceStatus.ABSENT) {
            absentDays += 1;
          }
        }
      }
    });

    const attendanceRate =
      totalWorkingDays > 0
        ? ((presentDays / totalWorkingDays) * 100).toFixed(1)
        : (parseFloat(student.overallAttendance) || 100).toFixed(1);

    return {
      student: {
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        className: student.className,
        avatarUrl: student.avatarUrl || null,
        avatarBg: student.avatarBg || "blue",
      },
      attendance: {
        rate: `${attendanceRate}%`,
        presentDays,
        absentDays,
        totalWorkingDays,
      },
    };
  }
}