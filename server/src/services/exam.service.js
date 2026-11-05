import Exam from "../models/Exam.js";
import Teacher from "../models/Teacher.js";
import { ApiError } from "../utils/ApiError.js";
import {
  validateExamDate,
  parseExamDate,
  formatDateToStandard,
} from "../utils/examDateValidator.js";

/**
 * Helper to resolve teacher names and PEN numbers from Teacher collection
 */
async function resolveInvigilatorsWithPen(invigilatorString) {
  if (!invigilatorString) return [];
  const rawNames = invigilatorString
    .split(/[,/;&]|\band\b/i)
    .map((s) => s.trim())
    .filter(Boolean);

  let teachersList = [];
  try {
    teachersList = await Teacher.find({}).select("name pen penNumber").lean();
  } catch {
    teachersList = [];
  }

  return rawNames.map((name) => {
    const clean = name.replace(/^(mrs\.|mr\.|smt\.|sri\.|dr\.)\s*/i, "").trim().toLowerCase();
    const found = teachersList.find((t) => {
      const tClean = (t.name || "").replace(/^(mrs\.|mr\.|smt\.|sri\.|dr\.)\s*/i, "").trim().toLowerCase();
      return tClean === clean || tClean.includes(clean) || clean.includes(tClean);
    });
    return {
      name,
      pen: found?.pen || found?.penNumber?.replace(/\D/g, "") || "",
    };
  });
}

