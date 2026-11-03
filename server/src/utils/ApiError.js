/**
 * Custom Operational API Error Class
 * Formats errors with HTTP status codes and optional structured field validation details.
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = [], isOperational = true, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = "Bad request", errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Unauthorized access", errors = []) {
    return new ApiError(401, message, errors);
  }

  static forbidden(message = "Forbidden resource", errors = []) {
    return new ApiError(403, message, errors);
  }

  static notFound(message = "Resource not found", errors = []) {
    return new ApiError(404, message, errors);
  }

  static conflict(message = "Resource conflict", errors = []) {
    return new ApiError(409, message, errors);
  }

  static internal(message = "Internal server error occurred", errors = []) {
    return new ApiError(500, message, errors, false);
  }
}

export default ApiError;
