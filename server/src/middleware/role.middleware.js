import { UserRole } from "../constants/enums.js";

/**
 * Role Authorization Middleware
 * Usage: authorizeRoles(UserRole.TEACHER, UserRole.ADMIN)
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request. Please log in first.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' does not have permission to access this resource.`,
      });
    }

    next();
  };
};

export const requireTeacher = authorizeRoles(UserRole.TEACHER, UserRole.ADMIN);
export const requireStudent = authorizeRoles(UserRole.STUDENT, UserRole.ADMIN);
export const requireAdmin = authorizeRoles(UserRole.ADMIN);