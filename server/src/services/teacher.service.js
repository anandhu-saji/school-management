import { normalizeClassDivision } from "../utils/classData.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import User from "../models/user.js";
import Attendance from "../models/Attendance.js";
import Exam from "../models/Exam.js";
import InternalMark from "../models/InternalMark.js";
import { ApiError } from "../utils/ApiError.js";
import { OtpService } from "./otp.service.js";
import { validateHumanName } from "../utils/nameValidator.js";
import { calculateKeralaGrade } from "../utils/gradeCalculator.js";
import {
  calculateTeacherAge,
  validateTeacherAge,
  validateTeacherAppointmentDate,
} from "../validators/teacher.validator.js";

export class TeacherService {
  /**
   * Fetch all teachers with cadre statistics
   */
  static async getTeachersList() {
    let teachers = await Teacher.find({}).sort({ name: 1 }).lean();
    if (!teachers) {
      teachers = [];
    }

    const totalSanctioned = teachers.length;
    const regularTeachers = teachers.filter(
      (t) =>
        (t.employmentType && t.employmentType.toLowerCase().includes("permanent")) ||
        ["HST", "HSST", "LPSA", "UPSA"].includes(t.designation)
    ).length;

    const onDutyStaff = teachers.filter((t) => t.status === "On Duty").length;
    const vacantPosts = Math.max(0, 26 - totalSanctioned);
    const guestFaculty = Math.max(0, totalSanctioned - regularTeachers);
    const periodsPerWeek = teachers.reduce(
      (acc, t) => acc + (Number(t.periodsPerWeek) || 24),
      0
    );

    return {
      teachers,
      stats: {
        totalSanctioned,
        totalFaculty: totalSanctioned,
        permanentPosts: regularTeachers,
        regularTeachers,
        onDutyStaff,
        vacantPosts,
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

    const nameCheck = validateHumanName(data.name, "Teacher name");
    if (nameCheck !== true) {
      throw ApiError.badRequest(nameCheck);
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

    if (data.appointmentDate) {
      const apptCheck = validateTeacherAppointmentDate(data.appointmentDate, data.dob);
      if (apptCheck !== true) {
        throw ApiError.badRequest(apptCheck);
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
    if (!isVerified && !data.skipOtp) {
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

    // Create or synchronize linked user login account with primary password Teacher@123
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      user = await User.create({
        name: teacher.name,
        username: cleanEmail.split("@")[0],
        email: cleanEmail,
        password: "Teacher@123",
        role: "teacher",
      });
    } else {
      user.role = "teacher";
      user.password = "Teacher@123";
      await user.save();
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

    if (data.name !== undefined) {
      const nameCheck = validateHumanName(data.name, "Teacher name");
      if (nameCheck !== true) {
        throw ApiError.badRequest(nameCheck);
      }
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

    if (data.appointmentDate !== undefined) {
      const existing = await Teacher.findById(id).lean();
      const apptCheck = validateTeacherAppointmentDate(data.appointmentDate, data.dob || existing?.dob);
      if (apptCheck !== true) {
        throw ApiError.badRequest(apptCheck);
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

    // Strip mentor suffixes and normalize division name
    const rawDiv = String(division || "Class 10-A");
    const normalizedDivision =
      rawDiv
        .replace(/\s*(Mentor|Class Teacher|In-charge|Teacher)\s*$/i, "")
        .replace(/\s*\(.*?\)\s*$/, "")
        .trim() || "Class 10-A";

    const codeMatch =
      normalizedDivision.replace(/^Class\s*/i, "").trim() || "10-A";

    // Standard patterns for DB lookup
    const cleanDivision = normalizedDivision.replace(/[\s-]/g, "");
    const pattern = cleanDivision.split("").join("[\\s-]*");
    const divisionRegex = new RegExp(`^${pattern}$|${pattern}`, "i");

    const codeClean = codeMatch.replace(/[\s-]/g, "");
    const codePattern = codeClean.split("").join("[\\s-]*");
    const codeRegex = new RegExp(`^${codePattern}$|${codePattern}`, "i");

    const normDiv = normalizeClassDivision(division);
    const canonicalName = normDiv ? normDiv.name : normalizedDivision;
    const canonicalId = normDiv ? normDiv.id : codeMatch;

    // Fetch assigned class teacher
    let classTeacher = await Teacher.findOne({
      $or: [
        { assignedClass: canonicalName },
        { mentorClass: canonicalId },
        { assignedClass: { $regex: divisionRegex } },
        { assignedClass: { $regex: codeRegex } },
        { mentorClass: { $regex: codeRegex } },
      ],
    }).lean();

    if (classTeacher) {
      classTeacher = {
        ...classTeacher,
        assignedClass: canonicalName,
      };
    }

    // Fetch all students in division
    let students = await Student.find({
      $or: [
        { classDivision: canonicalName },
        { classDivision: canonicalId },
        { className: canonicalName },
        { className: canonicalId },
        { division: canonicalName },
        { division: canonicalId },
        { classDivision: { $regex: divisionRegex } },
        { classDivision: { $regex: codeRegex } },
        { division: { $regex: divisionRegex } },
        { division: { $regex: codeRegex } },
        { className: { $regex: divisionRegex } },
        { className: { $regex: codeRegex } },
      ],
    }).sort({ rollNumber: 1 });

    // No students enrolled yet
    if (!students) {
      students = [];
    }

    if (!students || students.length === 0) {
      return {
        count: 0,
        presentCount: 0,
        absentCount: 0,
        registerStatus: "Draft",
        teacher: classTeacher || null,
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
        classDivision: std.classDivision || canonicalName,
        division: std.division || canonicalId,
        className: std.className || canonicalName,
        admissionNumber: std.admissionNumber || `ADM-${std.rollNumber}`,
        sampoornaId: std.sampoornaId || `SMP-06042-${std.rollNumber}`,
        gender: std.gender || "Male",
        dob: std.dob || "",
        category: std.category || "General",
        bloodGroup: std.bloodGroup || "O+",
        religion: std.religion || "Hindu",
        caste: std.caste || "",
        email: std.email || "",
        parentContact: std.parentContact || "+91 94470 00000",
        altContact: std.altContact || "",
        fatherName: std.fatherName || "",
        motherName: std.motherName || "",
        guardian: std.guardian || std.fatherName || "Parent",
        guardianRelation: std.guardianRelation || "Father",
        address: std.address || {},
        fullAddress: std.fullAddress || "Rajakkad P.O, Idukki, Kerala",
        maskedAadhaar:
          std.maskedAadhaar ||
          (std.aadhaarNumber
            ? `XXXX-XXXX-${std.aadhaarNumber.slice(-4)}`
            : "XXXX-XXXX-8492"),
        aadhaarNumber: std.aadhaarNumber || "",
        birthCertificateNumber: std.birthCertificateNumber || "",
        idProofUrl: std.idProofUrl || "",
        idProofType: std.idProofType || "Aadhaar Card",
        idProofFileName: std.idProofFileName || "",
        birthCertificateUrl: std.birthCertificateUrl || "",
        birthCertificateFileName: std.birthCertificateFileName || "",
        hasIdProof: Boolean(std.idProofUrl || std.birthCertificateUrl),
        overallAttendance: std.overallAttendance
          ? std.overallAttendance.includes("%")
            ? std.overallAttendance
            : `${std.overallAttendance}%`
          : "98.4%",
        attendance: std.overallAttendance
          ? std.overallAttendance.includes("%")
            ? std.overallAttendance
            : `${std.overallAttendance}%`
          : "98.4%",
        monthlyLeavesTaken: std.monthlyLeavesTaken || 0,
        status,
        tcNumber: std.tcNumber || "",
        previousSchool: std.previousSchool || "",
        identificationMarks: std.identificationMarks || "",
      };
    });

    const presentCount = roster.filter((s) => s.status === "Present").length;
    const absentCount = roster.filter((s) => s.status === "Absent").length;

    return {
      count: roster.length,
      presentCount,
      absentCount,
      registerStatus: existingAttendance ? "Submitted" : "Draft",
      teacher: classTeacher || null,
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

  /**
   * Fetch current teacher's profile & cadre credentials
   */
  static async getTeacherProfile(email, userId) {
    let teacher = null;
    if (email) {
      teacher = await Teacher.findOne({ email: email.toLowerCase().trim() }).lean();
    }
    if (!teacher && userId) {
      teacher = await Teacher.findOne({ userId }).lean();
    }
    if (!teacher) {
      teacher = await Teacher.findOne({}).sort({ createdAt: 1 }).lean();
    }

    if (teacher) {
      const norm = normalizeClassDivision(teacher.assignedClass);
      teacher = {
        ...teacher,
        assignedClass: norm ? norm.name : (teacher.assignedClass || "Class 10-A"),
        mentorClass: norm ? norm.id : (teacher.mentorClass || "10-A"),
      };
    }

    return teacher;
  }

  /**
   * Fetch Weekly Class & Period Schedule + Official Pareeksha Bhavan Exam Invigilation duties
   */
  static async getTeacherScheduleAndDuties({ teacherEmail, division = "Class 10-A" }) {
    let teacher = null;
    if (teacherEmail) {
      teacher = await Teacher.findOne({ email: teacherEmail.toLowerCase().trim() }).lean();
    }
    if (!teacher) {
      teacher =
        (await Teacher.findOne({ assignedClass: division }).lean()) ||
        (await Teacher.findOne({}).lean()) || {
          name: "Mrs. Indu B Nair",
          penNumber: "PEN-849201",
          pen: "849201",
          department: "Mathematics",
          assignedClass: division,
          periodsPerWeek: 24,
        };
    }

    const teacherName = teacher?.name || "Mrs. Indu B Nair";
    const teacherPen = teacher?.pen || teacher?.penNumber || "849201";
    const subject = teacher?.department || "Mathematics";
    const assignedClass = teacher?.assignedClass || division;

    // 1. Weekly teaching schedule across 5 days (Periods 1 to 7)
    const weeklySchedule = [
      {
        day: "Monday",
        periods: [
          { period: "Period 1 (09:30 - 10:15 AM)", division: assignedClass, subject, room: "Room 101 (Main Block)" },
          { period: "Period 3 (11:15 - 12:00 PM)", division: "Class 9-B", subject, room: "Room 204 (HS Wing)" },
          { period: "Period 5 (01:30 - 02:15 PM)", division: "Class 10-B", subject, room: "Room 102 (Main Block)" },
          { period: "Period 7 (03:15 - 04:00 PM)", division: "Class 8-A", subject, room: "Room 301 (UP Wing)" },
        ],
      },
      {
        day: "Tuesday",
        periods: [
          { period: "Period 2 (10:15 - 11:00 AM)", division: assignedClass, subject, room: "Room 101 (Main Block)" },
          { period: "Period 4 (12:00 - 12:45 PM)", division: "Class 9-A", subject, room: "Room 203 (HS Wing)" },
          { period: "Period 6 (02:15 - 03:00 PM)", division: assignedClass, subject, room: "Room 101 (Main Block)" },
        ],
      },
      {
        day: "Wednesday",
        periods: [
          { period: "Period 1 (09:30 - 10:15 AM)", division: assignedClass, subject, room: "Room 101 (Main Block)" },
          { period: "Period 3 (11:15 - 12:00 PM)", division: "Class 10-B", subject, room: "Room 102 (Main Block)" },
          { period: "Period 5 (01:30 - 02:15 PM)", division: "Class 8-B", subject, room: "Room 302 (UP Wing)" },
          { period: "Period 7 (03:15 - 04:00 PM)", division: assignedClass, subject, room: "Room 101 (Main Block)" },
        ],
      },
      {
        day: "Thursday",
        periods: [
          { period: "Period 2 (10:15 - 11:00 AM)", division: "Class 9-B", subject, room: "Room 204 (HS Wing)" },
          { period: "Period 4 (12:00 - 12:45 PM)", division: assignedClass, subject, room: "Room 101 (Main Block)" },
          { period: "Period 6 (02:15 - 03:00 PM)", division: "Class 8-A", subject, room: "Room 301 (UP Wing)" },
        ],
      },
      {
        day: "Friday",
        periods: [
          { period: "Period 1 (09:30 - 10:15 AM)", division: assignedClass, subject, room: "Room 101 (Main Block)" },
          { period: "Period 3 (11:15 - 12:00 PM)", division: "Class 9-A", subject, room: "Room 203 (HS Wing)" },
          { period: "Period 5 (01:30 - 02:15 PM)", division: assignedClass, subject, room: "Room 101 (Main Block)" },
        ],
      },
    ];

    // 2. Official Examinations & Invigilation Duties from MongoDB
    let allExams = await Exam.find({}).sort({ examDate: 1, date: 1, startTime: 1 }).lean();
    if (!allExams || allExams.length === 0) {
      allExams = [
        {
          _id: "exam-seed-01",
          term: "SSLC Board Model Examination March 2026",
          standard: "Standard 10 (SSLC)",
          date: "12 March 2026, Thu",
          startTime: "09:30 AM",
          endTime: "12:15 PM",
          duration: "2 hrs 45 mins",
          subject: "Mathematics",
          qpCode: "MAT-101",
          hall: "Halls 01, 02 (Main Block)",
          totalCandidates: 242,
          invigilatorName: "Mrs. Indu B Nair",
          invigilatorPen: "849201",
          maxMarks: 80,
          passMarks: 24,
          status: "Approved & Published",
          instructions: "15 minutes mandatory cool-off time provided before writing starts. Candidates must be seated by 09:15 AM.",
        },
        {
          _id: "exam-seed-02",
          term: "SSLC Board Model Examination March 2026",
          standard: "Standard 10 (SSLC)",
          date: "16 March 2026, Mon",
          startTime: "09:30 AM",
          endTime: "11:45 AM",
          duration: "2 hrs 15 mins",
          subject: "Physics",
          qpCode: "PHY-102",
          hall: "Halls 01, 03 (Main Block)",
          totalCandidates: 242,
          invigilatorName: "Sri. George K.",
          invigilatorPen: "849205",
          maxMarks: 60,
          passMarks: 18,
          status: "Approved & Published",
          instructions: "Bring geometric instruments. Non-programmable calculators strictly prohibited.",
        },
        {
          _id: "exam-seed-03",
          term: "SSLC Board Model Examination March 2026",
          standard: "Standard 10 (SSLC)",
          date: "19 March 2026, Thu",
          startTime: "09:30 AM",
          endTime: "12:15 PM",
          duration: "2 hrs 45 mins",
          subject: "English",
          qpCode: "ENG-104",
          hall: "Halls 01, 02 (Main Block)",
          totalCandidates: 242,
          invigilatorName: "Mrs. Indu B Nair",
          invigilatorPen: "849201",
          maxMarks: 80,
          passMarks: 24,
          status: "Approved & Published",
          instructions: "All candidates must display verified Sampoorna Hall Tickets.",
        },
      ];
    }

    const cleanPen = String(teacherPen).replace(/\D/g, "");

    // Helper to accurately match teacher identity to assigned invigilator strings
    const isTeacherAssigned = (invText, targetName, targetPen) => {
      if (!invText) return false;
      const lowerInv = invText.toLowerCase();
      if (targetPen && lowerInv.includes(targetPen)) return true;

      const cleanTarget = (targetName || "")
        .replace(/^(mrs\.|mr\.|smt\.|sri\.|dr\.)\s*/i, "")
        .trim()
        .toLowerCase();

      const assignedNames = lowerInv
        .split(/[,/;&]|\band\b/i)
        .map((s) => s.replace(/^(mrs\.|mr\.|smt\.|sri\.|dr\.)\s*/i, "").trim())
        .filter(Boolean);

      for (const assigned of assignedNames) {
        if (assigned === cleanTarget) return true;
        const targetTokens = cleanTarget.split(/\s+/).filter((t) => t.length > 2);
        const assignedTokens = assigned.split(/\s+/).filter((t) => t.length > 2);
        if (targetTokens.length > 0 && assignedTokens.length > 0) {
          if (targetTokens[0] === assignedTokens[0]) return true;
        }
      }
      return false;
    };

    const examsWithDutyFlag = allExams.map((ex) => {
      const invStr = `${ex.invigilator || ""} ${ex.invigilatorName || ""}`;
      const hasPenMatch =
        (cleanPen && ex.invigilatorPen && String(ex.invigilatorPen).includes(cleanPen)) ||
        (cleanPen && ex.seatingPlan?.some((sp) => sp.invigilatorPen && String(sp.invigilatorPen).includes(cleanPen)));

      const hasNameMatch =
        isTeacherAssigned(invStr, teacherName, cleanPen) ||
        ex.seatingPlan?.some((sp) =>
          isTeacherAssigned(sp.invigilatorName || "", teacherName, cleanPen)
        );

      const isInvigilator = Boolean(hasPenMatch || hasNameMatch);

      return {
        ...ex,
        isMyDuty: isInvigilator,
      };
    });

    const myDuties = examsWithDutyFlag.filter((ex) => ex.isMyDuty);

    return {
      teacher: {
        name: teacherName,
        pen: teacherPen,
        department: subject,
        assignedClass,
        periodsPerWeek: teacher?.periodsPerWeek || 24,
      },
      weeklySchedule,
      exams: examsWithDutyFlag,
      myDuties,
      totalDuties: myDuties.length,
    };
  }

  /**
   * Get Continuous Evaluation & Internal Assessment Marks for a class and subject
   */
  static async getInternalMarks({
    division = "Class 10-A",
    examTerm = "First Terminal Examination 2026",
    subject = "Mathematics",
    evaluationType = "Continuous Evaluation (CE)",
  }) {
    const cleanDivision = division.replace(/[\s-]/g, "");
    const pattern = cleanDivision.split("").join("[\\s-]*");
    const divisionRegex = new RegExp(`^${pattern}$|${pattern}`, "i");

    let existing = await InternalMark.findOne({
      classDivision: { $regex: divisionRegex },
      examTerm,
      subject,
      evaluationType,
    }).lean();

    if (existing) {
      return existing;
    }

    // If no existing record, construct initial roster from Student database
    const students = await Student.find({
      $or: [
        { classDivision: { $regex: divisionRegex } },
        { division: { $regex: divisionRegex } },
        { className: { $regex: divisionRegex } },
      ],
    })
      .sort({ rollNumber: 1 })
      .lean();

    const maxMarks = evaluationType === "Continuous Evaluation (CE)" ? 20 : 80;
    const passMarks = Math.round(maxMarks * 0.3);

    const initialRecords = students.map((std) => ({
      studentId: std._id,
      rollNumber: std.rollNumber,
      admissionNumber: std.admissionNumber || `ADM-${std.rollNumber}`,
      studentName: std.name,
      marksObtained: "",
      isAbsent: false,
      grade: "-",
      remarks: "",
    }));

    return {
      examTerm,
      standard: division.split("-")[0] || "Class 10",
      classDivision: division,
      subject,
      evaluationType,
      maxMarks,
      passMarks,
      records: initialRecords,
      classAverage: 0,
      highestScore: 0,
      lowestScore: 0,
      passPercentage: 0,
      status: "Draft",
    };
  }

  /**
   * Save / Lock Continuous Evaluation & Internal Assessment Marks
   */
  static async saveInternalMarks({
    classDivision = "Class 10-A",
    examTerm = "First Terminal Examination 2026",
    standard,
    subject = "Mathematics",
    evaluationType = "Continuous Evaluation (CE)",
    maxMarks = 80,
    passMarks = 24,
    records = [],
    teacherName,
    teacherEmail,
    status = "Submitted",
  }) {
    if (
      !classDivision ||
      !examTerm ||
      !subject ||
      !records ||
      !Array.isArray(records) ||
      records.length === 0
    ) {
      throw ApiError.badRequest(
        "Class division, exam term, subject, and student records array are required."
      );
    }

    const max = Number(maxMarks) || 80;
    const pass = Number(passMarks) || Math.round(max * 0.3);

    let totalMarks = 0;
    let presentStudents = 0;
    let passedCount = 0;
    let highest = -Infinity;
    let lowest = Infinity;

    const processedRecords = records.map((r) => {
      const isAbsent = Boolean(r.isAbsent);
      const rawScore = Number(r.marksObtained);
      const score = isAbsent
        ? 0
        : isNaN(rawScore)
        ? 0
        : Math.max(0, Math.min(max, rawScore));

      const gradeResult = calculateKeralaGrade(score, max, isAbsent);

      if (!isAbsent) {
        totalMarks += score;
        presentStudents += 1;
        if (score >= pass) passedCount += 1;
        if (score > highest) highest = score;
        if (score < lowest) lowest = score;
      }

      return {
        studentId: r.studentId || r._id,
        rollNumber: r.rollNumber,
        admissionNumber: r.admissionNumber || "",
        studentName: r.studentName || r.name,
        marksObtained: isAbsent ? 0 : score,
        isAbsent,
        grade: gradeResult.grade,
        remarks: r.remarks || "",
      };
    });

    const classAverage =
      presentStudents > 0
        ? Number((totalMarks / presentStudents).toFixed(1))
        : 0;
    const highestScore = highest === -Infinity ? 0 : highest;
    const lowestScore = lowest === Infinity ? 0 : lowest;
    const passPercentage =
      presentStudents > 0
        ? Math.round((passedCount / presentStudents) * 100)
        : 0;

    const cleanDivision = classDivision.replace(/[\s-]/g, "");
    const pattern = cleanDivision.split("").join("[\\s-]*");
    const divisionRegex = new RegExp(`^${pattern}$|${pattern}`, "i");

    const savedDoc = await InternalMark.findOneAndUpdate(
      {
        classDivision: { $regex: divisionRegex },
        examTerm,
        subject,
        evaluationType,
      },
      {
        $set: {
          classDivision,
          examTerm,
          standard: standard || classDivision.split("-")[0] || "Class 10",
          subject,
          evaluationType,
          maxMarks: max,
          passMarks: pass,
          teacherName: teacherName || "Mrs. Indu B Nair",
          teacherEmail: teacherEmail || "",
          records: processedRecords,
          classAverage,
          highestScore,
          lowestScore,
          passPercentage,
          status,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return savedDoc;
  }
  /**
   * Change / Customize teacher account password
   */
  static async changeTeacherPassword({ userId, currentPassword, newPassword, confirmPassword }) {
    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest("Current password and new custom password are required.");
    }
    if (newPassword.length < 6) {
      throw ApiError.badRequest("New password must be at least 6 characters long.");
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      throw ApiError.badRequest("New password and confirm password do not match.");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("Teacher account not found.");
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw ApiError.badRequest("Current password is incorrect. Please enter your valid current password.");
    }

    // Update with new customized password
    user.password = newPassword;
    await user.save();

    return {
      message: "Password changed successfully! You can now use your custom password to sign in.",
    };
  }

  /**
   * Purge all teacher records and accounts permanently
   */
  static async purgeAllTeachers() {
    const Teacher = (await import("../models/Teacher.js")).default;
    const User = (await import("../models/user.js")).default;
    const teacherRes = await Teacher.deleteMany({});
    const userRes = await User.deleteMany({
      $or: [
        { role: "teacher" },
        {
          email: {
            $in: [
              "kathalanx@gmail.com",
              "priyanair@ghss.edu",
              "teacher@ghss.edu",
            ],
          },
        },
      ],
    });
    return {
      deletedTeachers: teacherRes.deletedCount,
      deletedAccounts: userRes.deletedCount,
    };
  }
}

export default TeacherService;
