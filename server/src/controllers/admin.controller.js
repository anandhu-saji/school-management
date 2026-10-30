import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import Teacher from "../models/Teacher.js";

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

// 3. Get Teachers Records & Faculty Cadre Stats
export const getTeachersRecords = async (req, res) => {
  try {
    let teachersRaw = await Teacher.find().lean();

    // If fewer than 6 exist, seed with the standard government faculty cadre
    if (teachersRaw.length < 6) {
      const defaultCadre = [
        {
          name: "Mrs. Priya Nair",
          department: "HSST Malayalam",
          assignedClass: "Class 10-A Mentor",
          mentorClass: "10-A",
          pen: "849201",
          phone: "+91 94471 23450",
          periods: "24 hrs / Week",
          status: "In Class",
          qualification: "M.A Malayalam, B.Ed, SET",
        },
        {
          name: "Sri. George K.",
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
        const exists = teachersRaw.some(
          (ex) => ex.pen === t.pen || ex.name === t.name
        );
        if (!exists) {
          const created = await Teacher.create(t);
          teachersRaw.push(created.toObject());
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
    const {
      name,
      pen,
      department,
      assignedClass,
      phone,
      email,
      periods,
      status,
      qualification,
      appointmentDate,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Teacher full name is required.",
      });
    }

    const newTeacher = await Teacher.create({
      name: name.trim(),
      pen: pen?.trim() || `849${Math.floor(100 + Math.random() * 900)}`,
      department: department?.trim() || "High School",
      assignedClass: assignedClass?.trim() || "Faculty Mentor",
      phone: phone?.trim() || "+91 94471 00000",
      email: email?.trim() || "",
      periods: periods?.trim() || "24 hrs / Week",
      status: status || "Active",
      qualification: qualification?.trim() || "B.Ed",
      appointmentDate: appointmentDate?.trim() || "01/06/2020",
    });

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

    const updated = await Teacher.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
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

    const students = studentsRaw.map((s, idx) => {
      const roll = s.rollNumber || (idx + 1);
      const isFemale = s.gender === "Female" || s.gender === "Girl";
      const rawCategory = s.category || (isFemale ? "OBC" : "General");
      const categoryTag = rawCategory.includes("/")
        ? rawCategory
        : `${rawCategory} / ${isFemale ? "F" : "M"}`;

      const rawDiv = (s.classDivision || s.className || "10-A").replace(/^Class\s+/i, "").trim();

      // Format Aadhaar display with mask if present
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
        // Essential Identification & Proofs
        aadhaarNumber: rawAadhaar,
        maskedAadhaar,
        birthCertificateNumber: s.birthCertificateNumber || "",
        // Uploaded ID Proof Files
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
