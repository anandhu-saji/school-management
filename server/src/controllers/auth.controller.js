import { AuthService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Controller: Standard Email/Password Login
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.loginWithCredentials({ email, password });

  return ApiResponse.ok(res, {
    message: "Login successful.",
    ...result,
  });
});

/**
 * Controller: Google OAuth Login
 * POST /api/auth/google
 */
export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  const result = await AuthService.loginWithGoogle({ credential });

  return ApiResponse.ok(res, {
    message: "Google authentication successful.",
    ...result,
  });
});

/**
 * Controller: Request 6-digit OTP for password recovery
 * POST /api/auth/forgot-password
 */
export const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await AuthService.sendPasswordResetOtp(email);

  return ApiResponse.ok(res, {
    message: "A 6-digit recovery OTP has been sent to your email.",
  });
});

/**
 * Controller: Verify password recovery OTP
 * POST /api/auth/verify-otp
 */
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  await AuthService.verifyPasswordResetOtp({ email, otp });

  return ApiResponse.ok(res, {
    message: "OTP verified successfully.",
  });
});

/**
 * Controller: Reset user password after OTP verification
 * POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await AuthService.resetPassword({ email, otp, newPassword });

  return ApiResponse.ok(res, {
    message: "Password has been reset successfully. Please sign in.",
  });
});
