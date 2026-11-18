import Teacher from "../../models/Teacher.js";
import Exam from "../../models/Exam.js";
import Notification from "../../models/Notification.js";
import { ApiError } from "../../utils/ApiError.js";
import { normalizeClassDivision } from "../../utils/classData.js";

export class TeacherScheduleService {
  static async updateTeacherAdmissionDelegation(
    id,
    { isAdmissionAdmin, startDate, endDate, note },
    adminUserId
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid teacher ID format.");
    }

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      throw ApiError.notFound("Teacher record not found.");
    }

    const activeBool = Boolean(isAdmissionAdmin);
    teacher.isAdmissionAdmin = activeBool;
    teacher.admissionAdminStartDate = startDate ? new Date(startDate) : null;
    teacher.admissionAdminEndDate = endDate ? new Date(endDate) : null;
    teacher.admissionAdminNote = note ? String(note).trim() : "";
    teacher.admissionAdminAssignedBy = adminUserId || null;
    teacher.admissionAdminAssignedAt = new Date();

    await teacher.save();

    // Notify teacher if linked user exists
    let targetUserId = teacher.userId;
    if (!targetUserId && teacher.email) {
      const u = await User.findOne({ email: teacher.email.toLowerCase().trim() });
      if (u) targetUserId = u._id;
    }

    if (targetUserId) {
      const formattedEndDate = teacher.admissionAdminEndDate
        ? new Date(teacher.admissionAdminEndDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "further notice";

      if (activeBool) {
        await Notification.create({
          userId: targetUserId,
          title: "Temporary Admission Administrator Authorized",
          message: `You have been designated as a Temporary Student Admission Administrator by the Headmaster until ${formattedEndDate}. You can now process student admissions in the Portal.`,
          type: "info",
        });
      } else {
        await Notification.create({
          userId: targetUserId,
          title: "Admission Administrator Authorization Revoked",
          message: "Your temporary Student Admission Administrator authorization has been revoked by the Headmaster.",
          type: "warning",
        });
      }
    }

    const result = teacher.toObject();
    result.isAdmissionAdminActive = isTeacherActiveAdmissionAdmin(result);
    return result;
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
   * Get list of COMPLETED examinations only for grade marking
   */
}

export default TeacherScheduleService;
