import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Student from "../../models/Student.js";
import User from "../../models/user.js";
import { ALL_CLASSES, normalizeClassDivision } from "../../utils/classData.js";
import { ApiError } from "../../utils/ApiError.js";
import { validateStudentAgeForClass } from "../../validators/student.validator.js";
import { validateHumanName } from "../../utils/nameValidator.js";
import { OtpService } from "../otp.service.js";

export class StudentAdminService {
  /**
   * Fetch all student admission records for admin census table with backend search, filter, and pagination
   */
  static async getStudentsRecords({
    limit,
    includeDeleted = false,
    deletedOnly = false,
    search = "",
    division = "",
    page,
    pageSize,
  } = {}) {
    const filter = {};
    if (deletedOnly) {
      filter.isDeleted = true;
    }

    const andConditions = [];

    // Backend Search by name, roll number, admission number, Sampoorna ID, Aadhaar, guardian, etc.
    if (search && search.trim() !== "") {
      const q = search.trim();
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escaped, "i");
      const numVal = Number(q);

      const orConditions = [
        { name: searchRegex },
        { admissionNumber: searchRegex },
        { sampoornaId: searchRegex },
        { studentId: searchRegex },
        { email: searchRegex },
        { aadhaarNumber: searchRegex },
        { guardian: searchRegex },
        { fatherName: searchRegex },
        { motherName: searchRegex },
        { parentContact: searchRegex },
        { phone: searchRegex },
      ];

      if (!isNaN(numVal) && Number.isInteger(numVal)) {
        orConditions.push({ rollNumber: numVal });
      }

      andConditions.push({ $or: orConditions });
    }

