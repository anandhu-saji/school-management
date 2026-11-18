import { calculateKeralaGrade } from "../../utils/gradeCalculator.js";

export const generateInternalMarks = (insertedStudents) => {
  const internalMarksToInsert = [];

  // Class 10-A: Mathematics - Continuous Evaluation (CE)
  const class10AStudents = insertedStudents.filter((s) => s.classDivision === "Class 10-A");
  if (class10AStudents.length > 0) {
    const maxMarks = 20;
    const passMarks = 6;
    const ceRecords = class10AStudents.map((std, idx) => {
      const marksObtained = 14 + (idx % 7);
      const { grade } = calculateKeralaGrade(marksObtained, maxMarks);
      return {
        studentId: std._id,
        rollNumber: std.rollNumber,
        admissionNumber: std.admissionNumber,
        studentName: std.name,
        marksObtained,
        isAbsent: false,
        grade,
        remarks: marksObtained >= 18 ? "Outstanding performance" : "Satisfactory",
      };
    });

    const totalMarks = ceRecords.reduce((acc, r) => acc + r.marksObtained, 0);
    const classAverage = Number((totalMarks / ceRecords.length).toFixed(1));
    const highestScore = Math.max(...ceRecords.map((r) => r.marksObtained));
    const lowestScore = Math.min(...ceRecords.map((r) => r.marksObtained));

    internalMarksToInsert.push({
      examTerm: "First Terminal Examination 2026",
      standard: "Class 10",
      classDivision: "Class 10-A",
      subject: "Mathematics",
      evaluationType: "Continuous Evaluation (CE)",
      maxMarks,
      passMarks,
      teacherName: "Mrs. Indu B Nair",
      teacherEmail: "kathalanx@gmail.com",
      teacherPen: "849201",
      records: ceRecords,
      classAverage,
      highestScore,
      lowestScore,
      passPercentage: 100,
      status: "Submitted",
    });

    // Class 10-A: Mathematics - Written Exam
    const writtenMax = 80;
    const writtenPass = 24;
    const writtenRecords = class10AStudents.map((std, idx) => {
      const marksObtained = 52 + ((idx * 4) % 27);
      const { grade } = calculateKeralaGrade(marksObtained, writtenMax);
      return {
        studentId: std._id,
        rollNumber: std.rollNumber,
        admissionNumber: std.admissionNumber,
        studentName: std.name,
        marksObtained,
        isAbsent: false,
        grade,
        remarks: marksObtained >= 70 ? "Excellent" : "Good grasp of concepts",
      };
    });

    const writtenTotalMarks = writtenRecords.reduce((acc, r) => acc + r.marksObtained, 0);
    const writtenAverage = Number((writtenTotalMarks / writtenRecords.length).toFixed(1));

    internalMarksToInsert.push({
      examTerm: "First Terminal Examination 2026",
      standard: "Class 10",
      classDivision: "Class 10-A",
      subject: "Mathematics",
      evaluationType: "Written Exam",
      maxMarks: writtenMax,
      passMarks: writtenPass,
      teacherName: "Mrs. Indu B Nair",
      teacherEmail: "kathalanx@gmail.com",
      teacherPen: "849201",
      records: writtenRecords,
      classAverage: writtenAverage,
      highestScore: Math.max(...writtenRecords.map((r) => r.marksObtained)),
      lowestScore: Math.min(...writtenRecords.map((r) => r.marksObtained)),
      passPercentage: 100,
      status: "Submitted",
    });
  }

  // Class 10-B: Mathematics - Continuous Evaluation (CE)
  const class10BStudents = insertedStudents.filter((s) => s.classDivision === "Class 10-B");
  if (class10BStudents.length > 0) {
    const maxMarks = 20;
    const passMarks = 6;
    const ceRecords10B = class10BStudents.map((std, idx) => {
      const marksObtained = 13 + (idx % 8);
      const { grade } = calculateKeralaGrade(marksObtained, maxMarks);
      return {
        studentId: std._id,
        rollNumber: std.rollNumber,
        admissionNumber: std.admissionNumber,
        studentName: std.name,
        marksObtained,
        isAbsent: false,
        grade,
        remarks: "Good",
      };
    });

    const totalMarks10B = ceRecords10B.reduce((acc, r) => acc + r.marksObtained, 0);

    internalMarksToInsert.push({
      examTerm: "First Terminal Examination 2026",
      standard: "Class 10",
      classDivision: "Class 10-B",
      subject: "Mathematics",
      evaluationType: "Continuous Evaluation (CE)",
      maxMarks,
      passMarks,
      teacherName: "Sri. George K.",
      teacherEmail: "george.k@ghssrajakkad.kerala.gov.in",
      teacherPen: "849202",
      records: ceRecords10B,
      classAverage: Number((totalMarks10B / ceRecords10B.length).toFixed(1)),
      highestScore: Math.max(...ceRecords10B.map((r) => r.marksObtained)),
      lowestScore: Math.min(...ceRecords10B.map((r) => r.marksObtained)),
      passPercentage: 100,
      status: "Submitted",
    });
  }

  // Class 12-Science: Physics - Continuous Evaluation (CE)
  const class12SciStudents = insertedStudents.filter((s) => s.classDivision === "Class 12-Science");
  if (class12SciStudents.length > 0) {
    const maxMarks = 20;
    const passMarks = 6;
    const ceRecords12Sci = class12SciStudents.map((std, idx) => {
      const marksObtained = 15 + (idx % 6);
      const { grade } = calculateKeralaGrade(marksObtained, maxMarks);
      return {
        studentId: std._id,
        rollNumber: std.rollNumber,
        admissionNumber: std.admissionNumber,
        studentName: std.name,
        marksObtained,
        isAbsent: false,
        grade,
        remarks: "Regular in laboratory and assignments",
      };
    });

    const totalMarks12Sci = ceRecords12Sci.reduce((acc, r) => acc + r.marksObtained, 0);

    internalMarksToInsert.push({
      examTerm: "First Terminal Examination 2026",
      standard: "Class 12",
      classDivision: "Class 12-Science",
      subject: "Physics",
      evaluationType: "Continuous Evaluation (CE)",
      maxMarks,
      passMarks,
      teacherName: "Sri. Manoj P.",
      teacherEmail: "manoj.p@ghssrajakkad.kerala.gov.in",
      teacherPen: "849242",
      records: ceRecords12Sci,
      classAverage: Number((totalMarks12Sci / ceRecords12Sci.length).toFixed(1)),
      highestScore: Math.max(...ceRecords12Sci.map((r) => r.marksObtained)),
      lowestScore: Math.min(...ceRecords12Sci.map((r) => r.marksObtained)),
      passPercentage: 100,
      status: "Submitted",
    });
  }

  // Class 10-A: English Language & Literature - Continuous Evaluation (CE)
  if (class10AStudents.length > 0) {
    const ceEnglishRecords = class10AStudents.map((std, idx) => {
      const marksObtained = 15 + (idx % 6);
      const { grade } = calculateKeralaGrade(marksObtained, 20);
      return {
        studentId: std._id,
        rollNumber: std.rollNumber,
        admissionNumber: std.admissionNumber,
        studentName: std.name,
        marksObtained,
        isAbsent: false,
        grade,
        remarks: "Active in classroom discourse and assignments",
      };
    });
    internalMarksToInsert.push({
      examTerm: "First Terminal Examination 2026",
      standard: "Class 10",
      classDivision: "Class 10-A",
      subject: "English Language & Literature",
      evaluationType: "Continuous Evaluation (CE)",
      maxMarks: 20,
      passMarks: 6,
      teacherName: "Sri. Suresh C. K.",
      teacherEmail: "suresh.ck@ghssrajakkad.kerala.gov.in",
      teacherPen: "849209",
      records: ceEnglishRecords,
      classAverage: 17.5,
      highestScore: 20,
      lowestScore: 15,
      passPercentage: 100,
      status: "Submitted",
    });

    // Class 10-A: Physical Science - Continuous Evaluation (CE)
    const cePhysicsRecords = class10AStudents.map((std, idx) => {
      const marksObtained = 14 + ((idx * 3) % 7);
      const { grade } = calculateKeralaGrade(marksObtained, 20);
      return {
        studentId: std._id,
        rollNumber: std.rollNumber,
        admissionNumber: std.admissionNumber,
        studentName: std.name,
        marksObtained,
        isAbsent: false,
        grade,
        remarks: "Good lab participation and notebook maintenance",
      };
    });
    internalMarksToInsert.push({
      examTerm: "First Terminal Examination 2026",
      standard: "Class 10",
      classDivision: "Class 10-A",
      subject: "Physical Science",
      evaluationType: "Continuous Evaluation (CE)",
      maxMarks: 20,
      passMarks: 6,
      teacherName: "Smt. Bindu S.",
      teacherEmail: "bindu.s@ghssrajakkad.kerala.gov.in",
      teacherPen: "849205",
      records: cePhysicsRecords,
      classAverage: 16.8,
      highestScore: 20,
      lowestScore: 14,
      passPercentage: 100,
      status: "Submitted",
    });
  }

  // Class 12-Commerce: Accountancy - Continuous Evaluation (CE)
  const class12ComStudents = insertedStudents.filter((s) => s.classDivision === "Class 12-Commerce");
  if (class12ComStudents.length > 0) {
    const ceAccRecords = class12ComStudents.map((std, idx) => {
      const marksObtained = 16 + (idx % 5);
      const { grade } = calculateKeralaGrade(marksObtained, 20);
      return {
        studentId: std._id,
        rollNumber: std.rollNumber,
        admissionNumber: std.admissionNumber,
        studentName: std.name,
        marksObtained,
        isAbsent: false,
        grade,
        remarks: "Consistent in computerized accounting assignments",
      };
    });
    internalMarksToInsert.push({
      examTerm: "First Terminal Examination 2026",
      standard: "Class 12",
      classDivision: "Class 12-Commerce",
      subject: "Accountancy with AFS",
      evaluationType: "Continuous Evaluation (CE)",
      maxMarks: 20,
      passMarks: 6,
      teacherName: "Sri. Harikrishnan V.",
      teacherEmail: "harikrishnan.v@ghssrajakkad.kerala.gov.in",
      teacherPen: "849246",
      records: ceAccRecords,
      classAverage: 18.0,
      highestScore: 20,
      lowestScore: 16,
      passPercentage: 100,
      status: "Submitted",
    });
  }

  return internalMarksToInsert;
};
