import Exam from "../../models/Exam.js";
import InternalMark from "../../models/InternalMark.js";
import { ApiError } from "../../utils/ApiError.js";
import { calculateKeralaGrade } from "../../utils/gradeCalculator.js";

export class TeacherMarksService {
  static async getCompletedExams({ division, standard } = {}) {
    const query = {
      status: "Completed",
      isDeleted: { $ne: true },
    };

    const exams = await Exam.find(query).sort({ examDate: -1, date: -1, createdAt: -1 }).lean();

    return exams.map((e) => ({
      _id: e._id,
      examName: e.examName || e.term,
      term: e.term || e.examName,
      subject: e.subject,
      standard: e.standard,
      date: e.date,
      examDate: e.examDate,
      maxMarks: e.maxMarks || 80,
      passMarks: e.passMarks || 24,
      qpCode: e.qpCode,
      status: e.status,
    }));
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
}

export default TeacherMarksService;
