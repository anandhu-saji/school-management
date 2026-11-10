import Exam from "../../models/Exam.js";

export class StudentExamsService {
  /**
   * Fetches published exam timetables and hall passes for the student
   */
  static async getStudentExams({ className, classDivision }) {
    const rawClass = (className || classDivision || "Class 10-A").toString();
    const stdNumber = rawClass.match(/\d+/)?.[0] || "10";

    const patterns = [`standard\\s*${stdNumber}`, `class\\s*${stdNumber}`, `\\b${stdNumber}\\b`];
    if (stdNumber === "10") {
      patterns.push("sslc");
    } else if (stdNumber === "12") {
      patterns.push("plus two", "\\+2", "dhse 12", "class 12");
    } else if (stdNumber === "11") {
      patterns.push("plus one", "\\+1", "dhse 11", "class 11");
    }

    const regex = new RegExp(`(${patterns.join("|")})`, "i");
    const allRegex = /^(all|general|all\s*classes|common|school\s*level|entire\s*school)$/i;

    // Query active exams matching the student's standard/term, or marked school-wide
    let exams = await Exam.find({
      isActive: { $ne: false },
      $or: [
        { standard: { $regex: regex } },
        { term: { $regex: regex } },
        { standard: { $regex: allRegex } },
      ],
    })
      .sort({ examDate: 1, date: 1, startTime: 1 })
      .lean();

    // If no standard-specific exams found, check for any school-wide exams
    if (!exams || exams.length === 0) {
      exams = await Exam.find({
        isActive: { $ne: false },
        standard: { $regex: allRegex },
      })
        .sort({ examDate: 1, date: 1, startTime: 1 })
        .lean();
    }

    return exams || [];
  }
}

export default StudentExamsService;