export class ExamService {
  /**
   * Fetch all exam timetables with summary stats (or seed initial records if empty)
   */
  static async getExamTimetables() {
    let count = await Exam.countDocuments();
    if (count === 0) {
      const defaultExams = [
        {
          term: "SSLC Board Examination March 2027",
          standard: "Standard 10 (SSLC)",
          date: "12 March 2027, Fri",
          examDate: new Date("2027-03-12T04:00:00.000Z"),
          startTime: "09:30 AM",
          endTime: "11:45 AM",
          duration: "2 hrs 15 mins",
          subject: "First Language – Malayalam Part I",
          qpCode: "MAL-101",
          hall: "Halls 01, 02, 03, 04",
          totalCandidates: 242,
          invigilator: "Mrs. Indu B Nair, Sri. George K.",
          invigilatorName: "Mrs. Indu B Nair",
          invigilatorPen: "849201",
          maxMarks: 40,
          passMarks: 12,
          status: "Approved & Published",
          instructions:
            "15 minutes cool-off time provided (09:30 AM – 09:45 AM). Writing starts at 09:45 AM. Electronic devices strictly prohibited.",
          seatingPlan: [
            {
              hallNumber: "Hall 01",
              roomName: "Room 101 - Main Academic Block",
              rollRange: "ADM-14920 to ADM-14960",
              candidateCount: 40,
              invigilatorName: "Mrs. Indu B Nair",
              invigilatorPen: "849201",
            },
            {
              hallNumber: "Hall 02",
              roomName: "Room 102 - Main Academic Block",
              rollRange: "ADM-14961 to ADM-15000",
              candidateCount: 40,
              invigilatorName: "Sri. George K.",
              invigilatorPen: "849202",
            },
            {
              hallNumber: "Hall 03",
              roomName: "Room 201 - Science Wing First Floor",
              rollRange: "ADM-15001 to ADM-15080",
              candidateCount: 80,
              invigilatorName: "Smt. Bindu S.",
              invigilatorPen: "849205",
            },
            {
              hallNumber: "Hall 04",
              roomName: "Room 202 - Science Wing First Floor",
              rollRange: "ADM-15081 to ADM-15162",
              candidateCount: 82,
              invigilatorName: "Sri. Thomas Joseph",
              invigilatorPen: "849210",
            },
          ],
        },
        {
          term: "SSLC Board Examination March 2027",
          standard: "Standard 10 (SSLC)",
          date: "16 March 2027, Tue",
          examDate: new Date("2027-03-16T04:00:00.000Z"),
          startTime: "09:30 AM",
          endTime: "12:15 PM",
          duration: "2 hrs 45 mins",
          subject: "Second Language – English",
          qpCode: "ENG-102",
          hall: "Halls 01, 02, 03, 04",
          totalCandidates: 242,
          invigilator: "Sri. Thomas Joseph, Smt. Radhakrishnan N.",
          invigilatorName: "Sri. Thomas Joseph",
          invigilatorPen: "849210",
          maxMarks: 80,
          passMarks: 24,
          status: "Approved & Published",
          instructions:
            "15 minutes mandatory cool-off period. Candidates must present official Sampoorna photo hall tickets.",
          seatingPlan: [
            {
              hallNumber: "Hall 01",
              roomName: "Room 101 - Main Academic Block",
              rollRange: "ADM-14920 to ADM-14960",
              candidateCount: 40,
              invigilatorName: "Sri. Thomas Joseph",
              invigilatorPen: "849210",
            },
            {
              hallNumber: "Hall 02",
              roomName: "Room 102 - Main Academic Block",
              rollRange: "ADM-14961 to ADM-15000",
              candidateCount: 40,
              invigilatorName: "Smt. Radhakrishnan N.",
              invigilatorPen: "849214",
            },
            {
              hallNumber: "Hall 03",
              roomName: "Room 201 - Science Wing First Floor",
              rollRange: "ADM-15001 to ADM-15080",
              candidateCount: 80,
              invigilatorName: "Mrs. Indu B Nair",
              invigilatorPen: "849201",
            },
            {
              hallNumber: "Hall 04",
              roomName: "Room 202 - Science Wing First Floor",
              rollRange: "ADM-15081 to ADM-15162",
              candidateCount: 82,
              invigilatorName: "Sri. George K.",
              invigilatorPen: "849202",
            },
          ],
        },
        {
          term: "SSLC Board Examination March 2027",
          standard: "Standard 10 (SSLC)",
          date: "19 March 2027, Fri",
          examDate: new Date("2027-03-19T04:00:00.000Z"),
          startTime: "09:30 AM",
          endTime: "12:15 PM",
          duration: "2 hrs 45 mins",
          subject: "Mathematics",
          qpCode: "MAT-104",
          hall: "Halls 01, 02, 03, 04",
          totalCandidates: 242,
          invigilator: "Mrs. Indu B Nair, Sri. Manoj V.",
          invigilatorName: "Mrs. Indu B Nair",
          invigilatorPen: "849201",
          maxMarks: 80,
          passMarks: 24,
          status: "Approved & Published",
          instructions:
            "Log tables & drawing instruments authorized. Graph sheets will be provided by Pareeksha Bhavan center.",
        },
        {
          term: "SSLC Board Examination March 2027",
          standard: "Standard 10 (SSLC)",
          date: "23 March 2027, Tue",
          examDate: new Date("2027-03-23T04:00:00.000Z"),
          startTime: "09:30 AM",
          endTime: "11:45 AM",
          duration: "2 hrs 15 mins",
          subject: "Physical Science (Physics)",
          qpCode: "PHY-105",
          hall: "Halls 01, 02, 03, 04",
          totalCandidates: 242,
          invigilator: "Smt. Bindu S., Sri. George K.",
          invigilatorName: "Smt. Bindu S.",
          invigilatorPen: "849205",
          maxMarks: 40,
          passMarks: 12,
          status: "Approved & Published",
          instructions:
            "Standard mathematical tables allowed. Calculator use strictly forbidden.",
        },
      ];
      await Exam.insertMany(defaultExams);
    }

    const exams = await Exam.find({}).sort({ examDate: 1, date: 1, startTime: 1 }).lean();
    const totalSchedules = exams.length;
    const upcomingCount = exams.filter((e) => e.status === "Approved & Published").length;

    const allHalls = new Set();
    exams.forEach((e) => {
      if (e.hall) e.hall.split(",").forEach((h) => allHalls.add(h.trim()));
      if (e.seatingPlan) e.seatingPlan.forEach((sp) => sp.hallNumber && allHalls.add(sp.hallNumber.trim()));
    });
    const hallsAllocated = allHalls.size > 0 ? allHalls.size : 12;
    const teacherCount = await Teacher.countDocuments();
    const invigilatorCadre = teacherCount > 0 ? teacherCount : 26;

    return {
      exams,
      stats: {
        totalSchedules,
        upcomingCount,
        hallsAllocated,
        invigilatorCadre,
      },
    };
  }

  /**
   * Fetch single exam by ID
   */
  static async getExamById(id) {
    const exam = await Exam.findById(id).lean();
    if (!exam) {
      throw ApiError.notFound("Examination schedule not found.");
    }
    return exam;
  }

