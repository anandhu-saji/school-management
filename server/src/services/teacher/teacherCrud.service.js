import bcrypt from "bcryptjs";
import Teacher from "../../models/Teacher.js";
import User from "../../models/user.js";
import { isTeacherActiveAdmissionAdmin } from "../../middleware/role.middleware.js";
import { ApiError } from "../../utils/ApiError.js";
import { OtpService } from "../otp.service.js";
import { validateHumanName } from "../../utils/nameValidator.js";
import {
  calculateTeacherAge,
  validateTeacherAge,
  validateTeacherAppointmentDate,
} from "../../validators/teacher.validator.js";

export class TeacherCrudService {
  static async getTeachersList({
    includeDeleted = false,
    deletedOnly = false,
    search = "",
    department = "",
    page,
    pageSize,
  } = {}) {
    const filter = {};
    if (deletedOnly) {
      filter.isDeleted = true;
    }

    const andConditions = [];

    // Backend Search by name, PEN, email, phone, Aadhaar, department, etc.
    if (search && search.trim() !== "") {
      const q = search.trim();
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escaped, "i");
      andConditions.push({
        $or: [
          { name: searchRegex },
          { pen: searchRegex },
          { penNumber: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { aadhaarNumber: searchRegex },
          { department: searchRegex },
          { designation: searchRegex },
          { assignedClass: searchRegex },
          { specialization: searchRegex },
        ],
      });
    }

    // Backend Department filter
    if (department && department !== "All") {
      const selClean = department.toLowerCase();
      let deptConditions = [];
      if (selClean === "lower primary") {
        deptConditions = [
          { department: /lpsa|primary|lp/i },
          { designation: /lpsa/i },
        ];
      } else if (selClean === "upper primary") {
        deptConditions = [
          { department: /upsa|up/i },
          { designation: /upsa/i },
        ];
      } else if (selClean === "high school") {
        deptConditions = [
          { department: /hst|high school/i },
          { designation: /hst/i },
        ];
      } else if (selClean === "higher secondary") {
        deptConditions = [
          { department: /hsst|higher secondary|plus two/i },
          { designation: /hsst/i },
        ];
      } else {
        const deptRegex = new RegExp(department.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        deptConditions = [{ department: deptRegex }, { designation: deptRegex }];
      }
      andConditions.push({ $or: deptConditions });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    let query = Teacher.find(filter).sort({ name: 1 });
    if (includeDeleted) {
      query = query.setOptions({ includeDeleted: true });
    }

    let pagination = null;
    if (page && pageSize) {
      const pageNum = Math.max(1, Number(page));
      const sizeNum = Math.max(1, Number(pageSize));
      const totalFiltered = await Teacher.countDocuments(filter);
      query = query.skip((pageNum - 1) * sizeNum).limit(sizeNum);
      pagination = {
        currentPage: pageNum,
        pageSize: sizeNum,
        totalRecords: totalFiltered,
        totalPages: Math.ceil(totalFiltered / sizeNum) || 1,
      };
    }

    let teachers = await query.lean();
    if (!teachers) {
      teachers = [];
    }

    teachers = teachers.map((t) => ({
      ...t,
      isAdmissionAdminActive: isTeacherActiveAdmissionAdmin(t),
    }));

    const allTeachers = await Teacher.find(deletedOnly ? { isDeleted: true } : {}).lean();
    const totalSanctioned = allTeachers.length;
    const regularTeachers = allTeachers.filter(
      (t) =>
        (t.employmentType && t.employmentType.toLowerCase().includes("permanent")) ||
        ["HST", "HSST", "LPSA", "UPSA"].includes(t.designation)
    ).length;

    const onDutyStaff = allTeachers.filter((t) => t.status === "On Duty").length;
    const admissionAdminsCount = allTeachers.filter((t) => isTeacherActiveAdmissionAdmin(t)).length;
    const vacantPosts = Math.max(0, 26 - totalSanctioned);
    const guestFaculty = Math.max(0, totalSanctioned - regularTeachers);
    const periodsPerWeek = allTeachers.reduce(
      (acc, t) => acc + (Number(t.periodsPerWeek) || 24),
      0
    );

    return {
      teachers,
      stats: {
        totalSanctioned,
        totalFaculty: totalSanctioned,
        permanentPosts: regularTeachers,
        regularTeachers,
        onDutyStaff,
        admissionAdminsCount,
        vacantPosts,
        guestFaculty,
        periodsPerWeek,
      },
      count: teachers.length,
      ...(pagination ? { pagination } : {}),
    };
  }

  /**
   * Fetch single teacher by ID
   */
  static async getTeacherById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid teacher ID format.");
    }
    const teacher = await Teacher.findById(id).lean();
    if (!teacher) {
      throw ApiError.notFound("Teacher profile not found.");
    }
    return teacher;
  }

