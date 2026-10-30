import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import Teacher from "../models/Teacher.js";

// 1. Get Overview Dashboard Stats
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Division-Wise Attendance Muster
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
    return res.status(200).json({ success: true, divisions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Teachers Records
export const getTeachersRecords = async (req, res) => {
  try {
    const teachers = await Teacher.find().lean();
    return res.status(200).json({
      success: true,
      teachers: teachers.length
        ? teachers
        : [
            { _id: "1", name: "Mrs. Priya Nair", department: "HSST Malayalam", assignedClass: "Class 10-A Mentor", pen: "849201", phone: "+91 94471 23450", periods: "24 hrs / Week", status: "In Class" },
            { _id: "2", name: "Sri. George K.", department: "HST Mathematics", assignedClass: "Class 10-B Mentor", pen: "849202", phone: "+91 94462 88219", periods: "26 hrs / Week", status: "Active" },
          ],
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Get Students Records & Census Stats
export const getStudentsRecords = async (req, res) => {
  try {
    const studentsRaw = await Student.find().sort({ rollNumber: 1 }).lean();

    const totalCount = await Student.countDocuments();
    const boysCount = await Student.countDocuments({ gender: { $in: ["Male", "Boy"] } });
    const girlsCount = await Student.countDocuments({ gender: { $in: ["Female", "Girl"] } });
    const class10Count = await Student.countDocuments({
      $or: [
        { classDivision: { $regex: /10/i } },
        { className: { $regex: /10/i } },
      ],
    });

    const stats = {
      totalEnrolled: totalCount > 0 ? totalCount : 1248,
      boysCount: boysCount > 0 ? boysCount : 612,
      girlsCount: girlsCount > 0 ? girlsCount : 636,
      class10Candidates: class10Count > 0 ? class10Count : 242,
      plusTwoCount: 468,
      sampoornaVerified: "100%",
    };

    const students = studentsRaw.map((s, idx) => {
      const roll = s.rollNumber || (idx + 1);
      const isFemale = s.gender === "Female" || s.gender === "Girl";
      const rawCategory = s.category || (isFemale ? "OBC" : "General");
      const categoryTag = rawCategory.includes("/")
        ? rawCategory
        : `${rawCategory} / ${isFemale ? "F" : "M"}`;

      const rawDiv = (s.classDivision || s.className || "10-A").replace(/^Class\s+/i, "").trim();

      return {
        _id: s._id,
        rollNumber: roll,
        rollNoFormatted: `#${String(roll).padStart(2, "0")}`,
        admissionNumber: s.admissionNumber || `ADM-${14920 + roll}`,
        sampoornaId: s.sampoornaId || `SMP-06042-${880 + roll}`,
        name: s.name,
        dob: s.dob || (roll % 2 === 0 ? "22/08/2010" : "14/05/2010"),
        division: rawDiv,
        guardian: s.guardian || `Guardian ${s.name.split(" ")[0]}`,
        parentContact: s.parentContact || `+91 94473 ${11800 + roll}`,
        category: categoryTag,
        gender: s.gender || (isFemale ? "Female" : "Male"),
        attendance: s.overallAttendance
          ? s.overallAttendance.includes("%")
            ? s.overallAttendance
            : `${s.overallAttendance}%`
          : "98.4%",
      };
    });

    return res.status(200).json({
      success: true,
      stats,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Error in getStudentsRecords:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Create / Add New Student Admission
export const createStudent = async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      admissionNumber,
      sampoornaId,
      division,
      classDivision,
      guardian,
      parentContact,
      category,
      gender,
      dob,
      overallAttendance,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Student name is required for admission.",
      });
    }

    const count = await Student.countDocuments();
    const nextRoll = rollNumber ? Number(rollNumber) : count + 1;
    const targetDivision = classDivision || division || "Class 10-A";
    const formattedDiv = targetDivision.startsWith("Class ")
      ? targetDivision
      : `Class ${targetDivision}`;

    const admNo = admissionNumber || `ADM-${14920 + nextRoll}`;
    const smpId = sampoornaId || `SMP-06042-${880 + nextRoll}`;

    const newStudent = await Student.create({
      name: name.trim(),
      rollNumber: nextRoll,
      admissionNumber: admNo,
      studentId: admNo,
      sampoornaId: smpId,
      classDivision: formattedDiv,
      className: formattedDiv,
      guardian: guardian ? guardian.trim() : "Guardian",
      parentContact: parentContact ? parentContact.trim() : "+91 94470 12345",
      category: category || "General",
      gender: gender || "Male",
      dob: dob || "14/05/2010",
      overallAttendance: overallAttendance || "98.4",
      status: "Present",
    });

    return res.status(201).json({
      success: true,
      message: `Student ${newStudent.name} admitted successfully.`,
      student: newStudent,
    });
  } catch (error) {
    console.error("Error creating student:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create student record.",
    });
  }
};

// 6. Update Student Details
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.division) {
      const div = updateData.division.trim();
      updateData.classDivision = div.startsWith("Class ") ? div : `Class ${div}`;
      updateData.className = updateData.classDivision;
    }

    const updated = await Student.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Student record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Student ${updated.name} updated successfully.`,
      student: updated,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update student record.",
    });
  }
};

// 7. Delete Student Record
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Student.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Student record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Student record deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete student record.",
    });
  }
};

// 8. Get Exam Timetables
export const getExamTimetables = async (req, res) => {
  try {
    const exams = [
      { date: "12 March 2026, Thu", time: "09:30 AM – 12:15 PM", standard: "Standard 10 (SSLC)", subject: "First Language – Malayalam Part I", qpCode: "MAL-101", hall: "Halls 01, 02, 03", status: "Approved" },
      { date: "13 March 2026, Fri", time: "09:30 AM – 12:15 PM", standard: "Standard 10 (SSLC)", subject: "Second Language – English", qpCode: "ENG-102", hall: "Halls 01, 02, 03", status: "Approved" },
    ];
    return res.status(200).json({ success: true, exams });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
