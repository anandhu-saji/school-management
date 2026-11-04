import Student from "../../models/Student.js";
import User from "../../models/user.js";
import Attendance from "../../models/Attendance.js";
import Teacher from "../../models/Teacher.js";

export class StudentMetricsService {
  /**
   * Fetches full student profile, documents dossier, and calculates attendance metrics (Student Portal)
   */
  static async getStudentMetrics({ userId, email }) {
    let student = null;

    // 1. Try finding by linked userId
    if (userId) {
      student = await Student.findOne({ userId });
    }

    // 2. Fallback to matching by verified institutional email
    if (!student && email) {
      student = await Student.findOne({ email: email.toLowerCase() });
      if (student && userId && !student.userId) {
        student.userId = userId;
        await student.save();
      }
    }

    // 3. Auto-generate profile if none exists for this registered user
    if (!student) {
      const user = userId ? await User.findById(userId) : null;
      const count = await Student.countDocuments();
      const rollNumber = count + 1;
      const admNum = `ADM-${14900 + rollNumber}`;

      student = await Student.create({
        userId,
        name: user?.name || (email ? email.split("@")[0] : "Student Scholar"),
        email: email ? email.toLowerCase() : undefined,
        rollNumber,
        admissionNumber: admNum,
        studentId: admNum,
        sampoornaId: `SMP-06042-${880 + rollNumber}`,
        classDivision: "Class 10-A",
        className: "Class 10-A",
        gender: "Male",
        dob: "14/05/2010",
        bloodGroup: "O+",
        category: "General",
        fatherName: "",
        motherName: "",
        guardian: "Parent / Guardian",
        guardianRelation: "Father",
        parentContact: "",
        altContact: "",
        address: {
          houseName: "",
          street: "",
          postOffice: "Rajakkad P.O",
          city: "Rajakkad",
          district: "Idukki",
          state: "Kerala",
          pincode: "685566",
        },
        fullAddress: "Rajakkad P.O, Idukki District, Kerala - 685566",
        previousSchool: "",
        tcNumber: "",
        identificationMarks: "",
        overallAttendance: "100.0%",
        monthlyLeavesTaken: 0,
        status: "Present",
      });
    }

    const division = (student.classDivision || student.className || "10-A").replace(/^Class\s+/i, "");

    const classTeacher = await Teacher.findOne({
      $or: [
        { assignedClass: { $regex: new RegExp(`(${division}|Class ${division})`, "i") } },
        { department: { $regex: /malayalam|mathematics/i } },
      ],
    }).lean();

    const attendances = await Attendance.find({
      "records.studentId": student._id,
    })
      .sort({ date: -1 })
      .lean();

    let presentDays = 0;
    let absentDays = 0;
    let totalWorkingDays = 0;
    const recentLogs = [];
    const absentDates = [];
    const monthlyMap = {};

    attendances.forEach((att) => {
      const rec = att.records.find((r) => String(r.studentId) === String(student._id));
      if (!rec) return;

      totalWorkingDays++;
      if (rec.status === "Present") {
        presentDays++;
      } else {
        absentDays++;
        absentDates.push(`${att.date} (${rec.remarks || rec.status || "Absence Recorded"})`);
      }

      if (recentLogs.length < 8) {
        recentLogs.push({
          date: att.date,
          status: rec.status,
          markedBy: classTeacher?.name || att.markedBy || "Class Mentor",
        });
      }

      const monthKey = att.date.slice(0, 7);
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { total: 0, present: 0, absent: 0 };
      }
      monthlyMap[monthKey].total++;
      if (rec.status === "Present") monthlyMap[monthKey].present++;
      else monthlyMap[monthKey].absent++;
    });

    const monthlyBreakdown = Object.entries(monthlyMap).map(([mKey, counts]) => {
      const d = new Date(`${mKey}-01`);
      const monthLabel = d.toLocaleString("en-US", { month: "long", year: "numeric" });
      const rate = counts.total > 0 ? ((counts.present / counts.total) * 100).toFixed(1) + "%" : "100%";
      return {
        month: monthLabel,
        total: counts.total,
        present: counts.present,
        absent: counts.absent,
        rate,
      };
    });

    const attendanceRate =
      totalWorkingDays > 0 ? ((presentDays / totalWorkingDays) * 100).toFixed(1) : "100.0";

    return {
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        admissionNumber: student.admissionNumber,
        sampoornaId: student.sampoornaId,
        classDivision: student.classDivision || `Class ${division}`,
        className: student.className || `Class ${division}`,
        gender: student.gender,
        dob: student.dob,
        bloodGroup: student.bloodGroup,
        category: student.category,
        religion: student.religion,
        caste: student.caste,
        aadhaarNumber: student.aadhaarNumber,
        birthCertificateNumber: student.birthCertificateNumber,
        idProofUrl: student.idProofUrl,
        idProofType: student.idProofType,
        idProofFileName: student.idProofFileName,
        birthCertificateUrl: student.birthCertificateUrl,
        birthCertificateFileName: student.birthCertificateFileName,
        fatherName: student.fatherName,
        motherName: student.motherName,
        guardian: student.guardian,
        guardianRelation: student.guardianRelation,
        parentContact: student.parentContact,
        altContact: student.altContact,
        address: student.address,
        fullAddress: student.fullAddress,
        previousSchool: student.previousSchool,
        tcNumber: student.tcNumber,
        identificationMarks: student.identificationMarks,
      },
      mentor: classTeacher
        ? {
            name: classTeacher.name,
            phone: classTeacher.phone || "",
            designation: classTeacher.designation || "HSST",
            department: classTeacher.department || "General Education",
            assignedClass: classTeacher.assignedClass,
          }
        : {
            name: "Class Mentor (To be Assigned)",
            phone: "",
            designation: "HSST",
            department: "General Education",
            assignedClass: `Class ${division} Mentor`,
          },
      attendance: {
        rate: `${attendanceRate}%`,
        presentDays,
        absentDays,
        totalWorkingDays,
        recentLogs,
        absentDates,
        monthlyBreakdown,
      },
    };
  }
}

export default StudentMetricsService;
