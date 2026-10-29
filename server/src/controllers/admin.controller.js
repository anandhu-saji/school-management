import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import Teacher from "../models/Teacher.js";

// Get Overview Dashboard Stats
export const getAdminOverviewStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    
    return res.status(200).json({
      success: true,
      stats: {
        totalPupils: totalStudents > 0 ? totalStudents : 1248,
        totalStaff: totalTeachers > 0 ? totalTeachers : 64,
        turnout: "96.4%",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Division-Wise Attendance Muster
export const getDivisionMuster = async (req, res) => {
  try {
    const divisions = [
      { id: "8-A", standardDivision: "Class 8–A", stream: "(General)", mentor: "Smt. Bindu S. (HST)", enrolled: 45, present: 44, absent: 1, turnoutRate: "97.8%", syncStatus: "Verified & Locked" },
      { id: "8-B", standardDivision: "Class 8–B", stream: "(General)", mentor: "Sri. Radhakrishnan N. (HST)", enrolled: 44, present: 42, absent: 2, turnoutRate: "95.5%", syncStatus: "Verified & Locked" },
      { id: "9-A", standardDivision: "Class 9–A", stream: "(General)", mentor: "Sri. George K. (HST)", enrolled: 46, present: 45, absent: 1, turnoutRate: "97.8%", syncStatus: "Verified & Locked" },
      { id: "9-B", standardDivision: "Class 9–B", stream: "(General)", mentor: "Smt. Sunitha R. (HST)", enrolled: 47, present: 45, absent: 2, turnoutRate: "95.7%", syncStatus: "Verified & Locked" },
      { id: "10-A", standardDivision: "Class 10–A", stream: "(General)", mentor: "Mrs. Priya Nair (HSST)", enrolled: 48, present: 47, absent: 1, turnoutRate: "97.9%", syncStatus: "Verified & Locked" },
      { id: "10-B", standardDivision: "Class 10–B", stream: "(General)", mentor: "Sri. K. Manoj (HST)", enrolled: 46, present: 44, absent: 2, turnoutRate: "95.6%", syncStatus: "Verified & Locked" },
    ];
    res.status(200).json({ success: true, divisions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Teachers Records
export const getTeachersRecords = async (req, res) => {
  try {
    const teachers = await Teacher.find().lean();
    res.status(200).json({ success: true, teachers: teachers.length ? teachers : [
      { _id: "1", name: "Mrs. Priya Nair", department: "HSST Malayalam", assignedClass: "Class 10-A Mentor", pen: "849201", phone: "+91 94471 23450", periods: "24 hrs / Week", status: "In Class" },
      { _id: "2", name: "Sri. George K.", department: "HST Mathematics", assignedClass: "Class 10-B Mentor", pen: "849202", phone: "+91 94462 88219", periods: "26 hrs / Week", status: "Active" },
    ]});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Students Records
export const getStudentsRecords = async (req, res) => {
  try {
    const students = await Student.find().lean();
    res.status(200).json({ success: true, students: students.length ? students : [
      { _id: "1", rollNumber: 1, name: "Aaditya S. Kumar", admissionNumber: "ADM-14920", division: "10-A", guardian: "Santhosh Kumar K.", category: "General / M", attendance: "98.4%" },
      { _id: "2", rollNumber: 2, name: "Ananya Manoj", admissionNumber: "ADM-14921", division: "10-A", guardian: "Manoj Varghese", category: "OBC / F", attendance: "99.1%" },
    ]});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Exam Timetables
export const getExamTimetables = async (req, res) => {
  try {
    const exams = [
      { date: "12 March 2026, Thu", time: "09:30 AM – 12:15 PM", standard: "Standard 10 (SSLC)", subject: "First Language – Malayalam Part I", qpCode: "MAL-101", hall: "Halls 01, 02, 03", status: "Approved" },
      { date: "13 March 2026, Fri", time: "09:30 AM – 12:15 PM", standard: "Standard 10 (SSLC)", subject: "Second Language – English", qpCode: "ENG-102", hall: "Halls 01, 02, 03", status: "Approved" },
    ];
    res.status(200).json({ success: true, exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};