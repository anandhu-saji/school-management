/**
 * Standardized API Response Helper
 * Provides a clean and predictable JSON envelope for successful responses.
 */
export class ApiResponse {
  /**
   * Send a standard successful JSON response
   * @param {import('express').Response} res
   * @param {number} statusCode
   * @param {object|string} payload - Object to spread or message string
   */
  static send(res, statusCode = 200, payload = {}) {
    if (typeof payload === "string") {
      return res.status(statusCode).json({
        success: true,
        message: payload,
      });
    }

    return res.status(statusCode).json({
      success: true,
      ...payload,
    });
  }

  static ok(res, payload = {}) {
    return ApiResponse.send(res, 200, payload);
  }

  static created(res, payload = {}) {
    return ApiResponse.send(res, 201, payload);
  }
}

export default ApiResponse;
