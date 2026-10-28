import mongoose from "mongoose";
import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";

/**
 * 1. Fetch Students & Register for selected Date & Division
 * GET /api/teacher/students?division=Class 10-A&date=YYYY-MM-DD
 */
export const getStudentsByDivision = async (req, res) => {
  try {
    const rawDivision = req.query.division || "Class 10-A";
    const dateQuery = req.query.date || new Date().toISOString().split("T")[0];

    // Normalize regex: matches "Class 10-A", "Class 10A", "10-A", or "10A"
    const cleanDivision = rawDivision.replace(/[\s-]/g, "");
    const pattern = cleanDivision.split("").join("[\\s-]*");
    const divisionRegex = new RegExp(`^${pattern}$|${pattern}`, "i");

    // Fetch all students in division
    const students = await Student.find({
      $or: [
        { classDivision: { $regex: divisionRegex } },
        { division: { $regex: divisionRegex } },
        { className: { $regex: divisionRegex } },
      ],
    }).sort({ rollNumber: 1 });

    if (!students || students.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        students: [],
        message: "No students found for this division.",
      });
    }

    // Look up attendance document for this date & division
    const existingAttendance = await Attendance.findOne({
      date: dateQuery,
      $or: [
        { classDivision: { $regex: divisionRegex } },
        { division: { $regex: divisionRegex } },
      ],
    });

    // Map each student to their recorded or default status
    const roster = students.map((std) => {
      let status = "Present";
      if (existingAttendance && existingAttendance.records) {
        const found = existingAttendance.records.find(
          (r) => String(r.studentId) === String(std._id)
        );
        if (found) {
          status = found.status;
        }
      }

      return {
        _id: std._id,
        rollNumber: std.rollNumber,
        name: std.name,
        admissionNumber: std.admissionNumber || `ADM-${std.rollNumber}`,
        gender: std.gender,
        monthlyLeavesTaken: std.monthlyLeavesTaken || 0,
        status,
      };
    });

    const presentCount = roster.filter((s) => s.status === "Present").length;
    const absentCount = roster.filter((s) => s.status === "Absent").length;

    return res.status(200).json({
      success: true,
      count: roster.length,
      presentCount,
      absentCount,
      registerStatus: existingAttendance ? "Submitted" : "Draft",
      students: roster,
    });
  } catch (error) {
    console.error("Error in getStudentsByDivision:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve student register.",
    });
  }
};

/**
 * 2. Save Attendance with ACID Transaction (rs0 replica set) & Sunday Rule
 * POST /api/teacher/attendance
 */
export const saveAttendance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { date, classDivision, records } = req.body;

    if (!date || !records || !Array.isArray(records) || records.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Date and student records array are required.",
      });
    }

    // Weekly Holiday rule: block saving on Sundays
    const [yearStr, monthStr, dayStr] = date.split("-");
    const parsedDate = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, Number(dayStr)));

    if (parsedDate.getUTCDay() === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Cannot mark attendance on Sunday (Weekly Holiday).",
      });
    }

    const division = classDivision || "Class 10-A";
    const totalPresent = records.filter((r) => r.status === "Present").length;
    const totalAbsent = records.filter((r) => r.status === "Absent").length;

    // Upsert attendance document inside transaction
    await Attendance.findOneAndUpdate(
      { date, classDivision: division },
      {
        $set: {
          date,
          classDivision: division,
          records,
          totalPresent,
          totalAbsent,
          markedBy: req.user?.email || "kathalanx@gmail.com",
        },
      },
      { upsert: true, new: true, session }
    );

    // Dynamic 3-day quota: tally monthly absent count per student for this month
    const currentMonthPrefix = `${yearStr}-${monthStr}`;
    const monthlyAttendanceLogs = await Attendance.find({
      date: { $regex: new RegExp(`^${currentMonthPrefix}`) },
      classDivision: division,
    }).session(session);

    const monthlyAbsentCounts = {};
    for (const doc of monthlyAttendanceLogs) {
      for (const rec of doc.records) {
        if (rec.status === "Absent") {
          const sId = String(rec.studentId);
          monthlyAbsentCounts[sId] = (monthlyAbsentCounts[sId] || 0) + 1;
        }
      }
    }

    // Update each student's monthlyLeavesTaken in DB inside transaction
    const studentUpdatePromises = records.map((rec) => {
      const sId = String(rec.studentId);
      const absentDays = monthlyAbsentCounts[sId] || 0;
      return Student.findByIdAndUpdate(
        rec.studentId,
        { $set: { monthlyLeavesTaken: absentDays } },
        { session }
      );
    });

    await Promise.all(studentUpdatePromises);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Attendance for ${date} successfully committed to MongoDB.`,
      summary: {
        totalPresent,
        totalAbsent,
        enrolled: records.length,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Save Attendance Transaction Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to commit attendance transaction.",
    });
  }
};