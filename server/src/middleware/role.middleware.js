import { UserRole } from "../constants/enums.js";
import { ApiError } from "../utils/ApiError.js";

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
