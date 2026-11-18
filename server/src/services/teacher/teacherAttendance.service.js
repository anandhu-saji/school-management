import mongoose from "mongoose";
import Teacher from "../../models/Teacher.js";
import Student from "../../models/Student.js";
import Attendance from "../../models/Attendance.js";
import { ApiError } from "../../utils/ApiError.js";

export class TeacherAttendanceService {
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
}

export default TeacherAttendanceService;
