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

    const exams = await Exam.find({}).sort({ examDate: 1, date: 1, startTime: 1 }).lean();
    const totalSchedules = exams.length;
    const upcomingCount = exams.filter((e) => e.status === "Approved & Published").length;

    const allHalls = new Set();
    exams.forEach((e) => {
      if (e.hall) e.hall.split(",").forEach((h) => allHalls.add(h.trim()));
      if (e.seatingPlan) e.seatingPlan.forEach((sp) => sp.hallNumber && allHalls.add(sp.hallNumber.trim()));
    });
    const hallsAllocated = allHalls.size > 0 ? allHalls.size : 0;
    const teacherCount = await Teacher.countDocuments();
    const invigilatorCadre = totalSchedules > 0 ? (teacherCount > 0 ? teacherCount : 0) : 0;

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
   * Purge all exam schedules permanently
   */
  static async purgeAllExams() {
    const res = await Exam.deleteMany({});
    return {
      deletedExams: res.deletedCount,
    };
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