    // Backend Division filter
    if (division && division !== "All") {
      const norm = normalizeClassDivision(division);
      const cleanDiv = norm ? norm.id : division.replace(/^Class\s*/i, "").trim();
      const divRegex = new RegExp(cleanDiv.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      andConditions.push({
        $or: [
          { classDivision: divRegex },
          { className: divRegex },
          { division: divRegex },
        ],
      });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    let query = Student.find(filter).sort({ rollNumber: 1 });
    if (includeDeleted) {
      query = query.setOptions({ includeDeleted: true });
    }

    let pagination = null;
    if (page && pageSize) {
      const pageNum = Math.max(1, Number(page));
      const sizeNum = Math.max(1, Number(pageSize));
      const totalFiltered = await Student.countDocuments(filter);
      query = query.skip((pageNum - 1) * sizeNum).limit(sizeNum);
      pagination = {
        currentPage: pageNum,
        pageSize: sizeNum,
        totalRecords: totalFiltered,
        totalPages: Math.ceil(totalFiltered / sizeNum) || 1,
      };
    } else if (limit) {
      query = query.limit(Number(limit));
    }

    const studentsRaw = await query.lean();

    const totalCount = await Student.countDocuments();
    const boysCount = await Student.countDocuments({ gender: { $in: ["Male", "Boy"] } });
    const girlsCount = await Student.countDocuments({ gender: { $in: ["Female", "Girl"] } });
    const class10Count = await Student.countDocuments({
      $or: [
        { classDivision: { $regex: /10/i } },
        { className: { $regex: /10/i } },
        { division: { $regex: /10/i } },
      ],
    });
    const plusTwoCount = await Student.countDocuments({
      $or: [
        { classDivision: { $regex: /(?:11|12|Plus)/i } },
        { className: { $regex: /(?:11|12|Plus)/i } },
        { division: { $regex: /(?:11|12|Plus)/i } },
      ],
    });

    const verifiedAadhaarCount = await Student.countDocuments({
      aadhaarNumber: { $exists: true, $ne: "" },
    });
    const verifiedPercent =
      totalCount > 0
        ? Math.round(((verifiedAadhaarCount > 0 ? verifiedAadhaarCount : totalCount) / totalCount) * 100)
        : 0;

    const stats = {
      totalEnrolled: totalCount,
      boysCount,
      girlsCount,
      class10Candidates: class10Count,
      plusTwoCount,
      sampoornaVerified: `${verifiedPercent}%`,
    };

    let students = studentsRaw.map((s, idx) => {
      const roll = s.rollNumber || idx + 1;
      const isFemale = s.gender === "Female" || s.gender === "Girl";
      const rawCategory = s.category || (isFemale ? "OBC" : "General");
      const categoryTag = rawCategory.includes("/")
        ? rawCategory
        : `${rawCategory} / ${isFemale ? "F" : "M"}`;

      const normDiv = normalizeClassDivision(s.classDivision || s.className || "Class 10-A");
      const canonName = normDiv ? normDiv.name : (s.classDivision || s.className || "Class 10-A");
      const rawDiv = normDiv ? normDiv.id : canonName.replace(/^Class\s+/i, "").trim();
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
        division: canonName,
        classDivision: canonName,
        className: canonName,
        divisionId: rawDiv,
        guardian: s.guardian || s.fatherName || `Guardian ${s.name.split(" ")[0]}`,
        parentContact: s.parentContact || `+91 94473 ${11800 + roll}`,
        category: categoryTag,
        gender: s.gender || (isFemale ? "Female" : "Male"),
        email: s.email || "",
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
                s.address.postOffice,
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

    return {
      stats,
      count: students.length,
      students,
      ...(pagination ? { pagination } : {}),
    };
  }

  /**
   * Fetch student by ID
   */
  static async getStudentById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid Student ID format.");
    }
    const student = await Student.findById(id).lean();
    if (!student) {
      throw ApiError.notFound("Student record not found.");
    }
    return student;
  }

  /**
   * Create new student admission
   */
  static async createStudent(data) {
    const nameCheck = validateHumanName(data.name, "Student full name");
    if (nameCheck !== true) {
      throw ApiError.badRequest(nameCheck);
    }

    if (data.fatherName) {
      const fCheck = validateHumanName(data.fatherName, "Father's name");
      if (fCheck !== true) throw ApiError.badRequest(fCheck);
    }
    if (data.motherName) {
      const mCheck = validateHumanName(data.motherName, "Mother's name");
      if (mCheck !== true) throw ApiError.badRequest(mCheck);
    }
    if (data.guardian) {
      const gCheck = validateHumanName(data.guardian, "Guardian's name");
      if (gCheck !== true) throw ApiError.badRequest(gCheck);
    }

    const targetDivision = data.classDivision || data.division || "Class 10-A";
    if (data.dob) {
      const ageCheck = validateStudentAgeForClass(data.dob, targetDivision);
      if (ageCheck !== true) {
        throw ApiError.badRequest(ageCheck);
      }
    }

    const count = await Student.countDocuments();
    const nextRoll = data.rollNumber ? Number(data.rollNumber) : count + 1;
    const norm = normalizeClassDivision(targetDivision);
    const formattedDiv = norm ? norm.name : (targetDivision.startsWith("Class ") ? targetDivision : `Class ${targetDivision}`);

    const admNo = data.admissionNumber?.trim() || `ADM-${14920 + nextRoll}`;
    const smpId = data.sampoornaId?.trim() || `SMP-06042-${880 + nextRoll}`;

    const addrObj = {
      houseName: data.houseName?.trim() || data.address?.houseName?.trim() || "",
      street: data.street?.trim() || data.address?.street?.trim() || "",
      postOffice: data.postOffice?.trim() || data.address?.postOffice?.trim() || "",
      city: data.city?.trim() || data.address?.city?.trim() || "",
      district: data.district?.trim() || data.address?.district?.trim() || "Idukki",
      state: data.state?.trim() || data.address?.state?.trim() || "Kerala",
      pincode: data.pincode?.trim() || data.address?.pincode?.trim() || "",
    };

    let computedFullAddress = data.fullAddress?.trim() || "";
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
      data.guardian?.trim() || data.fatherName?.trim() || data.motherName?.trim() || "Parent Guardian";

    let cleanEmail = undefined;
    if (data.email && data.email.trim()) {
      cleanEmail = data.email.trim().toLowerCase();
      const existing = await Student.findOne({ email: cleanEmail });
      if (existing) {
        throw ApiError.conflict(`A student with email ID "${cleanEmail}" is already registered (${existing.name}).`);
      }

      // Enforce OTP verification before admission can be finalized
      const isVerified = await OtpService.isEmailVerified({
        email: cleanEmail,
        purpose: "student_admission",
      });
      if (!isVerified) {
        throw ApiError.badRequest(
          `Email verification required: Please verify "${cleanEmail}" with the 6-digit OTP code before completing admission.`
        );
      }
    }

    const studentToCreate = {
      name: data.name.trim(),
      rollNumber: nextRoll,
      admissionNumber: admNo,
      studentId: admNo,
      sampoornaId: smpId,
      classDivision: formattedDiv,
      className: formattedDiv,
      division: formattedDiv,
      gender: data.gender || "Male",
      dob: data.dob || "14/05/2010",
      category: data.category || "General",
      religion: data.religion?.trim() || "Hindu",
      caste: data.caste?.trim() || "",
      bloodGroup: data.bloodGroup || "Unknown",
      aadhaarNumber: data.aadhaarNumber?.trim() || "",
      birthCertificateNumber: data.birthCertificateNumber?.trim() || "",
      idProofUrl: data.idProofUrl?.trim() || "",
      idProofType: data.idProofType?.trim() || "Aadhaar Card",
      idProofFileName: data.idProofFileName?.trim() || "",
      idProofFileType: data.idProofFileType?.trim() || "",
      birthCertificateUrl: data.birthCertificateUrl?.trim() || "",
      birthCertificateFileName: data.birthCertificateFileName?.trim() || "",
      fatherName: data.fatherName?.trim() || "",
      motherName: data.motherName?.trim() || "",
      guardian: primaryGuardian,
      guardianRelation: data.guardianRelation?.trim() || "Father",
      parentContact: data.parentContact?.trim() || "+91 94470 00000",
      altContact: data.altContact?.trim() || "",
      address: addrObj,
      fullAddress: computedFullAddress,
      previousSchool: data.previousSchool?.trim() || "",
      tcNumber: data.tcNumber?.trim() || "",
      identificationMarks: data.identificationMarks?.trim() || "",
      overallAttendance: "100.0",
      status: "Present",
    };

    if (cleanEmail) {
      studentToCreate.email = cleanEmail;
    }

    const newStudent = await Student.create(studentToCreate);

    // Ensure institutional user account is created for the student with primary password Student@123
    let accountEmail = cleanEmail;
    if (!accountEmail) {
      const cleanAdm = (newStudent.admissionNumber || `ADM-${14920 + nextRoll}`)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      accountEmail = `${cleanAdm}@student.ghss.edu`;
      newStudent.email = accountEmail;
    }

    if (cleanEmail) {
      // Consume the used verification record
      await OtpService.consumeVerification({
        email: cleanEmail,
        purpose: "student_admission",
      });
    }

    // Primary password is Student@123 as required
    let user = await User.findOne({ email: accountEmail });
    if (!user) {
      user = await User.create({
        name: newStudent.name,
        username: accountEmail.split("@")[0],
        email: accountEmail,
        password: "Student@123",
        role: "student",
      });
    } else {
      user.password = "Student@123";
      await user.save();
    }
    newStudent.userId = user._id;
    await newStudent.save();

    // Link and sync any pre-existing fee payment records with student profile
    try {
      const FeePayment = (await import("../../models/FeePayment.js")).default;
      const { getAcademicWingForClass } = await import("../../utils/classData.js");
      const derivedWing = getAcademicWingForClass(newStudent.classDivision);
      await FeePayment.updateMany(
        {
          $or: [
            { admissionNumber: newStudent.admissionNumber },
            { studentName: newStudent.name },
          ],
        },
        {
          $set: {
            studentId: newStudent._id,
            studentName: newStudent.name,
            admissionNumber: newStudent.admissionNumber,
            rollNumber: newStudent.rollNumber,
            classDivision: newStudent.classDivision,
            wing: derivedWing,
          },
        }
      );
    } catch (err) {
      console.warn("[createStudent] FeePayment sync warning:", err);
    }

    return newStudent;
  }

  /**
   * Update student admission record
   */
  static async updateStudent(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid Student ID format.");
    }

    if (data.name !== undefined) {
      const nameCheck = validateHumanName(data.name, "Student full name");
      if (nameCheck !== true) {
        throw ApiError.badRequest(nameCheck);
      }
    }
    if (data.fatherName) {
      const fCheck = validateHumanName(data.fatherName, "Father's name");
      if (fCheck !== true) throw ApiError.badRequest(fCheck);
    }
    if (data.motherName) {
      const mCheck = validateHumanName(data.motherName, "Mother's name");
      if (mCheck !== true) throw ApiError.badRequest(mCheck);
    }
    if (data.guardian) {
      const gCheck = validateHumanName(data.guardian, "Guardian's name");
      if (gCheck !== true) throw ApiError.badRequest(gCheck);
    }

    if (data.dob) {
      let targetDivision = data.classDivision || data.division;
      if (!targetDivision) {
        const existingStudent = await Student.findById(id).lean();
        targetDivision = existingStudent?.classDivision || existingStudent?.className || "Class 10-A";
      }
      const ageCheck = validateStudentAgeForClass(data.dob, targetDivision);
      if (ageCheck !== true) {
        throw ApiError.badRequest(ageCheck);
      }
    }

    const updateData = { ...data };
    const updateOps = { $set: updateData };

    if (updateData.email !== undefined) {
      if (updateData.email && updateData.email.trim()) {
        const cleanEmail = updateData.email.trim().toLowerCase();
        const existing = await Student.findOne({
          _id: { $ne: id },
          email: cleanEmail,
        });
        if (existing) {
          throw ApiError.conflict(`A student with email ID "${cleanEmail}" is already registered (${existing.name}).`);
        }
        updateData.email = cleanEmail;
      } else {
        delete updateData.email;
        updateOps.$unset = { email: 1 };
      }
    }

    if (updateData.division || updateData.classDivision) {
      const rawTarget = updateData.classDivision || updateData.division;
      const norm = normalizeClassDivision(rawTarget);
      const formattedDiv = norm ? norm.name : (rawTarget.trim().startsWith("Class ") ? rawTarget.trim() : `Class ${rawTarget.trim()}`);
      updateData.classDivision = formattedDiv;
      updateData.className = formattedDiv;
      updateData.division = formattedDiv;
    }

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
      updateOps,
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw ApiError.notFound("Student record not found.");
    }

