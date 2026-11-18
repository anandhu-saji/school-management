import { UserRole } from "../constants/enums.js";
import { ApiError } from "../utils/ApiError.js";
import Teacher from "../models/Teacher.js";

/**
 * Checks whether a teacher currently holds active temporary admission admin privileges
 */
export const isTeacherActiveAdmissionAdmin = (teacher) => {
  if (!teacher || !teacher.isAdmissionAdmin) return false;
  const now = new Date();

  // If start date is configured, must have reached it
  if (teacher.admissionAdminStartDate) {
    const start = new Date(teacher.admissionAdminStartDate);
    start.setHours(0, 0, 0, 0);
    if (now < start) return false;
  }

  // If end date is configured, must not have passed end of that day
  if (teacher.admissionAdminEndDate) {
    const end = new Date(teacher.admissionAdminEndDate);
    end.setHours(23, 59, 59, 999);
    if (now > end) return false;
  }

  return true;
};

/**
 * Authorization Middleware: Allows Chief Admin OR Teachers with active temporary admission privileges
 */
export const requireAdminOrAdmissionOfficer = async (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized("Unauthorized request. Please log in first."));
  }

  // 1. Headmaster / Chief Admin has full rights
  if (req.user.role === UserRole.ADMIN) {
    return next();
  }

  // 2. Check if user is a Teacher with active admission admin delegation
  if (req.user.role === UserRole.TEACHER) {
    try {
      const email = req.user.email?.toLowerCase()?.trim();
      const teacher = await Teacher.findOne({
        $or: [{ userId: req.user._id }, ...(email ? [{ email }] : [])],
      });

      if (teacher && isTeacherActiveAdmissionAdmin(teacher)) {
        req.teacher = teacher;
        req.isAdmissionAdmin = true;
        return next();
      }

      return next(
        ApiError.forbidden(
          "Forbidden. Your temporary student admission administration window is currently inactive or has expired. Please contact the Headmaster."
        )
      );
    } catch (err) {
      return next(err);
    }
  }

  return next(
    ApiError.forbidden(
      `Forbidden. Role '${req.user.role}' does not have permission to manage student admissions.`
    )
  );
};

/**
 * Role Authorization Middleware Factory
 * Usage: authorizeRoles(UserRole.TEACHER, UserRole.ADMIN)
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Unauthorized request. Please log in first."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Forbidden. Role '${req.user.role}' does not have permission to access this resource.`
        )
      );
    }

    next();
  };
};

export const requireTeacher = authorizeRoles(UserRole.TEACHER, UserRole.ADMIN);
export const requireStudent = authorizeRoles(UserRole.STUDENT, UserRole.ADMIN);
export const requireAdmin = authorizeRoles(UserRole.ADMIN);
