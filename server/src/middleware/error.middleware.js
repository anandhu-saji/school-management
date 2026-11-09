import { ApiError } from "../utils/ApiError.js";

/**
 * Global Enterprise Error Handling Middleware
 * Catches all operational and unexpected application errors, standardizing response envelopes.
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // 1. Handle Multer file upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    error = ApiError.badRequest("Uploaded file exceeds the maximum allowed size limit.");
  }

  // 2. Handle MongoDB Duplicate Key (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = ApiError.conflict(`A record with this ${field} already exists in the registry.`);
  }

  // 3. Handle Mongoose Invalid ObjectId CastError
  if (err.name === "CastError") {
    error = ApiError.badRequest(`Invalid identifier format for '${err.path}': ${err.value}`);
  }

  // 4. Handle Mongoose Schema ValidationError
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    error = ApiError.badRequest(messages.join("; ") || "Database schema validation error");
  }

  // 5. Handle JWT Errors
  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Session expired. Please log in again.");
    error.isExpired = true;
  } else if (err.name === "JsonWebTokenError") {
    error = ApiError.unauthorized("Invalid authentication token. Please re-authenticate.");
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error occurred.";

  if (statusCode >= 500) {
    console.error("[Internal Server Error]:", err.stack || err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(error.isLocked && { isLocked: true, remainingMinutes: error.remainingMinutes }),
    ...(error.isExpired && { isExpired: true }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
