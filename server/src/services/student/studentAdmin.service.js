import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Student from "../../models/Student.js";
import User from "../../models/user.js";
import { ALL_CLASSES, normalizeClassDivision } from "../../utils/classData.js";
import { ApiError } from "../../utils/ApiError.js";
import { validateStudentAgeForClass } from "../../validators/student.validator.js";
import { validateHumanName } from "../../utils/nameValidator.js";
import { OtpService } from "../otp.service.js";

import StudentQueryService from "./studentQuery.service.js";

export class StudentAdminService {
  static getStudentsRecords = StudentQueryService.getStudentsRecords;
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
