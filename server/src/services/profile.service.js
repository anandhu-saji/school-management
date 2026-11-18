import User from "../models/user.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import ProfileUpdateRequest from "../models/ProfileUpdateRequest.js";
import Notification from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";

export class ProfileService {
  /**
   * Get current user's full profile according to their role
   */
  static async getProfile(userId) {
    const user = await User.findById(userId).select("-password").lean();
    if (!user) {
      throw ApiError.notFound("User not found.");
    }

    const email = user.email?.toLowerCase()?.trim();
    const role = user.role === "user" ? "student" : user.role || "student";

    let roleData = null;
    let identifier = "";
    let division = "";

    if (role === "student") {
      let student = await Student.findOne({
        $or: [{ userId }, ...(email ? [{ email }] : [])],
      }).lean();

      if (!student) {
        // Fallback create basic student if missing
        student = await Student.create({
          userId,
          name: user.name || email?.split("@")[0] || "Student",
          email: user.email,
          rollNumber: 1,
          admissionNumber: `ADM-${Math.floor(10000 + Math.random() * 90000)}`,
          classDivision: "Class 10-A",
          gender: "Male",
        });
        student = student.toObject();
      }

      roleData = student;
      identifier = student.admissionNumber || student.sampoornaId || "";
      division = student.classDivision || student.division || "Class 10-A";
    } else if (role === "teacher") {
      let teacher = await Teacher.findOne({
        $or: [{ userId }, ...(email ? [{ email }] : [])],
      }).lean();

      if (!teacher) {
        teacher = await Teacher.create({
          userId,
          name: user.name || "Teacher Faculty",
          email: user.email,
          penNumber: `PEN-${Math.floor(100000 + Math.random() * 900000)}`,
          department: "General",
          designation: "HSST",
          assignedClass: "Class 10-A",
        });
        teacher = teacher.toObject();
      }

      roleData = teacher;
      identifier = teacher.penNumber || teacher.pen || "";
      division = teacher.assignedClass || "";
    } else if (role === "admin") {
      roleData = {
        designation: "Headmaster / Chief Admin",
        schoolName: "GHSS Rajakkad",
        schoolCode: "06042",
        phone: user.phone || "+91 94470 00000",
      };
      identifier = "HM-06042";
    }

    // Fetch any active pending update request for this user
    const pendingRequest = await ProfileUpdateRequest.findOne({
      userId,
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch recent notifications for this user
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    return {
      user: {
        _id: user._id,
        name: user.name || user.username || "",
        email: user.email,
        role,
        avatarUrl: roleData?.avatarUrl || user.avatarUrl || null,
        phone: roleData?.phone || roleData?.parentContact || user.phone || "",
      },
      roleData,
      identifier,
      division,
      pendingRequest,
      notifications,
    };
  }

  /**
   * Update profile.
   * If role is admin: direct update.
   * If role is teacher/student:
   *   - If only avatarUrl changed: direct update.
   *   - If data fields changed: create a ProfileUpdateRequest for admin approval.
   */
  static async requestProfileUpdate(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found.");
    }

    const email = user.email?.toLowerCase()?.trim();
    const role = user.role === "user" ? "student" : user.role || "student";

    // 1. If Admin: Update directly
    if (role === "admin") {
      if (updateData.name) user.name = updateData.name.trim();
      if (updateData.phone) user.phone = updateData.phone.trim();
      if (updateData.avatarUrl) user.avatarUrl = updateData.avatarUrl;
      await user.save();

      return {
        isDirectUpdate: true,
        message: "Headmaster admin profile updated successfully.",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      };
    }

    // 2. For Teacher / Student:
    let currentDoc = null;
    let identifier = "";
    let division = "";

    if (role === "student") {
      currentDoc = await Student.findOne({
        $or: [{ userId }, ...(email ? [{ email }] : [])],
      });
      if (currentDoc) {
        identifier = currentDoc.admissionNumber || currentDoc.sampoornaId || "";
        division = currentDoc.classDivision || currentDoc.division || "";
      }
    } else if (role === "teacher") {
      currentDoc = await Teacher.findOne({
        $or: [{ userId }, ...(email ? [{ email }] : [])],
      });
      if (currentDoc) {
        identifier = currentDoc.penNumber || currentDoc.pen || "";
        division = currentDoc.assignedClass || "";
      }
    }

    // Check what fields changed (excluding avatarUrl which is handled directly)
    const currentSnapshot = {};
    const requestedChanges = {};

    const allowedFields =
      role === "student"
        ? [
            "name",
            "phone",
            "parentContact",
            "altContact",
            "guardian",
            "guardianRelation",
            "gender",
            "dob",
            "bloodGroup",
            "religion",
            "caste",
            "houseName",
            "street",
            "postOffice",
            "city",
            "district",
            "state",
            "pincode",
          ]
        : [
            "name",
            "phone",
            "gender",
            "dob",
            "qualification",
            "department",
          ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        const newVal = String(updateData[field]).trim();
        const oldVal = currentDoc ? String(currentDoc[field] || "").trim() : "";

        if (newVal !== oldVal) {
          currentSnapshot[field] = oldVal;
          requestedChanges[field] = newVal;
        }
      }
    }

    if (Object.keys(requestedChanges).length === 0) {
      return {
        isDirectUpdate: true,
        message: "No profile details were changed.",
      };
    }

    // Check if there is already a pending request
    let existingRequest = await ProfileUpdateRequest.findOne({
      userId,
      status: "pending",
    });

    if (existingRequest) {
      // Merge changes into existing pending request
      existingRequest.requestedChanges = {
        ...existingRequest.requestedChanges,
        ...requestedChanges,
      };
      existingRequest.currentData = {
        ...currentSnapshot,
        ...existingRequest.currentData,
      };
      await existingRequest.save();

      return {
        isDirectUpdate: false,
        isPending: true,
        message:
          "Your profile change request has been updated and is awaiting admin approval.",
        request: existingRequest,
      };
    }

    // Create new ProfileUpdateRequest
    const newRequest = await ProfileUpdateRequest.create({
      userId,
      userRole: role,
      userName: user.name || currentDoc?.name || "User",
      userEmail: user.email,
      identifier,
      division,
      currentData: currentSnapshot,
      requestedChanges,
      status: "pending",
    });

    return {
      isDirectUpdate: false,
      isPending: true,
      message:
        "Your profile change request has been submitted to the admin side. Once accepted, your details will be updated.",
      request: newRequest,
    };
  }