    if (updated.userId && updateData.email) {
      await User.findByIdAndUpdate(updated.userId, { email: updateData.email });
    }

    // Propagate student class, division, wing and details to all FeePayment records
    try {
      const FeePayment = (await import("../../models/FeePayment.js")).default;
      const { getAcademicWingForClass } = await import("../../utils/classData.js");
      const canonDiv = updated.classDivision || updated.className || "Class 10-A";
      const derivedWing = getAcademicWingForClass(canonDiv);
      await FeePayment.updateMany(
        {
          $or: [
            { studentId: updated._id },
            { admissionNumber: updated.admissionNumber },
            { studentName: updated.name },
          ],
        },
        {
          $set: {
            studentId: updated._id,
            studentName: updated.name,
            admissionNumber: updated.admissionNumber,
            rollNumber: updated.rollNumber,
            classDivision: canonDiv,
            wing: derivedWing,
          },
        }
      );
    } catch (err) {
      console.warn("[updateStudent] FeePayment sync warning:", err);
    }

    return updated;
  }

  /**
   * Soft delete student record (moves to trash, deactivates associated account)
   */
  static async deleteStudent(id, deletedBy = null) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid Student ID format.");
    }
    const student = await Student.findById(id);
    if (!student) {
      throw ApiError.notFound("Student record not found.");
    }
    await student.softDelete(deletedBy);

    // Deactivate and soft-delete linked user account if exists
    if (student.userId) {
      const user = await User.findById(student.userId).setOptions({ includeDeleted: true });
      if (user) {
        user.isDeleted = true;
        user.isActive = false;
        user.deletedAt = new Date();
        if (deletedBy) user.deletedBy = deletedBy;
        await user.save();
      }
    } else if (student.email) {
      const user = await User.findOne({ email: student.email.toLowerCase() }).setOptions({ includeDeleted: true });
      if (user) {
        user.isDeleted = true;
        user.isActive = false;
        user.deletedAt = new Date();
        if (deletedBy) user.deletedBy = deletedBy;
        await user.save();
      }
    }

    return student;
  }

  /**
   * Restore soft-deleted student record
   */
  static async restoreStudent(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid Student ID format.");
    }
    const student = await Student.findOne({ _id: id, isDeleted: true });
    if (!student) {
      throw ApiError.notFound("Deleted student record not found in trash.");
    }
    await student.restore();

    // Re-activate and restore linked user account if exists
    if (student.userId) {
      const user = await User.findOne({ _id: student.userId, isDeleted: true });
      if (user) {
        user.isDeleted = false;
        user.isActive = true;
        user.deletedAt = null;
        user.deletedBy = null;
        await user.save();
      }
    } else if (student.email) {
      const user = await User.findOne({ email: student.email.toLowerCase(), isDeleted: true });
      if (user) {
        user.isDeleted = false;
        user.isActive = true;
        user.deletedAt = null;
        user.deletedBy = null;
        await user.save();
      }
    }

    return student;
  }

  /**
   * Delete / Purge all student records and related data permanently
   */
  static async purgeAllStudents() {
    const studentRes = await Student.deleteMany({});
    const userRes = await User.deleteMany({
      $or: [
        { role: "student" },
        { email: { $in: ["student@ghss.edu", "hss_student@ghss.edu"] } },
      ],
    });
    return {
      deletedStudents: studentRes.deletedCount,
      deletedAccounts: userRes.deletedCount,
    };
  }
}
