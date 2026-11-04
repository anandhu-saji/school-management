import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import User from "../models/user.js";
import Attendance from "../models/Attendance.js";
import { ApiError } from "../utils/ApiError.js";
import { OtpService } from "./otp.service.js";
import {
  calculateTeacherAge,
  validateTeacherAge,
} from "../validators/teacher.validator.js";

export class TeacherService {
  /**
   * Fetch all teachers with cadre statistics
   */
  static async getTeachersList() {
    let teachers = await Teacher.find({}).sort({ name: 1 }).lean();

    if (!teachers || teachers.length === 0) {
      teachers = [
        {
          _id: "teacher-default-01",
          name: "Mrs. Indu B Nair",
          email: "kathalanx@gmail.com",
          penNumber: "PEN-849201",
          designation: "HSST (Junior)",
          department: "Mathematics",
          employmentType: "Permanent / Sanctioned",
          assignedClass: "Class 10-A",
          phone: "+91 94471 22334",
          periodsPerWeek: 26,
          joiningDate: "02 June 2018",
          qualification: "M.Sc. Mathematics, B.Ed, SET",
          isActive: true,
          gender: "Female",
        },
      ];
    }

    const totalSanctioned = teachers.length;
    const regularTeachers = teachers.filter(
      (t) => t.employmentType && t.employmentType.toLowerCase().includes("permanent")
    ).length || Math.ceil(totalSanctioned * 0.85);

    const guestFaculty = totalSanctioned - regularTeachers;
    const periodsPerWeek = teachers.reduce(
      (acc, t) => acc + (Number(t.periodsPerWeek) || 24),
      0
    );

    return {
      teachers,
      stats: {
        totalSanctioned,
        regularTeachers,
        guestFaculty,
        periodsPerWeek,
      },
    };
  }

