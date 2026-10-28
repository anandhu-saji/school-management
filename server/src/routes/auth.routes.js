import { Router } from "express";
import { login, googleLogin } from "../controllers/auth/login.js";
import {
  sendOtp,
  verifyOtp,
  resetPassword,
} from "../controllers/auth/forgotPassword.js";

const router = Router();

// Login & OAuth
router.post("/login", login);
if (googleLogin) {
  router.post("/google", googleLogin);
}

// Password Recovery Flow
router.post("/forgot-password", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;