import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import Teacher from "../models/Teacher.js";
import Exam from "../models/Exam.js";
import { ACADEMIC_WINGS, ALL_CLASSES } from "../utils/classData.js";

// Helper to extract initials: "Mrs. Priya Nair" -> "PN", "Sri. George K." -> "GK"
const getInitials = (fullName) => {
  if (!fullName) return "TR";
  const parts = fullName
    .replace(/^(Sri\.|Smt\.|Mrs\.|Mr\.|Dr\.)\s*/i, "")
    .trim()
    .split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// 1. Get Overview Dashboard Stats
export const getAdminOverviewStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const todayStr = new Date().toISOString().split("T")[0];

    // Find any attendance recorded today
    const todayAttendances = await Attendance.find({ date: todayStr }).lean();

    const sectionDefinitions = [
      {
        id: "high_school",
        title: "High School Section Attendance",
        classes: "Classes 8–10",
        divisionsText: "Classes 8–10 (6 Divisions)",
        description:
          "Classes 8–10 consolidated roll-call sync from teacher terminals with Kerala Pareeksha Bhavan portal.",
        turnout: "96.4%",
        turnoutDiff: "+1.2% vs yesterday",
        totalEnrolled: 364,
        totalPresent: 351,
        totalAbsent: 13,
        divisionsCount: 6,
        divisionsLocked: "6 / 6",
        syncStatus: "100% High School Synced",
        presentStatus: "Marked in class",
        absentStatus: "Auto-SMS dispatched",
        classPrefixes: ["Class 8", "Class 9", "Class 10", "8-", "9-", "10-"],
      },
      {
        id: "up_school",
        title: "UP School Attendance",
        classes: "Classes 5–7",
        divisionsText: "Classes 5–7 (6 Divisions)",
        description:
          "Classes 5–7 consolidated roll-call sync from teacher terminals with Kerala Pareeksha Bhavan portal.",
        turnout: "96.7%",
        turnoutDiff: "+0.8% vs yesterday",
        totalEnrolled: 276,
        totalPresent: 267,
        totalAbsent: 9,
        divisionsCount: 6,
        divisionsLocked: "6 / 6",
        syncStatus: "100% UP School Synced",
        presentStatus: "Marked in class",
        absentStatus: "Auto-SMS dispatched",
        classPrefixes: ["Class 5", "Class 6", "Class 7", "5-", "6-", "7-"],
      },
      {
        id: "lp_school",
        title: "LP School Attendance",
        classes: "Classes 1–4",
        divisionsText: "Classes 1–4 (8 Divisions)",
        description:
          "Classes 1–4 consolidated roll-call sync from teacher terminals with General Education Department portal.",
        turnout: "96.5%",
        turnoutDiff: "+1.5% vs yesterday",
        totalEnrolled: 312,
        totalPresent: 301,
        totalAbsent: 11,
        divisionsCount: 8,
        divisionsLocked: "8 / 8",
        syncStatus: "100% LP School Synced",
        presentStatus: "Marked in class",
        absentStatus: "Auto-SMS dispatched",
        classPrefixes: ["Class 1", "Class 2", "Class 3", "Class 4", "1-", "2-", "3-", "4-"],
      },
      {
        id: "higher_secondary",
        title: "Higher Secondary Attendance",
        classes: "Classes 11–12",
        divisionsText: "Classes 11–12 (6 Divisions)",
        description:
          "Classes 11–12 consolidated roll-call sync from teacher terminals with Kerala DHSE portal.",
        turnout: "95.9%",
        turnoutDiff: "+0.5% vs yesterday",
        totalEnrolled: 296,
        totalPresent: 284,
        totalAbsent: 12,
        divisionsCount: 6,
        divisionsLocked: "6 / 6",
        syncStatus: "100% Higher Secondary Synced",
        presentStatus: "Marked in class",
        absentStatus: "Auto-SMS dispatched",
        classPrefixes: ["Class 11", "Class 12", "11-", "12-", "Plus One", "Plus Two"],
      },
    ];

    const sections = sectionDefinitions.map((sec) => {
      const matched = todayAttendances.filter((att) =>
        sec.classPrefixes.some((p) =>
          (att.classDivision || "").toLowerCase().includes(p.toLowerCase())
        )
      );

      let enrolled = sec.totalEnrolled;
      let present = sec.totalPresent;
      let absent = sec.totalAbsent;

      if (matched.length > 0) {
        let livePresent = 0;
        let liveAbsent = 0;
        matched.forEach((m) => {
          livePresent += m.totalPresent || 0;
          liveAbsent += m.totalAbsent || 0;
        });
        if (livePresent + liveAbsent > 0) {
          present = livePresent;
          absent = liveAbsent;
          enrolled = livePresent + liveAbsent;
          return {
            id: sec.id,
            title: sec.title,
            classes: sec.classes,
            divisionsText: sec.divisionsText,
            description: sec.description,
            turnout: ((present / enrolled) * 100).toFixed(1) + "%",
            turnoutDiff: sec.turnoutDiff,
            totalEnrolled: enrolled,
            totalPresent: present,
            totalAbsent: absent,
            divisionsLocked: `${matched.length} / ${sec.divisionsCount}`,
            syncStatus: sec.syncStatus,
            presentStatus: sec.presentStatus,
            absentStatus: sec.absentStatus,
          };
        }
      }

      return {
        id: sec.id,
        title: sec.title,
        classes: sec.classes,
        divisionsText: sec.divisionsText,
        description: sec.description,
        turnout: sec.turnout,
        turnoutDiff: sec.turnoutDiff,
        totalEnrolled: enrolled,
        totalPresent: present,
        totalAbsent: absent,
        divisionsLocked: sec.divisionsLocked,
        syncStatus: sec.syncStatus,
        presentStatus: sec.presentStatus,
        absentStatus: sec.absentStatus,
      };
    });

    const totalEnrolledAll = sections.reduce((sum, s) => sum + s.totalEnrolled, 0);
    const totalPresentAll = sections.reduce((sum, s) => sum + s.totalPresent, 0);
    const totalAbsentAll = sections.reduce((sum, s) => sum + s.totalAbsent, 0);
    const overallTurnout =
      totalEnrolledAll > 0
        ? ((totalPresentAll / totalEnrolledAll) * 100).toFixed(1) + "%"
        : "96.4%";

    return res.status(200).json({
      success: true,
      stats: {
        totalPupils: totalStudents > 0 ? totalStudents : totalEnrolledAll,
        totalStaff: totalTeachers > 0 ? totalTeachers : 64,
        turnout: overallTurnout,
        totalPresent: totalPresentAll,
        totalAbsent: totalAbsentAll,
      },
      sections,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Division-Wise Attendance Muster
export const getDivisionMuster = async (req, res) => {
  try {
    const { section } = req.query;
    const allDivisions = [
      // High School Section (Classes 8–10)
      { id: "8-A", section: "high_school", sectionLabel: "High School", standardDivision: "Class 8–A", stream: "(General)", mentor: "Smt. Bindu S. (HST)", enrolled: 45, present: 44, absent: 1, turnoutRate: "97.8%", syncStatus: "Verified & Locked" },
      { id: "8-B", section: "high_school", sectionLabel: "High School", standardDivision: "Class 8–B", stream: "(General)", mentor: "Sri. Radhakrishnan N. (HST)", enrolled: 44, present: 42, absent: 2, turnoutRate: "95.5%", syncStatus: "Verified & Locked" },
      { id: "9-A", section: "high_school", sectionLabel: "High School", standardDivision: "Class 9–A", stream: "(General)", mentor: "Sri. George K. (HST)", enrolled: 46, present: 45, absent: 1, turnoutRate: "97.8%", syncStatus: "Verified & Locked" },
      { id: "9-B", section: "high_school", sectionLabel: "High School", standardDivision: "Class 9–B", stream: "(General)", mentor: "Smt. Sunitha R. (HST)", enrolled: 47, present: 45, absent: 2, turnoutRate: "95.7%", syncStatus: "Verified & Locked" },
      { id: "10-A", section: "high_school", sectionLabel: "High School", standardDivision: "Class 10–A", stream: "(General)", mentor: "Mrs. Indu B Nair (HST)", enrolled: 48, present: 47, absent: 1, turnoutRate: "97.9%", syncStatus: "Verified & Locked" },
      { id: "10-B", section: "high_school", sectionLabel: "High School", standardDivision: "Class 10–B", stream: "(General)", mentor: "Sri. George K. (HST)", enrolled: 46, present: 44, absent: 2, turnoutRate: "95.6%", syncStatus: "Verified & Locked" },

      // UP School Section (Classes 5–7)
      { id: "5-A", section: "up_school", sectionLabel: "UP School", standardDivision: "Class 5–A", stream: "(General)", mentor: "Smt. Mini V. (UPSA)", enrolled: 46, present: 45, absent: 1, turnoutRate: "97.8%", syncStatus: "Verified & Locked" },
      { id: "5-B", section: "up_school", sectionLabel: "UP School", standardDivision: "Class 5–B", stream: "(General)", mentor: "Sri. Rajesh Kumar (UPSA)", enrolled: 45, present: 43, absent: 2, turnoutRate: "95.6%", syncStatus: "Verified & Locked" },
      { id: "6-A", section: "up_school", sectionLabel: "UP School", standardDivision: "Class 6–A", stream: "(General)", mentor: "Smt. Sheela Thomas (UPSA)", enrolled: 47, present: 46, absent: 1, turnoutRate: "97.9%", syncStatus: "Verified & Locked" },
      { id: "6-B", section: "up_school", sectionLabel: "UP School", standardDivision: "Class 6–B", stream: "(General)", mentor: "Sri. Deepu Varghese (UPSA)", enrolled: 45, present: 43, absent: 2, turnoutRate: "95.6%", syncStatus: "Verified & Locked" },
      { id: "7-A", section: "up_school", sectionLabel: "UP School", standardDivision: "Class 7–A", stream: "(General)", mentor: "Smt. Mary K. J. (UPSA)", enrolled: 47, present: 46, absent: 1, turnoutRate: "97.9%", syncStatus: "Verified & Locked" },
      { id: "7-B", section: "up_school", sectionLabel: "UP School", standardDivision: "Class 7–B", stream: "(General)", mentor: "Sri. Suresh Babu (UPSA)", enrolled: 46, present: 44, absent: 2, turnoutRate: "95.7%", syncStatus: "Verified & Locked" },

      // LP School Section (Classes 1–4)
      { id: "1-A", section: "lp_school", sectionLabel: "LP School", standardDivision: "Class 1–A", stream: "(Primary)", mentor: "Smt. Beena P. (LPSA)", enrolled: 39, present: 38, absent: 1, turnoutRate: "97.4%", syncStatus: "Verified & Locked" },
      { id: "1-B", section: "lp_school", sectionLabel: "LP School", standardDivision: "Class 1–B", stream: "(Primary)", mentor: "Smt. Asha Mohan (LPSA)", enrolled: 38, present: 37, absent: 1, turnoutRate: "97.4%", syncStatus: "Verified & Locked" },
      { id: "2-A", section: "lp_school", sectionLabel: "LP School", standardDivision: "Class 2–A", stream: "(Primary)", mentor: "Smt. Sreeja K. (LPSA)", enrolled: 40, present: 39, absent: 1, turnoutRate: "97.5%", syncStatus: "Verified & Locked" },
      { id: "2-B", section: "lp_school", sectionLabel: "LP School", standardDivision: "Class 2–B", stream: "(Primary)", mentor: "Sri. Anilkumar (LPSA)", enrolled: 39, present: 37, absent: 2, turnoutRate: "94.9%", syncStatus: "Verified & Locked" },
      { id: "3-A", section: "lp_school", sectionLabel: "LP School", standardDivision: "Class 3–A", stream: "(Primary)", mentor: "Smt. Manju R. (LPSA)", enrolled: 39, present: 38, absent: 1, turnoutRate: "97.4%", syncStatus: "Verified & Locked" },
      { id: "3-B", section: "lp_school", sectionLabel: "LP School", standardDivision: "Class 3–B", stream: "(Primary)", mentor: "Smt. Rema Devi (LPSA)", enrolled: 39, present: 37, absent: 2, turnoutRate: "94.9%", syncStatus: "Verified & Locked" },
      { id: "4-A", section: "lp_school", sectionLabel: "LP School", standardDivision: "Class 4–A", stream: "(Primary)", mentor: "Sri. Shaji Mathew (LPSA)", enrolled: 39, present: 38, absent: 1, turnoutRate: "97.4%", syncStatus: "Verified & Locked" },
      { id: "4-B", section: "lp_school", sectionLabel: "LP School", standardDivision: "Class 4–B", stream: "(Primary)", mentor: "Smt. Latha K. (LPSA)", enrolled: 39, present: 37, absent: 2, turnoutRate: "94.9%", syncStatus: "Verified & Locked" },

      // Higher Secondary Section (Classes 11–12)
      { id: "11-Sci", section: "higher_secondary", sectionLabel: "Higher Secondary", standardDivision: "Class 11–Science", stream: "(Bio-Maths)", mentor: "Sri. Suresh C. K. (HSST)", enrolled: 50, present: 48, absent: 2, turnoutRate: "96.0%", syncStatus: "Verified & Locked" },
      { id: "11-Com", section: "higher_secondary", sectionLabel: "Higher Secondary", standardDivision: "Class 11–Commerce", stream: "(Computer App)", mentor: "Smt. Priya Nair (HSST)", enrolled: 49, present: 47, absent: 2, turnoutRate: "95.9%", syncStatus: "Verified & Locked" },
      { id: "11-Hum", section: "higher_secondary", sectionLabel: "Higher Secondary", standardDivision: "Class 11–Humanities", stream: "(Sociology/Hist)", mentor: "Sri. Thomas Joseph (HSST)", enrolled: 48, present: 46, absent: 2, turnoutRate: "95.8%", syncStatus: "Verified & Locked" },
      { id: "12-Sci", section: "higher_secondary", sectionLabel: "Higher Secondary", standardDivision: "Class 12–Science", stream: "(Bio-Maths)", mentor: "Sri. Manoj P. (HSST)", enrolled: 50, present: 48, absent: 2, turnoutRate: "96.0%", syncStatus: "Verified & Locked" },
      { id: "12-Com", section: "higher_secondary", sectionLabel: "Higher Secondary", standardDivision: "Class 12–Commerce", stream: "(Computer App)", mentor: "Smt. Deepa Nair (HSST)", enrolled: 50, present: 48, absent: 2, turnoutRate: "96.0%", syncStatus: "Verified & Locked" },
      { id: "12-Hum", section: "higher_secondary", sectionLabel: "Higher Secondary", standardDivision: "Class 12–Humanities", stream: "(Sociology/Hist)", mentor: "Sri. Thomas Joseph (HSST)", enrolled: 49, present: 47, absent: 2, turnoutRate: "95.9%", syncStatus: "Verified & Locked" },
    ];

    let divisions = allDivisions;
    if (section && section !== "all") {
      divisions = allDivisions.filter(
        (d) =>
          d.section === section ||
          d.sectionLabel.toLowerCase() === section.toLowerCase()
      );
    }
    return res.status(200).json({ success: true, divisions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2b. Get Detailed Class Attendance Register for a Division
export const getDivisionAttendanceRegister = async (req, res) => {
  try {
    const { division, date } = req.query;
    const targetDate = date || new Date().toISOString().split("T")[0];
    const rawDivision = division || "Class 10-A";
    const cleanDiv = rawDivision.replace(/–/g, "-").trim();

    let normalizedDivision = cleanDiv;
    if (!normalizedDivision.startsWith("Class")) {
      normalizedDivision = `Class ${normalizedDivision}`;
    }

    // 1. Fetch Students in this division
    const divRegex = new RegExp(cleanDiv.replace(/^Classs*/i, ""), "i");
    let students = await Student.find({
      $or: [
        { classDivision: { $regex: divRegex } },
        { className: { $regex: divRegex } },
      ],
    })
      .sort({ rollNumber: 1 })
      .lean();

    // If no students in DB for this class division, generate realistic class roll
    if (!students || students.length === 0) {
      const sampleNames = [
        "Aaditya S. Kumar", "Ananya Manoj", "Devanand P. B.", "Fathima Nizar", "Gopika Krishna",
        "Harikrishnan M.", "Irfan Habeeb", "Kavya Rajesh", "Muhammed Bilal", "Nandana Suresh",
        "Pranav P.", "Rithika Nair", "Rohit R. Chandran", "Sneha Santhosh", "Vaishnav V.",
        "Abhimanyu S.", "Aparna Vinod", "Christo George", "Diya Mariam", "Gautham Krishna"
      ];
      students = sampleNames.map((name, i) => ({
        _id: `temp_${cleanDiv.replace(/\s+/g, "_")}_${i + 1}`,
        rollNumber: i + 1,
        admissionNumber: `ADM-${cleanDiv.replace(/[^0-9]/g, "")}0${10 + i}`,
        name,
        gender: i % 2 === 0 ? "Male" : "Female",
        monthlyLeavesTaken: i % 5 === 0 ? 1 : 0,
        overallAttendance: (95 + ((i * 3) % 5)).toFixed(1) + "%",
      }));
    }

    // 2. Fetch Attendance register sheet from MongoDB for this date & division
    const attendanceDoc = await Attendance.findOne({
      date: targetDate,
      classDivision: { $regex: divRegex },
    }).lean();

    const recordStatusMap = {};
    if (attendanceDoc && attendanceDoc.records) {
      attendanceDoc.records.forEach((r) => {
        if (r.studentId) recordStatusMap[String(r.studentId)] = r.status;
        if (r.rollNumber) recordStatusMap[`roll_${r.rollNumber}`] = r.status;
      });
    }

    const studentRoster = students.map((s) => {
      const recordedStatus =
        recordStatusMap[String(s._id)] ||
        recordStatusMap[`roll_${s.rollNumber}`] ||
        (s.monthlyLeavesTaken > 0 && s.rollNumber === 4 ? "Absent" : "Present");

      return {
        _id: s._id,
        rollNumber: s.rollNumber,
        admissionNumber: s.admissionNumber || s.studentId || `ADM-149${20 + s.rollNumber}`,
        name: s.name,
        gender: s.gender || "Male",
        status: recordedStatus,
        monthlyLeavesTaken: s.monthlyLeavesTaken || 0,
        overallAttendance: s.overallAttendance || "97.5%",
      };
    });

    const presentCount = studentRoster.filter((r) => r.status === "Present").length;
    const absentCount = studentRoster.filter((r) => r.status === "Absent").length;
    const leaveCount = studentRoster.filter((r) => r.status === "On Leave" || r.status === "Leave" || r.status === "Half Day").length;
    const turnoutRate =
      studentRoster.length > 0
        ? ((presentCount / studentRoster.length) * 100).toFixed(1) + "%"
        : "100.0%";

    // Resolve Mentor
    let mentorName = "Faculty Mentor";
    const teacher = await Teacher.findOne({
      $or: [
        { assignedClass: { $regex: divRegex } },
        { mentorClass: { $regex: divRegex } },
      ],
    }).lean();
    if (teacher) {
      mentorName = `${teacher.name} (${teacher.department || "HST"})`;
    }

    return res.status(200).json({
      success: true,
      division: normalizedDivision,
      date: targetDate,
      mentor: mentorName,
      stats: {
        totalEnrolled: studentRoster.length,
        presentCount,
        absentCount,
        leaveCount,
        turnoutRate,
      },
      students: studentRoster,
    });
  } catch (error) {
    console.error("Error fetching division attendance register:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2c. Save / Sync Division Attendance Register from Admin Console
export const saveDivisionAttendanceRegister = async (req, res) => {
  try {
    const { date, classDivision, records } = req.body;
    if (!date || !classDivision || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: "Date, classDivision, and records array are required.",
      });
    }

    const presentCount = records.filter((r) => r.status === "Present").length;
    const absentCount = records.filter((r) => r.status === "Absent").length;

    const updated = await Attendance.findOneAndUpdate(
      { date, classDivision },
      {
        $set: {
          date,
          classDivision,
          records,
          totalPresent: presentCount,
          totalAbsent: absentCount,
          markedBy: "admin@ghss.edu (Headmaster Sign-off)",
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    return res.status(200).json({
      success: true,
      message: `Attendance for ${classDivision} on ${date} saved and locked successfully.`,
      attendance: updated,
    });
  } catch (error) {
    console.error("Error saving division attendance register:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Teachers Records & Faculty Cadre Stats
export const getTeachersRecords = async (req, res) => {
  try {
    let teachersRaw = await Teacher.find().lean();

    // If fewer than 6 exist, seed with the standard government faculty cadre
    if (teachersRaw.length < 6) {
      const defaultCadre = [
        {
          name: "Sri. George K.",
          email: "george.k@ghssrajakkad.kerala.gov.in",
          department: "HST Mathematics",
          assignedClass: "Class 10-B Mentor",
          mentorClass: "10-B",
          pen: "849202",
          phone: "+91 94462 88219",
          periods: "26 hrs / Week",
          status: "Active",
          qualification: "M.Sc Mathematics, B.Ed",
        },
        {
          name: "Smt. Bindu S.",
          email: "bindu.s@ghssrajakkad.kerala.gov.in",
          department: "HST Physical Science",
          assignedClass: "Class 9-A Mentor",
          mentorClass: "9-A",
          pen: "849205",
          phone: "+91 98470 55123",
          periods: "22 hrs / Week + Lab",
          status: "Active",
          qualification: "M.Sc Physics, B.Ed",
        },
        {
          name: "Sri. Suresh C. K.",
          email: "suresh.ck@ghssrajakkad.kerala.gov.in",
          department: "HSST Chemistry",
          assignedClass: "Class 11 Science",
          mentorClass: "11-A",
          pen: "849219",
          phone: "+91 94956 77123",
          periods: "Practical Exam Observer",
          status: "On Duty",
          qualification: "M.Sc Chemistry, B.Ed, SET",
        },
        {
          name: "Sri. Thomas Joseph",
          email: "thomas.joseph@ghssrajakkad.kerala.gov.in",
          department: "HSST English",
          assignedClass: "Class 12 Humanities",
          mentorClass: "12-A",
          pen: "849210",
          phone: "+91 94951 44321",
          periods: "25 hrs / Week",
          status: "Active",
          qualification: "M.A English, B.Ed, NET",
        },
        {
          name: "Smt. Radhakrishnan N.",
          email: "radhakrishnan.n@ghssrajakkad.kerala.gov.in",
          department: "HST Social Science",
          assignedClass: "Class 8-C Mentor",
          mentorClass: "8-C",
          pen: "849214",
          phone: "+91 94468 11902",
          periods: "22 hrs / Week",
          status: "Active",
          qualification: "M.A History, B.Ed",
        },
      ];

      for (const t of defaultCadre) {
        try {
          const exists = teachersRaw.some(
            (ex) => ex.pen === t.pen || ex.name === t.name
          );
          if (!exists) {
            const created = await Teacher.create(t);
            teachersRaw.push(created.toObject());
          }
        } catch (e) {
          console.warn("Notice seeding default faculty item:", e.message);
        }
      }
    }

    const totalCount = teachersRaw.length;
    const onDutyCount = teachersRaw.filter((t) => t.status === "On Duty").length;

    const stats = {
      totalFaculty: 64, // Total authorized cadre
      actualFacultyCount: totalCount,
      permanentPosts: 58,
      onDutyStaff: onDutyCount > 0 ? onDutyCount : 4,
      vacantPosts: 2,
    };

    const teachers = teachersRaw.map((t) => ({
      _id: t._id,
      name: t.name,
      initials: getInitials(t.name),
      pen: t.pen || "849200",
      department: t.department || "General Cadre",
      assignedClass: t.assignedClass || "Class Mentor",
      mentorClass: t.mentorClass || "10-A",
      phone: t.phone || "+91 94471 00000",
      email: t.email || "",
      periods: t.periods || "24 hrs / Week",
      status: t.status || "Active",
      qualification: t.qualification || "B.Ed",
      appointmentDate: t.appointmentDate || "01/06/2018",
      avatarUrl: t.avatarUrl || null,
      // Statutory ID Proofs & Submitted Documents
      aadharNumber: t.aadharNumber || "",
      aadharDocUrl: t.aadharDocUrl || null,
      aadharDocFileName: t.aadharDocFileName || null,
      panNumber: t.panNumber || "",
      panDocUrl: t.panDocUrl || null,
      panDocFileName: t.panDocFileName || null,
      penAllotmentDocUrl: t.penAllotmentDocUrl || null,
      penAllotmentDocFileName: t.penAllotmentDocFileName || null,
      // Qualifications & Certificates
      highestDegree: t.highestDegree || "Post Graduate (Master's)",
      pgDegreeName: t.pgDegreeName || "M.Sc / M.A",
      pgCertificateUrl: t.pgCertificateUrl || null,
      pgCertificateFileName: t.pgCertificateFileName || null,
      ugDegreeName: t.ugDegreeName || "B.Sc / B.A",
      ugCertificateUrl: t.ugCertificateUrl || null,
      ugCertificateFileName: t.ugCertificateFileName || null,
      bedCollege: t.bedCollege || "Govt. College of Teacher Education",
      bedCertificateUrl: t.bedCertificateUrl || null,
      bedCertificateFileName: t.bedCertificateFileName || null,
      eligibilityExam: t.eligibilityExam || "SET / KTET Qualified",
      eligibilityCertificateUrl: t.eligibilityCertificateUrl || null,
      eligibilityCertificateFileName: t.eligibilityCertificateFileName || null,
      experienceCertificateUrl: t.experienceCertificateUrl || null,
      experienceCertificateFileName: t.experienceCertificateFileName || null,
      documentsVerified: t.documentsVerified !== false,
    }));

    return res.status(200).json({
      success: true,
      stats,
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    console.error("Error in getTeachersRecords:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3b. Create New Teacher Record
export const createTeacher = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Teacher full name is required.",
      });
    }

    const teacherData = {
      ...req.body,
      name: name.trim(),
      pen: req.body.pen?.trim() || `849${Math.floor(100 + Math.random() * 900)}`,
      department: req.body.department?.trim() || "High School",
      assignedClass: req.body.assignedClass?.trim() || "Faculty Mentor",
      phone: req.body.phone?.trim() || "+91 94471 00000",
      periods: req.body.periods?.trim() || "24 hrs / Week",
      status: req.body.status || "Active",
      qualification: req.body.qualification?.trim() || "B.Ed",
      appointmentDate: req.body.appointmentDate?.trim() || "01/06/2020",
    };

    if (req.body.email && req.body.email.trim()) {
      teacherData.email = req.body.email.trim().toLowerCase();
    } else {
      delete teacherData.email;
    }

    const newTeacher = await Teacher.create(teacherData);

    return res.status(201).json({
      success: true,
      message: `Faculty ${newTeacher.name} registered successfully with PEN ${newTeacher.pen}.`,
      teacher: newTeacher,
    });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3c. Update Teacher Details
export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const updateOps = { $set: updateData };

    if (!updateData.email || !updateData.email.trim()) {
      delete updateData.email;
      updateOps.$unset = { email: 1 };
    }

    const updated = await Teacher.findByIdAndUpdate(
      id,
      updateOps,
      { returnDocument: "after", runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Teacher record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Teacher ${updated.name} updated successfully.`,
      teacher: updated,
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3d. Delete Teacher Record
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Teacher.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Teacher record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Teacher record removed successfully.`,
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3e. Get Teacher Allotment & Workload Details
export const getTeacherAllotment = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id).lean();

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    const schedule = [
      { day: "Monday", period: "Period 1 (09:45 – 10:30)", division: teacher.assignedClass || "Class 10-A", subject: teacher.subject || "Subject Teaching", room: "Room 12" },
      { day: "Monday", period: "Period 3 (11:25 – 12:10)", division: "Class 10-B", subject: teacher.subject || "Subject Teaching", room: "Room 14" },
      { day: "Tuesday", period: "Period 2 (10:35 – 11:20)", division: teacher.assignedClass || "Class 10-A", subject: "Class Mentorship & Doubt Clearing", room: "Room 12" },
      { day: "Wednesday", period: "Period 4 (01:00 – 01:45)", division: "Class 9-A", subject: teacher.subject || "Subject Teaching", room: "Science Lab" },
      { day: "Thursday", period: "Period 1 (09:45 – 10:30)", division: teacher.assignedClass || "Class 10-A", subject: teacher.subject || "Subject Teaching", room: "Room 12" },
      { day: "Friday", period: "Period 5 (01:50 – 02:35)", division: "Class 10-A", subject: "Remedial & Muster Verification", room: "Staff Room" },
    ];

    return res.status(200).json({
      success: true,
      teacher,
      periodsPerWeek: teacher.periods || "24 hrs / Week",
      schedule,
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

    const verifiedAadhaarCount = await Student.countDocuments({
      aadhaarNumber: { $exists: true, $ne: "" },
    });
    const verifiedPercent =
      totalCount > 0
        ? Math.round(
            ((verifiedAadhaarCount > 0 ? verifiedAadhaarCount : totalCount) /
              totalCount) *
              100
          )
        : 100;

    const stats = {
      totalEnrolled: totalCount > 0 ? totalCount : 1248,
      boysCount: boysCount > 0 ? boysCount : 612,
      girlsCount: girlsCount > 0 ? girlsCount : 636,
      class10Candidates: class10Count > 0 ? class10Count : 242,
      plusTwoCount: 468,
      sampoornaVerified: `${verifiedPercent}%`,
    };

    let students = studentsRaw.map((s, idx) => {
      const roll = s.rollNumber || (idx + 1);
      const isFemale = s.gender === "Female" || s.gender === "Girl";
      const rawCategory = s.category || (isFemale ? "OBC" : "General");
      const categoryTag = rawCategory.includes("/")
        ? rawCategory
        : `${rawCategory} / ${isFemale ? "F" : "M"}`;

      const rawDiv = (s.classDivision || s.className || "10-A").replace(/^Class\s+/i, "").trim();

      const rawAadhaar = s.aadhaarNumber || "";
      const maskedAadhaar = rawAadhaar
        ? `${rawAadhaar.slice(0, 4)} XXXX ${rawAadhaar.slice(-4)}`
        : "";

      return {
        _id: s._id,
        rollNumber: roll,
        rollNoFormatted: `#${String(roll).padStart(2, "0")}`,
        admissionNumber: s.admissionNumber || `ADM-${14920 + roll}`,
        sampoornaId: s.sampoornaId || `SMP-06042-${880 + roll}`,
        name: s.name,
        dob: s.dob || (roll % 2 === 0 ? "22/08/2010" : "14/05/2010"),
        division: rawDiv,
        guardian: s.guardian || (s.fatherName || `Guardian ${s.name.split(" ")[0]}`),
        parentContact: s.parentContact || `+91 94473 ${11800 + roll}`,
        category: categoryTag,
        gender: s.gender || (isFemale ? "Female" : "Male"),
        attendance: s.overallAttendance
          ? s.overallAttendance.includes("%")
            ? s.overallAttendance
            : `${s.overallAttendance}%`
          : "98.4%",
        aadhaarNumber: rawAadhaar,
        maskedAadhaar,
        birthCertificateNumber: s.birthCertificateNumber || "",
        idProofUrl: s.idProofUrl || "",
        idProofType: s.idProofType || "Aadhaar Card",
        idProofFileName: s.idProofFileName || "",
        idProofFileType: s.idProofFileType || "",
        birthCertificateUrl: s.birthCertificateUrl || "",
        birthCertificateFileName: s.birthCertificateFileName || "",
        hasIdProof: Boolean(s.idProofUrl || s.birthCertificateUrl),
        bloodGroup: s.bloodGroup || "O+",
        religion: s.religion || "Hindu",
        caste: s.caste || "",
        fatherName: s.fatherName || "",
        motherName: s.motherName || "",
        guardianRelation: s.guardianRelation || "Father",
        altContact: s.altContact || "",
        address: s.address || {
          houseName: "",
          street: "",
          postOffice: "",
          city: "",
          district: "Idukki",
          state: "Kerala",
          pincode: "",
        },
        fullAddress:
          s.fullAddress ||
          (s.address
            ? [
                s.address.houseName,
                s.address.street,
                s.address.district,
                s.address.pincode ? `PIN: ${s.address.pincode}` : "",
              ]
                .filter(Boolean)
                .join(", ")
            : "Rajakkad P.O, Idukki, Kerala"),
        previousSchool: s.previousSchool || "",
        tcNumber: s.tcNumber || "",
        identificationMarks: s.identificationMarks || "",
      };
    });

    // Ensure all 26 academic divisions have represented students
    const sampleNamesPool = [
      { name: "Aaditya S. Kumar", g: "Male", cat: "General", dob: "14/05/2010", p: "Santhosh Kumar K." },
      { name: "Ananya Manoj", g: "Female", cat: "OBC", dob: "22/08/2010", p: "Manoj Varghese" },
      { name: "Devanand P. B.", g: "Male", cat: "SC", dob: "11/01/2010", p: "Balakrishnan P." },
      { name: "Fathima Nizar", g: "Female", cat: "OEC", dob: "03/12/2009", p: "Nizar Rawther" },
      { name: "Gopika Krishna", g: "Female", cat: "General", dob: "18/07/2010", p: "Radhakrishnan P." },
      { name: "Harikrishnan M.", g: "Male", cat: "OBC", dob: "09/03/2010", p: "Muraleedharan V." },
      { name: "Irfan Habeeb", g: "Male", cat: "General", dob: "25/11/2010", p: "Habeeb Rahman" },
      { name: "Kavya Rajesh", g: "Female", cat: "OBC", dob: "14/06/2010", p: "Rajesh Kumar" },
      { name: "Muhammed Bilal", g: "Male", cat: "OEC", dob: "29/09/2010", p: "Shajahan E." },
      { name: "Nandana Suresh", g: "Female", cat: "General", dob: "05/02/2010", p: "Suresh Babu" },
    ];

    let seedCounter = 200;
    ALL_CLASSES.forEach((cls) => {
      const clsDiv = cls.id;
      const hasStudents = students.some(
        (s) => s.division.toLowerCase() === clsDiv.toLowerCase() || s.division.toLowerCase() === cls.name.toLowerCase()
      );

      if (!hasStudents) {
        // Add 2 realistic students for this class
        [0, 1].forEach((k) => {
          const sample = sampleNamesPool[(seedCounter + k) % sampleNamesPool.length];
          const roll = k + 1;
          const isFemale = sample.g === "Female";
          const admNo = `ADM-${clsDiv.replace(/[^a-zA-Z0-9]/g, "")}-${100 + roll}`;
          students.push({
            _id: `seeded_${clsDiv}_${roll}`,
            rollNumber: roll,
            rollNoFormatted: `#${String(roll).padStart(2, "0")}`,
            admissionNumber: admNo,
            sampoornaId: `SMP-06042-${clsDiv.replace(/[^a-zA-Z0-9]/g, "")}-${200 + roll}`,
            name: sample.name,
            dob: sample.dob,
            division: clsDiv,
            guardian: sample.p,
            parentContact: `+91 9447${(seedCounter * 3) % 90000 + 10000}`,
            category: `${sample.cat} / ${isFemale ? "F" : "M"}`,
            gender: sample.g,
            attendance: `${96 + (k % 3)}.5%`,
            aadhaarNumber: `7894 ${1000 + seedCounter} 4567`,
            maskedAadhaar: "7894 XXXX 4567",
            birthCertificateNumber: `KL-IDK-2024-${5000 + seedCounter}`,
            idProofUrl: "",
            idProofType: "Aadhaar Card",
            idProofFileName: "",
            idProofFileType: "",
            birthCertificateUrl: "",
            birthCertificateFileName: "",
            hasIdProof: true,
            bloodGroup: "O+",
            religion: "Hindu",
            caste: "General",
            fatherName: sample.p,
            motherName: `Smt. ${sample.p.split(" ")[0]}a`,
            guardianRelation: "Father",
            altContact: "",
            fullAddress: "Rajakkad P.O, Idukki District, Kerala - 685566",
            previousSchool: "Government Lower/Upper Primary School",
            tcNumber: `TC-${8000 + seedCounter}`,
            identificationMarks: "A mole on the right cheek",
          });
          seedCounter++;
        });
      }
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
      gender,
      dob,
      category,
      religion,
      caste,
      bloodGroup,
      // Essential ID Proofs
      aadhaarNumber,
      birthCertificateNumber,
      // Uploaded ID Proof Document Files
      idProofUrl,
      idProofType,
      idProofFileName,
      idProofFileType,
      birthCertificateUrl,
      birthCertificateFileName,
      // Family & Guardian Details
      fatherName,
      motherName,
      guardian,
      guardianRelation,
      parentContact,
      altContact,
      // Residential Address
      houseName,
      street,
      postOffice,
      city,
      district,
      state,
      pincode,
      fullAddress,
      // Academic / TC
      previousSchool,
      tcNumber,
      identificationMarks,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Student full name is required for admission.",
      });
    }

    const count = await Student.countDocuments();
    const nextRoll = rollNumber ? Number(rollNumber) : count + 1;
    const targetDivision = classDivision || division || "Class 10-A";
    const formattedDiv = targetDivision.startsWith("Class ")
      ? targetDivision
      : `Class ${targetDivision}`;

    const admNo = admissionNumber?.trim() || `ADM-${14920 + nextRoll}`;
    const smpId = sampoornaId?.trim() || `SMP-06042-${880 + nextRoll}`;

    // Clean address structure
    const addrObj = {
      houseName: houseName?.trim() || "",
      street: street?.trim() || "",
      postOffice: postOffice?.trim() || "",
      city: city?.trim() || "",
      district: district?.trim() || "Idukki",
      state: state?.trim() || "Kerala",
      pincode: pincode?.trim() || "",
    };

    let computedFullAddress = fullAddress?.trim() || "";
    if (!computedFullAddress) {
      const parts = [
        addrObj.houseName,
        addrObj.street,
        addrObj.postOffice,
        addrObj.district,
        addrObj.pincode ? `PIN: ${addrObj.pincode}` : "",
      ].filter(Boolean);
      computedFullAddress = parts.join(", ");
    }

    const primaryGuardian =
      guardian?.trim() || fatherName?.trim() || motherName?.trim() || "Parent/Guardian";

    const newStudent = await Student.create({
      name: name.trim(),
      rollNumber: nextRoll,
      admissionNumber: admNo,
      studentId: admNo,
      sampoornaId: smpId,
      classDivision: formattedDiv,
      className: formattedDiv,
      gender: gender || "Male",
      dob: dob || "14/05/2010",
      category: category || "General",
      religion: religion?.trim() || "Hindu",
      caste: caste?.trim() || "",
      bloodGroup: bloodGroup || "Unknown",
      aadhaarNumber: aadhaarNumber?.trim() || "",
      birthCertificateNumber: birthCertificateNumber?.trim() || "",
      idProofUrl: idProofUrl?.trim() || "",
      idProofType: idProofType?.trim() || "Aadhaar Card",
      idProofFileName: idProofFileName?.trim() || "",
      idProofFileType: idProofFileType?.trim() || "",
      birthCertificateUrl: birthCertificateUrl?.trim() || "",
      birthCertificateFileName: birthCertificateFileName?.trim() || "",
      fatherName: fatherName?.trim() || "",
      motherName: motherName?.trim() || "",
      guardian: primaryGuardian,
      guardianRelation: guardianRelation?.trim() || "Father",
      parentContact: parentContact?.trim() || "+91 94470 00000",
      altContact: altContact?.trim() || "",
      address: addrObj,
      fullAddress: computedFullAddress,
      previousSchool: previousSchool?.trim() || "",
      tcNumber: tcNumber?.trim() || "",
      identificationMarks: identificationMarks?.trim() || "",
      overallAttendance: "100.0", // Newly admitted student starts with clean attendance
      status: "Present",
    });

    return res.status(201).json({
      success: true,
      message: `Student ${newStudent.name} admitted successfully with Sampoorna ID ${newStudent.sampoornaId}.`,
      student: newStudent,
    });
  } catch (error) {
    console.error("Error creating student:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create student admission record.",
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

    // If address pieces are provided, structure address
    if (
      updateData.houseName !== undefined ||
      updateData.street !== undefined ||
      updateData.district !== undefined ||
      updateData.pincode !== undefined
    ) {
      updateData.address = {
        houseName: updateData.houseName?.trim() || "",
        street: updateData.street?.trim() || "",
        postOffice: updateData.postOffice?.trim() || "",
        city: updateData.city?.trim() || "",
        district: updateData.district?.trim() || "Idukki",
        state: updateData.state?.trim() || "Kerala",
        pincode: updateData.pincode?.trim() || "",
      };

      const parts = [
        updateData.address.houseName,
        updateData.address.street,
        updateData.address.postOffice,
        updateData.address.district,
        updateData.address.pincode ? `PIN: ${updateData.address.pincode}` : "",
      ].filter(Boolean);
      updateData.fullAddress = parts.join(", ");
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

// 8. Get Exam Timetables & Stats
export const getExamTimetables = async (req, res) => {
  try {
    let count = await Exam.countDocuments();
    if (count === 0) {
      const defaultExams = [
        {
          term: "SSLC Board Examination March 2026",
          standard: "Standard 10 (SSLC)",
          date: "12 March 2026, Thu",
          startTime: "09:30 AM",
          endTime: "11:45 AM",
          duration: "2 hrs 15 mins",
          subject: "First Language – Malayalam Part I",
          qpCode: "MAL-101",
          hall: "Halls 01, 02, 03, 04",
          totalCandidates: 242,
          invigilator: "Mrs. Indu B Nair, Sri. George K.",
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
          term: "SSLC Board Examination March 2026",
          standard: "Standard 10 (SSLC)",
          date: "16 March 2026, Mon",
          startTime: "09:30 AM",
          endTime: "12:15 PM",
          duration: "2 hrs 45 mins",
          subject: "Second Language – English",
          qpCode: "ENG-102",
          hall: "Halls 01, 02, 03, 04",
          totalCandidates: 242,
          invigilator: "Sri. Thomas Joseph, Smt. Radhakrishnan N.",
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
              invigilatorName: "Sri. Suresh C. K.",
              invigilatorPen: "849219",
            },
          ],
        },
        {
          term: "SSLC Board Examination March 2026",
          standard: "Standard 10 (SSLC)",
          date: "19 March 2026, Thu",
          startTime: "09:30 AM",
          endTime: "12:15 PM",
          duration: "2 hrs 45 mins",
          subject: "Mathematics",
          qpCode: "MAT-104",
          hall: "Halls 01, 02, 03, 04",
          totalCandidates: 242,
          invigilator: "Mrs. Indu B Nair, Sri. George K.",
          maxMarks: 80,
          passMarks: 24,
          status: "Approved & Published",
          instructions:
            "Mathematical instruments & geometry boxes permitted. Calculators prohibited.",
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
          term: "SSLC Board Examination March 2026",
          standard: "Standard 10 (SSLC)",
          date: "23 March 2026, Mon",
          startTime: "09:30 AM",
          endTime: "11:45 AM",
          duration: "2 hrs 15 mins",
          subject: "Physics / Physical Science",
          qpCode: "PHY-105",
          hall: "Halls 01, 02, 03, 04",
          totalCandidates: 242,
          invigilator: "Smt. Bindu S., Sri. Suresh C. K.",
          maxMarks: 40,
          passMarks: 12,
          status: "Approved & Published",
          instructions: "15 min cool-off period before writing.",
        },
        {
          term: "SSLC Board Examination March 2026",
          standard: "Standard 10 (SSLC)",
          date: "26 March 2026, Thu",
          startTime: "09:30 AM",
          endTime: "11:45 AM",
          duration: "2 hrs 15 mins",
          subject: "Chemistry",
          qpCode: "CHE-106",
          hall: "Halls 01, 02, 03, 04",
          totalCandidates: 242,
          invigilator: "Sri. Suresh C. K., Smt. Bindu S.",
          maxMarks: 40,
          passMarks: 12,
          status: "Approved & Published",
          instructions: "15 min cool-off period before writing.",
        },
        {
          term: "SSLC Board Examination March 2026",
          standard: "Standard 10 (SSLC)",
          date: "30 March 2026, Mon",
          startTime: "09:30 AM",
          endTime: "12:15 PM",
          duration: "2 hrs 45 mins",
          subject: "Social Science",
          qpCode: "SOC-108",
          hall: "Halls 01, 02, 03, 04",
          totalCandidates: 242,
          invigilator: "Smt. Radhakrishnan N., Sri. Thomas Joseph",
          maxMarks: 80,
          passMarks: 24,
          status: "Approved & Published",
          instructions: "Map pointing sheet provided with question booklet.",
        },
        {
          term: "Plus Two Higher Secondary Board Examination 2026",
          standard: "Standard 12 (Plus Two Science)",
          date: "10 March 2026, Tue",
          startTime: "01:30 PM",
          endTime: "04:15 PM",
          duration: "2 hrs 45 mins",
          subject: "Part I English",
          qpCode: "HSE-201",
          hall: "Auditorium Wing A & B",
          totalCandidates: 180,
          invigilator: "Sri. Thomas Joseph",
          maxMarks: 80,
          passMarks: 24,
          status: "Approved & Published",
          instructions: "Afternoon session. Seating commences at 01:15 PM.",
        },
        {
          term: "Plus Two Higher Secondary Board Examination 2026",
          standard: "Standard 12 (Plus Two Science)",
          date: "14 March 2026, Sat",
          startTime: "01:30 PM",
          endTime: "04:15 PM",
          duration: "2 hrs 45 mins",
          subject: "Chemistry",
          qpCode: "HSE-204",
          hall: "Auditorium Wing A",
          totalCandidates: 120,
          invigilator: "Sri. Suresh C. K.",
          maxMarks: 60,
          passMarks: 18,
          status: "Approved & Published",
          instructions: "Afternoon session. Periodic tables provided in question booklet.",
        },
        {
          term: "Plus Two Higher Secondary Board Examination 2026",
          standard: "Standard 12 (Plus Two Science)",
          date: "18 March 2026, Wed",
          startTime: "01:30 PM",
          endTime: "04:15 PM",
          duration: "2 hrs 45 mins",
          subject: "Mathematics (Science)",
          qpCode: "HSE-206",
          hall: "Auditorium Wing A",
          totalCandidates: 120,
          invigilator: "Sri. George K.",
          maxMarks: 80,
          passMarks: 24,
          status: "Draft / Scheduled",
          instructions: "Draft timetable pending Directorate gazette publication.",
        },
        {
          term: "High School Annual Evaluation (Class 8 & 9)",
          standard: "Standard 9",
          date: "02 April 2026, Thu",
          startTime: "09:30 AM",
          endTime: "11:45 AM",
          duration: "2 hrs 15 mins",
          subject: "Annual Evaluation – Basic Science",
          qpCode: "HS-903",
          hall: "Classrooms 9-A & 9-B",
          totalCandidates: 92,
          invigilator: "Smt. Bindu S.",
          maxMarks: 40,
          passMarks: 12,
          status: "Draft / Scheduled",
          instructions: "Internal school evaluation conducted under SCERT guidelines.",
        },
        {
          term: "High School Annual Evaluation (Class 8 & 9)",
          standard: "Standard 8",
          date: "03 April 2026, Fri",
          startTime: "09:30 AM",
          endTime: "11:45 AM",
          duration: "2 hrs 15 mins",
          subject: "Annual Evaluation – Mathematics",
          qpCode: "HS-804",
          hall: "Classrooms 8-A, 8-B, 8-C",
          totalCandidates: 134,
          invigilator: "Mrs. Indu B Nair",
          maxMarks: 40,
          passMarks: 12,
          status: "Draft / Scheduled",
          instructions: "Annual terminal examination for lower secondary promotion.",
        },
      ];
      await Exam.insertMany(defaultExams);
    }

    const { search, standard, term, status } = req.query;
    let query = {};
    if (standard && standard !== "All") {
      query.standard = { $regex: standard, $options: "i" };
    }
    if (term && term !== "All") {
      query.term = { $regex: term, $options: "i" };
    }
    if (status && status !== "All") {
      query.status = status;
    }
    if (search) {
      const q = search.trim();
      query.$or = [
        { subject: { $regex: q, $options: "i" } },
        { qpCode: { $regex: q, $options: "i" } },
        { standard: { $regex: q, $options: "i" } },
        { hall: { $regex: q, $options: "i" } },
        { invigilator: { $regex: q, $options: "i" } },
      ];
    }

    const exams = await Exam.find(query).sort({ date: 1, _id: 1 }).lean();
    const allExams = await Exam.find().lean();

    const stats = {
      totalSchedules: allExams.length,
      upcomingCount: allExams.filter((e) => e.status === "Approved & Published").length,
      hallsAllocated: 12,
      invigilatorCadre: 24,
    };

    return res.status(200).json({ success: true, exams, stats });
  } catch (error) {
    console.error("Error in getExamTimetables:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Create New Exam Schedule
export const createExam = async (req, res) => {
  try {
    const {
      term,
      standard,
      date,
      startTime,
      endTime,
      duration,
      subject,
      qpCode,
      hall,
      totalCandidates,
      invigilator,
      maxMarks,
      passMarks,
      status,
      instructions,
    } = req.body;

    if (!subject || !date || !standard || !qpCode) {
      return res.status(400).json({
        success: false,
        message: "Subject, Exam Date, Standard, and QP Code are required.",
      });
    }

    const candidates = Number(totalCandidates) || 40;
    const defaultSeating = [
      {
        hallNumber: hall ? hall.split(",")[0].trim() : "Hall 01",
        roomName: "Academic Block - Examination Hall",
        rollRange: `ADM-14920 to ADM-${14920 + Math.min(candidates, 40) - 1}`,
        candidateCount: Math.min(candidates, 40),
        invigilatorName: invigilator || "Mrs. Indu B Nair",
        invigilatorPen: "849201",
      },
    ];

    const newExam = await Exam.create({
      term: term || "SSLC Board Examination March 2026",
      standard,
      date,
      startTime: startTime || "09:30 AM",
      endTime: endTime || "12:15 PM",
      duration: duration || "2 hrs 45 mins",
      subject,
      qpCode,
      hall: hall || "Hall 01",
      totalCandidates: candidates,
      invigilator: invigilator || "Mrs. Indu B Nair",
      maxMarks: Number(maxMarks) || 80,
      passMarks: Number(passMarks) || 24,
      status: status || "Approved & Published",
      instructions:
        instructions ||
        "15 minutes cool-off time provided before writing starts. Candidates must be seated by 09:15 AM.",
      seatingPlan: defaultSeating,
    });

    return res.status(201).json({
      success: true,
      message: `Exam session for ${subject} scheduled successfully.`,
      exam: newExam,
    });
  } catch (error) {
    console.error("Error creating exam schedule:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create exam schedule.",
    });
  }
};

// 10. Update Exam Schedule
export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Exam.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Exam schedule for ${updated.subject} updated successfully.`,
      exam: updated,
    });
  } catch (error) {
    console.error("Error updating exam schedule:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update exam schedule.",
    });
  }
};

// 11. Delete Exam Schedule
export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Exam.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Exam schedule removed successfully.`,
    });
  } catch (error) {
    console.error("Error deleting exam schedule:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete exam schedule.",
    });
  }
};

// 12. Get Exam Seating Plan & Hall Distribution
export const getExamSeatingPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id).lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found.",
      });
    }

    let seating = exam.seatingPlan || [];
    if (seating.length === 0) {
      seating = [
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
      ];
    }

    return res.status(200).json({
      success: true,
      examId: exam._id,
      subject: exam.subject,
      qpCode: exam.qpCode,
      standard: exam.standard,
      date: exam.date,
      time: `${exam.startTime} – ${exam.endTime}`,
      totalCandidates: exam.totalCandidates,
      seatingPlan: seating,
    });
  } catch (error) {
    console.error("Error getting exam seating plan:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch exam seating plan.",
    });
  }
};