  /**
   * Fetch all profile update requests for admin review
   */
  static async getAdminRequests({ status, role, search } = {}) {
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (role && role !== "all") {
      filter.userRole = role;
    }
    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { userName: { $regex: q, $options: "i" } },
        { userEmail: { $regex: q, $options: "i" } },
        { identifier: { $regex: q, $options: "i" } },
        { division: { $regex: q, $options: "i" } },
      ];
    }

    const requests = await ProfileUpdateRequest.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const pendingCount = await ProfileUpdateRequest.countDocuments({
      status: "pending",
    });

    return { requests, pendingCount };
  }

  /**
   * Admin approves a profile update request
   */
  static async approveRequest(requestId, adminUserId) {
    const request = await ProfileUpdateRequest.findById(requestId);
    if (!request) {
      throw ApiError.notFound("Profile update request not found.");
    }

    if (request.status !== "pending") {
      throw ApiError.badRequest(
        `This request has already been ${request.status}.`
      );
    }

    const { userId, userRole, requestedChanges, userEmail } = request;

    // Apply changes to corresponding model
    if (userRole === "student") {
      const student = await Student.findOne({
        $or: [{ userId }, ...(userEmail ? [{ email: userEmail }] : [])],
      });

      if (student) {
        Object.keys(requestedChanges).forEach((key) => {
          student[key] = requestedChanges[key];
        });
        await student.save();
      }

      // Also update User name/phone if present
      if (requestedChanges.name || requestedChanges.phone) {
        await User.findByIdAndUpdate(userId, {
          ...(requestedChanges.name && { name: requestedChanges.name }),
          ...(requestedChanges.phone && { phone: requestedChanges.phone }),
        });
      }
    } else if (userRole === "teacher") {
      const teacher = await Teacher.findOne({
        $or: [{ userId }, ...(userEmail ? [{ email: userEmail }] : [])],
      });

      if (teacher) {
        Object.keys(requestedChanges).forEach((key) => {
          teacher[key] = requestedChanges[key];
        });
        await teacher.save();
      }

      if (requestedChanges.name || requestedChanges.phone) {
        await User.findByIdAndUpdate(userId, {
          ...(requestedChanges.name && { name: requestedChanges.name }),
          ...(requestedChanges.phone && { phone: requestedChanges.phone }),
        });
      }
    }

    request.status = "approved";
    request.reviewedBy = adminUserId;
    request.reviewedAt = new Date();
    await request.save();

    // Create success notification for user
    await Notification.create({
      userId,
      title: "Profile Update Approved",
      message:
        "Your profile update request has been approved by the Administration. Your records have been updated.",
      type: "success",
      requestId: request._id,
    });

    return {
      message: "Profile update request has been approved and applied.",
      request,
    };
  }

  /**
   * Admin rejects a profile update request
   */
  static async rejectRequest(requestId, adminUserId, remark = "") {
    const request = await ProfileUpdateRequest.findById(requestId);
    if (!request) {
      throw ApiError.notFound("Profile update request not found.");
    }

    if (request.status !== "pending") {
      throw ApiError.badRequest(
        `This request has already been ${request.status}.`
      );
    }

    request.status = "rejected";
    request.adminRemark = remark ? remark.trim() : "";
    request.reviewedBy = adminUserId;
    request.reviewedAt = new Date();
    await request.save();

    // User exact requirement: "Your request is rejected."
    const notifMessage = remark
      ? `Your request is rejected. Reason: ${remark.trim()}`
      : "Your request is rejected.";

    await Notification.create({
      userId: request.userId,
      title: "Profile Update Request",
      message: notifMessage,
      type: "error",
      requestId: request._id,
    });

    return {
      message: "Profile update request has been rejected.",
      request,
    };
  }

  /**
   * Get notifications for a user
   */
  static async getNotifications(userId) {
    return Notification.find({ userId }).sort({ createdAt: -1 }).limit(20).lean();
  }

  /**
   * Mark notification as read
   */
  static async markNotificationRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
  }

  /**
   * Delete / dismiss notification
   */
  static async deleteNotification(notificationId, userId) {
    return Notification.findOneAndDelete({ _id: notificationId, userId });
  }
}

export default ProfileService;
