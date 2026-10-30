import Student from "../models/Student.js";
import User from "../models/user.js";
import Attendance from "../models/Attendance.js";
import { AttendanceStatus } from "../constants/enums.js";

export class StudentService {
  /**
   * Fetches student profile and calculates dynamic attendance percentages across MongoDB logs
   */
  static async getStudentMetrics({ userId, email }) {
    let student = null;

    // 1. Try finding by linked userId
    if (userId) {
      student = await Student.findOne({ userId });
    }

    // 2. Fallback to matching by email
    if (!student && email) {
      student = await Student.findOne({ email: email.toLowerCase() });
    }

    // 3. Fallback: match by student's registered full name
    if (!student && userId) {
      const user = await User.findById(userId);
      if (user?.name) {
        student = await Student.findOne({
          name: { $regex: new RegExp(`^${user.name.trim()}$`, "i") },
        });

        // Link student profile to this user for all subsequent logins
        if (student) {
          student.userId = userId;
          if (email) student.email = email.toLowerCase();
          await student.save();
        }
      }
    }

    // 4. If no student document exists yet, auto-generate a profile linked to this account
    if (!student) {
      const user = userId ? await User.findById(userId) : null;
      const count = await Student.countDocuments();
      student = await Student.create({
        userId,
        name: user?.name || (email ? email.split("@")[0] : "Student"),
        email: email ? email.toLowerCase() : undefined,
        rollNumber: count + 1,
        admissionNumber: `ADM-${Date.now().toString().slice(-5)}`,
        classDivision: "Class 10-A",
        className: "Class 10-A",
        overallAttendance: "100",
      });
    }

    const division = (student.className || student.classDivision || "10-A")
      .replace(/^Class\s+/i, "")
      .trim();

    // Query all saved attendance registers for this division
    const attendanceSheets = await Attendance.find({
      $or: [
        { classDivision: division },
        { classDivision: `Class ${division}` },
      ],
    });

    let totalWorkingDays = 0;
    let presentDays = 0;
    let absentDays = 0;

    attendanceSheets.forEach((sheet) => {
      if (Array.isArray(sheet.records)) {
        const record = sheet.records.find((rec) => {
          const recId = rec.studentId?.toString();
          const sId = student._id?.toString();
          const customId = student.studentId || student.admissionNumber;
          return (
            recId === sId ||
            recId === customId ||
            rec.name?.toLowerCase() === student.name?.toLowerCase()
          );
        });

        if (record) {
          totalWorkingDays += 1;
          if (record.status === AttendanceStatus.PRESENT || record.status === "Present") {
            presentDays += 1;
          } else if (record.status === AttendanceStatus.ABSENT || record.status === "Absent") {
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
        _id: student._id,
        name: student.name,
        email: student.email || email,
        studentId: student.studentId || student.admissionNumber || `ADM-${student.rollNumber}`,
        rollNumber: student.rollNumber,
        className: student.className || student.classDivision || "Class 10-A",
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