  /**
   * Create a new teacher
   */
  static async createTeacher(data) {
    if (!data.name || !data.email) {
      throw ApiError.badRequest("Teacher name and email are mandatory.");
    }

    const nameCheck = validateHumanName(data.name, "Teacher name");
    if (nameCheck !== true) {
      throw ApiError.badRequest(nameCheck);
    }

    if (data.dob) {
      const ageCheck = validateTeacherAge(data.dob);
      if (ageCheck !== true) {
        throw ApiError.badRequest(ageCheck);
      }
      const parsed = calculateTeacherAge(data.dob);
      if (parsed) {
        data.age = parsed.age;
      }
    }

    if (data.appointmentDate) {
      const apptCheck = validateTeacherAppointmentDate(data.appointmentDate, data.dob);
      if (apptCheck !== true) {
        throw ApiError.badRequest(apptCheck);
      }
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const existing = await Teacher.findOne({ email: cleanEmail });
    if (existing) {
      throw ApiError.conflict("A teacher with this institutional email is already registered.");
    }

    // Enforce OTP verification before teacher registration is finalized
    const isVerified = await OtpService.isEmailVerified({
      email: cleanEmail,
      purpose: "teacher_registration",
    });
    if (!isVerified && !data.skipOtp) {
      throw ApiError.badRequest(
        `Email verification required: Please verify "${cleanEmail}" with the 6-digit OTP code before completing faculty registration.`
      );
    }

    const count = await Teacher.countDocuments();
    const penNumber = data.penNumber || `PEN-${849200 + count + 1}`;
    const pen = penNumber.replace(/^PEN-?/i, "");

    const teacher = await Teacher.create({
      ...data,
      email: cleanEmail,
      pen,
      penNumber,
      periodsPerWeek: Number(data.periodsPerWeek) || 24,
      employmentType: data.employmentType || "Permanent / Sanctioned",
      gender: data.gender || "Female",
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    // Consume verification token
    await OtpService.consumeVerification({
      email: cleanEmail,
      purpose: "teacher_registration",
    });

    // Create or synchronize linked user login account with primary password Teacher@123
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      user = await User.create({
        name: teacher.name,
        username: cleanEmail.split("@")[0],
        email: cleanEmail,
        password: "Teacher@123",
        role: "teacher",
      });
    } else {
      user.role = "teacher";
      user.password = "Teacher@123";
      await user.save();
    }
    teacher.userId = user._id;
    await teacher.save();

    return teacher;
  }

  /**
   * Update teacher by ID
   */
  static async updateTeacher(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid teacher ID format.");
    }

    if (data.name !== undefined) {
      const nameCheck = validateHumanName(data.name, "Teacher name");
      if (nameCheck !== true) {
        throw ApiError.badRequest(nameCheck);
      }
    }

    if (data.dob) {
      const ageCheck = validateTeacherAge(data.dob);
      if (ageCheck !== true) {
        throw ApiError.badRequest(ageCheck);
      }
      const parsed = calculateTeacherAge(data.dob);
      if (parsed) {
        data.age = parsed.age;
      }
    }

    if (data.appointmentDate !== undefined) {
      const existing = await Teacher.findById(id).lean();
      const apptCheck = validateTeacherAppointmentDate(data.appointmentDate, data.dob || existing?.dob);
      if (apptCheck !== true) {
        throw ApiError.badRequest(apptCheck);
      }
    }

    if (data.penNumber && !data.pen) {
      data.pen = data.penNumber.replace(/^PEN-?/i, "");
    } else if (data.pen && !data.penNumber) {
      data.penNumber = data.pen.startsWith("PEN-") ? data.pen : `PEN-${data.pen}`;
    }

    if (data.email) {
      data.email = data.email.trim().toLowerCase();
      const existing = await Teacher.findOne({
        email: data.email,
        _id: { $ne: id },
      });
      if (existing) {
        throw ApiError.conflict("Another teacher already holds this email address.");
      }
    }

    const updated = await Teacher.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw ApiError.notFound("Teacher profile not found.");
    }

    return updated;
  }

