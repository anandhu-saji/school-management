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

    // Fallback only if database is completely empty
    if (!exams || exams.length === 0) {
      const dbTotal = await Exam.countDocuments();
      if (dbTotal === 0) {
        exams = [
          {
            _id: "exam-sslc-01",
            term: "SSLC Board Examination March 2027",
            standard: "Standard 10 (SSLC)",
            date: "12 March 2027, Fri",
            startTime: "09:30 AM",
            endTime: "11:45 AM",
            duration: "2 hrs 15 mins",
            subject: "First Language - Malayalam Part I",
            qpCode: "MAL-101",
            hall: "Halls 01, 02, 03, 04",
            totalCandidates: 242,
            invigilator: "Mrs. Indu B Nair, Sri. George K.",
            maxMarks: 40,
            passMarks: 12,
            status: "Approved & Published",
            instructions:
              "15 minutes cool-off time provided before writing starts. Candidates must be seated by 09:15 AM with valid photo hall tickets.",
          },
          {
            _id: "exam-sslc-02",
            term: "SSLC Board Examination March 2027",
            standard: "Standard 10 (SSLC)",
            date: "16 March 2027, Tue",
            startTime: "09:30 AM",
            endTime: "12:15 PM",
            duration: "2 hrs 45 mins",
            subject: "Second Language - English",
            qpCode: "ENG-102",
            hall: "Halls 01, 02, 03, 04",
            totalCandidates: 242,
            invigilator: "Sri. K. R. Suresh, Mrs. Deepa V.",
            maxMarks: 80,
            passMarks: 24,
            status: "Approved & Published",
            instructions:
              "15 minutes cool-off period. Verify question paper code before writing answers.",
          },
        ];
      }
    }

    return exams || [];
  }
}

export default StudentExamsService;
