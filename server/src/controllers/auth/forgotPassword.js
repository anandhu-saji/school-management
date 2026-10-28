import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../../models/user.js";
import { EmailService } from "../../services/email.service.js";

/**
 * 1. Request Password Reset OTP (5-minute validity)
 * POST /api/auth/forgot-password
 */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account registered with this email address.",
      });
    }

    // Generate secure 6-digit OTP and set 5-minute expiry
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Direct update to prevent document validation errors
    await User.findByIdAndUpdate(user._id, {
      $set: {
        resetPasswordOtp: otp,
        resetPasswordExpires: otpExpires,
      },
    });

    // Send code via Gmail SMTP
    await EmailService.sendPasswordResetOtp(cleanEmail, otp);

    return res.status(200).json({
      success: true,
      message: "A 6-digit recovery OTP has been sent to your email.",
    });
  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to dispatch email: ${error.message}`,
    });
  }
};

/**
 * 2. Verify OTP
 * POST /api/auth/verify-otp
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP code are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({
      email: cleanEmail,
      resetPasswordOtp: cleanOtp,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP code.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify OTP.",
    });
  }
};

/**
 * 3. Reset Password
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({
      email: cleanEmail,
      resetPasswordOtp: cleanOtp,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP session.",
      });
    }

    // Hash the new password directly with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Save update while bypassing document-level schema validation
    await User.findByIdAndUpdate(user._id, {
      $set: {
        password: hashedPassword,
        resetPasswordOtp: null,
        resetPasswordExpires: null,
        loginAttempts: 0,
        lockUntil: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully. Please sign in.",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during password reset.",
    });
  }
};