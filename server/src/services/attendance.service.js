import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import { AttendanceStatus, LEAVE_LIMITS } from "../constants/enums.js";

export class AttendanceService {
  /**
   * Fetches student muster, existing attendance for the date, Sunday status, and remaining monthly leaves
   */
  static async getAttendanceRegister({ userId, email, date }) {
    const selectedDate = date || new Date().toISOString().slice(0, 10);
    const selectedMonth = selectedDate.slice(0, 7);

    // Weekly holiday check: Sunday is day 0
    const isSunday = new Date(`${selectedDate}T00:00:00`).getDay() === 0;

    // Locate teacher profile
    let teacher = await Teacher.findOne({ userId });
    if (!teacher && email) {
      teacher = await Teacher.findOne({ email: email.toLowerCase() });
    }

    if (!teacher) {
      const error = new Error("Teacher profile not found for this account.");
      error.statusCode = 404;
      throw error;
    }

    const mentorClass = teacher.mentorClass || "10-A";
    const cleanClass = mentorClass.replace(/^Class\s+/i, "").trim();

    // 1. Fetch all students enrolled in this division
    const students = await Student.find({
      className: { $regex: new RegExp(`^(${cleanClass}|Class ${cleanClass})$`, "i") },
    }).sort({ rollNumber: 1 });

    // 2. Fetch all saved sheets in this month to calculate leave quota
    const monthlySheets = await Attendance.find({
      classDivision: cleanClass,
      date: { $regex: new RegExp(`^${selectedMonth}`) },
    });

    // 3. Count past absences per student for this month (excluding selectedDate)
    const monthlyAbsentMap = {};
    for (const sheet of monthlySheets) {
      if (sheet.date !== selectedDate && Array.isArray(sheet.records)) {
        for (const rec of sheet.records) {
          if (rec.status === AttendanceStatus.ABSENT) {
            monthlyAbsentMap[rec.studentId] = (monthlyAbsentMap[rec.studentId] || 0) + 1;
          }
        }
      }
    }

    // 4. Check if attendance has already been saved for selectedDate
    const daySheet = await Attendance.findOne({
      classDivision: cleanClass,
      date: selectedDate,
    });

    const dayStatusMap = {};
    if (daySheet?.records) {
      for (const rec of daySheet.records) {
        dayStatusMap[rec.studentId] = rec.status;
      }
    }

    // 5. Merge records and calculate remaining leaves out of 3 days
    const studentList = students.map((std) => {
      const currentStatus = dayStatusMap[std.studentId] || std.status || AttendanceStatus.PRESENT;
      const pastAbsents = monthlyAbsentMap[std.studentId] || 0;
      const totalMonthAbsents = pastAbsents + (currentStatus === AttendanceStatus.ABSENT ? 1 : 0);
      const remainingLeaves = Math.max(0, LEAVE_LIMITS.MONTHLY_MAX_DAYS - totalMonthAbsents);

      return {
        _id: std._id,
        studentId: std.studentId,
        name: std.name,
        rollNumber: std.rollNumber,
        className: std.className,
        avatarUrl: std.avatarUrl || null,
        avatarBg: std.avatarBg || "blue",
        status: currentStatus,
        pastAbsentDays: pastAbsents,
        remainingLeaves,
      };
    });

    return {
      teacher: {
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
        mentorClass: teacher.mentorClass,
        subject: teacher.subject,
      },
      students: studentList,
      isSavedForDate: Boolean(daySheet),
      isSunday,
      date: selectedDate,
    };
  }

  /**
   * Persists attendance register to MongoDB inside an ACID transaction
   */
  static async saveAttendanceRegister({ userId, email, date, records }) {
    if (!date || !Array.isArray(records)) {
      const error = new Error("Target date and student records array are required.");
      error.statusCode = 400;
      throw error;
    }

    // Sunday validation
    if (new Date(`${date}T00:00:00`).getDay() === 0) {
      const error = new Error("Attendance cannot be recorded on Sundays (Weekly Holiday).");
      error.statusCode = 400;
      throw error;
    }

    let teacher = await Teacher.findOne({ userId });
    if (!teacher && email) {
      teacher = await Teacher.findOne({ email: email.toLowerCase() });
    }

    if (!teacher) {
      const error = new Error("Teacher profile not found.");
      error.statusCode = 404;
      throw error;
    }

    const cleanClass = (teacher.mentorClass || "10-A").replace(/^Class\s+/i, "").trim();

    // START MONGO TRANSACTION
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const cleanedRecords = records.map((r) => ({
        studentId: r.studentId,
        name: r.name,
        rollNumber: r.rollNumber,
        status: r.status,
      }));

      // 1. Upsert attendance document for this date within transaction
      const savedDoc = await Attendance.findOneAndUpdate(
        { classDivision: cleanClass, date: String(date).trim() },
        {
          $set: {
            classDivision: cleanClass,
            date: String(date).trim(),
            markedBy: userId,
            lastModifiedAt: new Date(),
            records: cleanedRecords,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          session, // Session attached
        }
      );

      // 2. Synchronize current baseline status to Student documents within transaction
      const bulkOps = records.map((r) => ({
        updateOne: {
          filter: { studentId: r.studentId },
          update: { $set: { status: r.status } },
        },
      }));

      if (bulkOps.length > 0) {
        await Student.bulkWrite(bulkOps, { session });
      }

      // COMMIT TRANSACTION
      await session.commitTransaction();
      return savedDoc;
    } catch (error) {
      // ROLLBACK ON FAILURE
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}