  /**
   * Soft delete teacher by ID (moves to trash, deactivates associated account)
   */
  static async deleteTeacher(id, deletedBy = null) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid teacher ID format.");
    }
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      throw ApiError.notFound("Teacher record not found.");
    }
    await teacher.softDelete(deletedBy);

    // Deactivate and soft-delete linked user account if exists
    if (teacher.userId) {
      const user = await User.findById(teacher.userId).setOptions({ includeDeleted: true });
      if (user) {
        user.isDeleted = true;
        user.isActive = false;
        user.deletedAt = new Date();
        if (deletedBy) user.deletedBy = deletedBy;
        await user.save();
      }
    } else if (teacher.email) {
      const user = await User.findOne({ email: teacher.email.toLowerCase() }).setOptions({ includeDeleted: true });
      if (user) {
        user.isDeleted = true;
        user.isActive = false;
        user.deletedAt = new Date();
        if (deletedBy) user.deletedBy = deletedBy;
        await user.save();
      }
    }

    return teacher;
  }

  /**
   * Restore soft-deleted teacher by ID
   */
  static async restoreTeacher(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid teacher ID format.");
    }
    const teacher = await Teacher.findOne({ _id: id, isDeleted: true });
    if (!teacher) {
      throw ApiError.notFound("Deleted teacher record not found in trash.");
    }
    await teacher.restore();

    // Re-activate and restore linked user account if exists
    if (teacher.userId) {
      const user = await User.findOne({ _id: teacher.userId, isDeleted: true });
      if (user) {
        user.isDeleted = false;
        user.isActive = true;
        user.deletedAt = null;
        user.deletedBy = null;
        await user.save();
      }
    } else if (teacher.email) {
      const user = await User.findOne({ email: teacher.email.toLowerCase(), isDeleted: true });
      if (user) {
        user.isDeleted = false;
        user.isActive = true;
        user.deletedAt = null;
        user.deletedBy = null;
        await user.save();
      }
    }

    return teacher;
  }

  /**
   * Get teacher's weekly subject & period allotment schedule
   */

  static async getTeacherProfile(email, userId) {
    let teacher = null;
    if (email) {
      teacher = await Teacher.findOne({ email: email.toLowerCase().trim() }).lean();
    }
    if (!teacher && userId) {
      teacher = await Teacher.findOne({ userId }).lean();
    }
    if (!teacher) {
      teacher = await Teacher.findOne({}).sort({ createdAt: 1 }).lean();
    }

    if (teacher) {
      const norm = normalizeClassDivision(teacher.assignedClass);
      const isAdmissionAdminActive = isTeacherActiveAdmissionAdmin(teacher);
      teacher = {
        ...teacher,
        isAdmissionAdminActive,
        assignedClass: norm ? norm.name : (teacher.assignedClass || "Class 10-A"),
        mentorClass: norm ? norm.id : (teacher.mentorClass || "10-A"),
      };
    }

    return teacher;
  }

  /**
   * Update teacher temporary student admission admin delegation
   */

  static async changeTeacherPassword({ userId, currentPassword, newPassword, confirmPassword }) {
    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest("Current password and new custom password are required.");
    }
    if (newPassword.length < 6) {
      throw ApiError.badRequest("New password must be at least 6 characters long.");
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      throw ApiError.badRequest("New password and confirm password do not match.");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("Teacher account not found.");
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw ApiError.badRequest("Current password is incorrect. Please enter your valid current password.");
    }

    // Update with new customized password
    user.password = newPassword;
    await user.save();

    return {
      message: "Password changed successfully! You can now use your custom password to sign in.",
    };
  }

  /**
   * Purge all teacher records and accounts permanently
   */
  static async purgeAllTeachers() {
    const Teacher = (await import("../models/Teacher.js")).default;
    const User = (await import("../models/user.js")).default;
    const teacherRes = await Teacher.deleteMany({});
    const userRes = await User.deleteMany({
      $or: [
        { role: "teacher" },
        {
          email: {
            $in: [
              "kathalanx@gmail.com",
              "priyanair@ghss.edu",
              "teacher@ghss.edu",
            ],
          },
        },
      ],
    });
    return {
      deletedTeachers: teacherRes.deletedCount,
      deletedAccounts: userRes.deletedCount,
    };
  }
}

export default TeacherCrudService;