  /**
   * Fetch single teacher by ID
   */
  static async getTeacherById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid teacher ID format.");
    }
    const teacher = await Teacher.findById(id).lean();
    if (!teacher) {
      throw ApiError.notFound("Teacher profile not found.");
    }
    return teacher;
  }

  /**
   * Create a new teacher
   */
  static async createTeacher(data) {
    if (!data.name || !data.email) {
      throw ApiError.badRequest("Teacher name and email are mandatory.");
    }

    if (data.dob) {
      const ageCheck = validateTeacherAge(data.dob);
      if (ageCheck !== true) {
        throw ApiError.badRequest(ageCheck);
      }
      const parsed = calculateTeacherAge(data.dob);
      if (parsed) {
        data.age = parsed.age;
      }
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const existing = await Teacher.findOne({ email: cleanEmail });
    if (existing) {
      throw ApiError.conflict("A teacher with this institutional email is already registered.");
    }

    // Enforce OTP verification before teacher registration is finalized
    const isVerified = await OtpService.isEmailVerified({
      email: cleanEmail,
      purpose: "teacher_registration",
    });
    if (!isVerified) {
      throw ApiError.badRequest(
        `Email verification required: Please verify "${cleanEmail}" with the 6-digit OTP code before completing faculty registration.`
      );
    }

    const count = await Teacher.countDocuments();
    const penNumber = data.penNumber || `PEN-${849200 + count + 1}`;
    const pen = penNumber.replace(/^PEN-?/i, "");

    const teacher = await Teacher.create({
      ...data,
      email: cleanEmail,
      pen,
      penNumber,
      periodsPerWeek: Number(data.periodsPerWeek) || 24,
      employmentType: data.employmentType || "Permanent / Sanctioned",
      gender: data.gender || "Female",
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    // Consume verification token
    await OtpService.consumeVerification({
      email: cleanEmail,
      purpose: "teacher_registration",
    });

    // Create linked user login account if one doesn't exist
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      const hashedPassword = await bcrypt.hash("Teacher@123", 10);
      user = await User.create({
        name: teacher.name,
        username: cleanEmail.split("@")[0],
        email: cleanEmail,
        password: hashedPassword,
        role: "teacher",
      });
    }
    teacher.userId = user._id;
    await teacher.save();

    return teacher;
  }

  /**
   * Update teacher by ID
   */
  static async updateTeacher(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid teacher ID format.");
    }

    if (data.dob) {
      const ageCheck = validateTeacherAge(data.dob);
      if (ageCheck !== true) {
        throw ApiError.badRequest(ageCheck);
      }
      const parsed = calculateTeacherAge(data.dob);
      if (parsed) {
        data.age = parsed.age;
      }
    }

    if (data.penNumber && !data.pen) {
      data.pen = data.penNumber.replace(/^PEN-?/i, "");
    } else if (data.pen && !data.penNumber) {
      data.penNumber = data.pen.startsWith("PEN-") ? data.pen : `PEN-${data.pen}`;
    }

    if (data.email) {
      data.email = data.email.trim().toLowerCase();
      const existing = await Teacher.findOne({
        email: data.email,
        _id: { $ne: id },
      });
      if (existing) {
        throw ApiError.conflict("Another teacher already holds this email address.");
      }
    }

    const updated = await Teacher.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw ApiError.notFound("Teacher profile not found.");
    }

    return updated;
  }

  /**
   * Delete teacher by ID
   */
  static async deleteTeacher(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid teacher ID format.");
    }
    const deleted = await Teacher.findByIdAndDelete(id);
    if (!deleted) {
      throw ApiError.notFound("Teacher record not found.");
    }
    return deleted;
  }

  /**
   * Get teacher's weekly subject & period allotment schedule
   */
  static async getTeacherAllotment(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid teacher ID format.");
    }
    const teacher = await Teacher.findById(id).lean();
    if (!teacher) {
      throw ApiError.notFound("Teacher not found.");
    }

    const subject = teacher.department || "Core Subject";
    const assignedClass = teacher.assignedClass || "Class 10-A";

    const defaultSchedule = [
      {
        day: "Monday",
        periods: [
          { period: "Period 1 (09:30 - 10:15 AM)", division: assignedClass, subject, room: "Room 101" },
          { period: "Period 3 (11:15 - 12:00 PM)", division: "Class 9-B", subject, room: "Room 204" },
          { period: "Period 5 (01:30 - 02:15 PM)", division: "Class 10-B", subject, room: "Room 102" },
          { period: "Period 7 (03:15 - 04:00 PM)", division: "Class 8-A", subject, room: "Room 301" },
        ],
      },
      {
        day: "Tuesday",
        periods: [
          { period: "Period 2 (10:15 - 11:00 AM)", division: assignedClass, subject, room: "Room 101" },
          { period: "Period 4 (12:00 - 12:45 PM)", division: "Class 9-A", subject, room: "Room 203" },
          { period: "Period 6 (02:15 - 03:00 PM)", division: assignedClass, subject, room: "Room 101" },
        ],
      },
      {
        day: "Wednesday",
        periods: [
          { period: "Period 1 (09:30 - 10:15 AM)", division: assignedClass, subject, room: "Room 101" },
          { period: "Period 3 (11:15 - 12:00 PM)", division: "Class 10-B", subject, room: "Room 102" },
          { period: "Period 5 (01:30 - 02:15 PM)", division: "Class 8-B", subject, room: "Room 302" },
          { period: "Period 7 (03:15 - 04:00 PM)", division: assignedClass, subject, room: "Room 101" },
        ],
      },
      {
        day: "Thursday",
        periods: [
          { period: "Period 2 (10:15 - 11:00 AM)", division: "Class 9-B", subject, room: "Room 204" },
          { period: "Period 4 (12:00 - 12:45 PM)", division: assignedClass, subject, room: "Room 101" },
          { period: "Period 6 (02:15 - 03:00 PM)", division: "Class 8-A", subject, room: "Room 301" },
        ],
      },
      {
        day: "Friday",
        periods: [
          { period: "Period 1 (09:30 - 10:15 AM)", division: assignedClass, subject, room: "Room 101" },
          { period: "Period 3 (11:15 - 12:00 PM)", division: "Class 9-A", subject, room: "Room 203" },
          { period: "Period 5 (01:30 - 02:15 PM)", division: assignedClass, subject, room: "Room 101" },
        ],
      },
    ];

    return {
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        penNumber: teacher.penNumber,
        designation: teacher.designation,
        department: teacher.department,
        assignedClass: teacher.assignedClass,
        periodsPerWeek: teacher.periodsPerWeek,
      },
      schedule: defaultSchedule,
    };
  }

  /**
   * Fetch division students & attendance register for a specific date (Teacher console)
   */
  static async getStudentsForTeacherRegister({ division = "Class 10-A", date }) {
    const dateQuery = date || new Date().toISOString().split("T")[0];

    // Normalize regex: matches "Class 10-A", "Class 10A", "10-A", or "10A"
    const cleanDivision = division.replace(/[\s-]/g, "");
    const pattern = cleanDivision.split("").join("[\\s-]*");
    const divisionRegex = new RegExp(`^${pattern}$|${pattern}`, "i");

    // Fetch assigned class teacher
    const classTeacher = await Teacher.findOne({
      $or: [
        { assignedClass: { $regex: divisionRegex } },
        { email: "kathalanx@gmail.com" },
      ],
    }).lean();

    // Fetch all students in division
    const students = await Student.find({
      $or: [
        { classDivision: { $regex: divisionRegex } },
        { division: { $regex: divisionRegex } },
        { className: { $regex: divisionRegex } },
      ],
    }).sort({ rollNumber: 1 });

    if (!students || students.length === 0) {
      return {
        count: 0,
        presentCount: 0,
        absentCount: 0,
        registerStatus: "Draft",
        teacher: classTeacher || {
          name: "Mrs. Indu B Nair",
          email: "kathalanx@gmail.com",
          assignedClass: division,
          department: "Mathematics",
        },
        students: [],
        message: "No students found for this division.",
      };
    }

    // Look up attendance document for this date & division
    const existingAttendance = await Attendance.findOne({
      date: dateQuery,
      $or: [
        { classDivision: { $regex: divisionRegex } },
        { division: { $regex: divisionRegex } },
      ],
    });

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

    return {
      count: roster.length,
      presentCount,
      absentCount,
      registerStatus: existingAttendance ? "Submitted" : "Draft",
      teacher: classTeacher || {
        name: "Mrs. Indu B Nair",
        email: "kathalanx@gmail.com",
        assignedClass: division,
        department: "Mathematics",
      },
      students: roster,
    };
  }

  /**
   * Save Attendance with Sunday Rule (KER) & atomic updates
   */
  static async saveTeacherAttendance({ date, classDivision, records }) {
    if (!date || !records || !Array.isArray(records) || records.length === 0) {
      throw ApiError.badRequest("Invalid payload. Date and student records array are required.");
    }

    // Kerala Education Rules (KER) Sunday Rule
    const dateObj = new Date(date + "T00:00:00");
    if (dateObj.getDay() === 0) {
      throw ApiError.badRequest(
        "Invalid attendance date: Attendance cannot be marked on Sundays per Kerala Education Rules (KER)."
      );
    }

    const presentCount = records.filter((r) => r.status === "Present").length;
    const absentCount = records.filter((r) => r.status === "Absent").length;

    // Normalize regex for classDivision
    const cleanDivision = (classDivision || "Class 10-A").replace(/[\s-]/g, "");
    const pattern = cleanDivision.split("").join("[\\s-]*");
    const divisionRegex = new RegExp(`^${pattern}$|${pattern}`, "i");

    // Upsert Attendance Record
    const attendanceDoc = await Attendance.findOneAndUpdate(
      {
        date,
        $or: [
          { classDivision: { $regex: divisionRegex } },
          { division: { $regex: divisionRegex } },
        ],
      },
      {
        $set: {
          date,
          classDivision: classDivision || "Class 10-A",
          division: classDivision || "Class 10-A",
          records: records.map((r) => ({
            studentId: r.studentId || r._id,
            rollNumber: r.rollNumber,
            name: r.name,
            status: r.status,
          })),
          presentCount,
          absentCount,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Sync student records
    for (const record of records) {
      const studentId = record.studentId || record._id;
      if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) continue;

      const studentAttendances = await Attendance.find({
        "records.studentId": studentId,
      }).lean();

      let studentPresents = 0;
      let totalStudentDays = 0;
      let monthlyLeaves = 0;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      for (const att of studentAttendances) {
        const found = att.records.find((r) => String(r.studentId) === String(studentId));
        if (found) {
          totalStudentDays++;
          if (found.status === "Present") studentPresents++;

          const attDate = new Date(att.date + "T00:00:00");
          if (
            attDate.getMonth() === currentMonth &&
            attDate.getFullYear() === currentYear &&
            found.status === "Absent"
          ) {
            monthlyLeaves++;
          }
        }
      }

      const calculatedTurnout =
        totalStudentDays > 0
          ? `${((studentPresents / totalStudentDays) * 100).toFixed(1)}%`
          : "100.0%";

      await Student.findByIdAndUpdate(studentId, {
        $set: {
          overallAttendance: calculatedTurnout,
          attendanceRate: calculatedTurnout,
          monthlyLeavesTaken: monthlyLeaves,
        },
      });
    }

    return {
      attendanceDoc,
      presentCount,
      absentCount,
    };
  }
}

export default TeacherService;
