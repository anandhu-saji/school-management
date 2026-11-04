import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Authentication Middleware
 * Validates JWT from Authorization Bearer header or HTTP-only cookies
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  let token = null;

  // 1. Check Authorization Bearer header
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } 
  // 2. Fallback to cookie-parser
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 3. Fallback to token query param (e.g. for direct document downloads/previews)
  else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    throw ApiError.unauthorized("Access denied. Authentication token missing.");
  }

  // 3. Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_portal_secret_key_2026");
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const expiredErr = new ApiError(401, "Session expired. Please log in again.");
      expiredErr.isExpired = true;
      throw expiredErr;
    }
    throw ApiError.unauthorized("Invalid authentication token.");
  }

  // 4. Verify user exists in database
  const user = await User.findById(decoded._id).select("-password");
  if (!user) {
    throw ApiError.unauthorized("User session is invalid. Account not found.");
  }

  // Attach user to request context
  req.user = user;
  next();
});

export default authenticate;
