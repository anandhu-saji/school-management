import { Router } from "express";
import {
  login,
  googleLogin,
  sendOtp,
  verifyOtp,
  resetPassword,
  sendRegistrationOtp,
  verifyRegistrationOtp,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";

const router = Router();

// Authentication
router.post("/login", validate(loginSchema), login);
router.post("/google", googleLogin);

// Password Recovery Flow
router.post("/forgot-password", validate(forgotPasswordSchema), sendOtp);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

// New User Onboarding Verification (Student & Teacher)
router.post("/send-registration-otp", sendRegistrationOtp);
router.post("/verify-registration-otp", verifyRegistrationOtp);

export default router;