  /**
   * Create a new exam schedule
   */
  static async createExam(data) {
    if (!data.subject || !data.date || !data.qpCode) {
      throw ApiError.badRequest("Subject, date, and question paper code are mandatory.");
    }

    // Date validation: enforce that exams cannot be scheduled in the past
    const dateCheck = validateExamDate(data.date);
    if (dateCheck !== true) {
      throw ApiError.badRequest(dateCheck);
    }

    const parsedExamDate = parseExamDate(data.date);
    const standardDateStr = formatDateToStandard(parsedExamDate) || data.date;

    const existing = await Exam.findOne({ qpCode: data.qpCode });
    if (existing) {
      throw ApiError.conflict(`Exam paper with QP Code ${data.qpCode} is already scheduled.`);
    }

    // Resolve invigilators from Teacher collection to get real PEN numbers
    const resolvedInvigilators = await resolveInvigilatorsWithPen(data.invigilator);
    const inv1 = resolvedInvigilators[0] || { name: "Mrs. Indu B Nair", pen: "849201" };
    const inv2 = resolvedInvigilators[1] || { name: "Sri. George K.", pen: "849202" };
    const inv3 = resolvedInvigilators[2] || { name: "Smt. Bindu S.", pen: "849205" };
    const inv4 = resolvedInvigilators[3] || { name: "Sri. Thomas Joseph", pen: "849210" };

    const defaultSeatingPlan = [
      {
        hallNumber: "Hall 01",
        roomName: "Room 101 - Main Academic Block",
        rollRange: "ADM-14920 to ADM-14960",
        candidateCount: 40,
        invigilatorName: inv1.name,
        invigilatorPen: inv1.pen,
      },
      {
        hallNumber: "Hall 02",
        roomName: "Room 102 - Main Academic Block",
        rollRange: "ADM-14961 to ADM-15000",
        candidateCount: 40,
        invigilatorName: inv2.name,
        invigilatorPen: inv2.pen,
      },
      {
        hallNumber: "Hall 03",
        roomName: "Room 201 - Science Wing First Floor",
        rollRange: "ADM-15001 to ADM-15080",
        candidateCount: 80,
        invigilatorName: inv3.name,
        invigilatorPen: inv3.pen,
      },
      {
        hallNumber: "Hall 04",
        roomName: "Room 202 - Science Wing First Floor",
        rollRange: "ADM-15081 to ADM-15162",
        candidateCount: 82,
        invigilatorName: inv4.name,
        invigilatorPen: inv4.pen,
      },
    ];

    const exam = await Exam.create({
      ...data,
      date: standardDateStr,
      examDate: parsedExamDate || new Date(),
      invigilatorName: inv1.name,
      invigilatorPen: inv1.pen,
      totalCandidates: Number(data.totalCandidates) || 242,
      maxMarks: Number(data.maxMarks) || 80,
      passMarks: Number(data.passMarks) || 24,
      seatingPlan: data.seatingPlan || defaultSeatingPlan,
    });

    return exam;
  }

  /**
   * Update exam schedule by ID
   */
  static async updateExam(id, data) {
    if (data.date !== undefined) {
      const dateCheck = validateExamDate(data.date);
      if (dateCheck !== true) {
        throw ApiError.badRequest(dateCheck);
      }
      const parsedExamDate = parseExamDate(data.date);
      data.examDate = parsedExamDate || new Date();
      data.date = formatDateToStandard(parsedExamDate) || data.date;
    }

    if (data.invigilator) {
      const resolved = await resolveInvigilatorsWithPen(data.invigilator);
      if (resolved.length > 0) {
        data.invigilatorName = resolved[0].name;
        data.invigilatorPen = resolved[0].pen;
      }
    }

    if (data.qpCode) {
      const existing = await Exam.findOne({
        qpCode: data.qpCode,
        _id: { $ne: id },
      });
      if (existing) {
        throw ApiError.conflict(`Another exam paper is already registered with QP Code ${data.qpCode}.`);
      }
    }

    const updated = await Exam.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw ApiError.notFound("Examination schedule not found.");
    }

    return updated;
  }

  /**
   * Delete exam schedule by ID
   */
  static async deleteExam(id) {
    const deleted = await Exam.findByIdAndDelete(id);
    if (!deleted) {
      throw ApiError.notFound("Exam schedule record not found.");
    }
    return deleted;
  }

  /**
   * Get seating plan for an exam
   */
  static async getExamSeatingPlan(id) {
    const exam = await Exam.findById(id).lean();
    if (!exam) {
      throw ApiError.notFound("Exam not found.");
    }

    const defaultSeating = [
      {
        hallNumber: "Hall 01",
        roomName: "Room 101 - Main Academic Block",
        rollRange: "ADM-14920 to ADM-14960",
        candidateCount: 40,
        invigilatorName: exam.invigilator?.split(",")[0]?.trim() || "Mrs. Indu B Nair",
        invigilatorPen: "849201",
      },
      {
        hallNumber: "Hall 02",
        roomName: "Room 102 - Main Academic Block",
        rollRange: "ADM-14961 to ADM-15000",
        candidateCount: 40,
        invigilatorName: exam.invigilator?.split(",")[1]?.trim() || "Sri. George K.",
        invigilatorPen: "849202",
      },
      {
        hallNumber: "Hall 03",
        roomName: "Room 201 - Science Wing First Floor",
        rollRange: "ADM-15001 to ADM-15080",
        candidateCount: 80,
        invigilatorName: "Smt. Bindu S.",
        invigilatorPen: "849205",
      },
      {
        hallNumber: "Hall 04",
        roomName: "Room 202 - Science Wing First Floor",
        rollRange: "ADM-15081 to ADM-15162",
        candidateCount: 82,
        invigilatorName: "Sri. Thomas Joseph",
        invigilatorPen: "849210",
      },
    ];

    return exam.seatingPlan && exam.seatingPlan.length > 0 ? exam.seatingPlan : defaultSeating;
  }
}

export default ExamService;
