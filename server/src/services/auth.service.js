import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";
import { EmailService } from "./email.service.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  static async loginWithCredentials({ email, password }) {
    if (!email || !password) {
      throw ApiError.badRequest("Email and password are required.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      throw ApiError.unauthorized("Invalid credentials.");
    }

    // 1. Check account lockout
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const remainingMinutes = Math.ceil(
        (new Date(user.lockUntil).getTime() - Date.now()) / (60 * 1000)
      );
      const lockError = new ApiError(
        403,
        `Account is temporarily locked. Try again in ${remainingMinutes} minutes.`
      );
      lockError.isLocked = true;
      lockError.remainingMinutes = remainingMinutes;
      throw lockError;
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const attempts = (user.loginAttempts || 0) + 1;
      const willLock = attempts >= 5;
      const lockUntil = willLock ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await User.findByIdAndUpdate(user._id, {
        $set: {
          loginAttempts: attempts,
          lockUntil: lockUntil,
        },
      });

      if (willLock) {
        const lockError = new ApiError(
          403,
          "You have entered wrong details 5 times. Your account has been temporarily blocked for 15 minutes."
        );
        lockError.isLocked = true;
        lockError.remainingMinutes = 15;
        throw lockError;
      }

      throw ApiError.unauthorized(
        `Invalid credentials. (${5 - attempts} attempt${5 - attempts === 1 ? "" : "s"} left before lockout)`
      );
    }

    // 3. Reset failed attempts
    await User.findByIdAndUpdate(user._id, {
      $set: {
        loginAttempts: 0,
        lockUntil: null,
      },
    });

    const role = user.role === "user" ? "student" : user.role || "student";
    const jwtSecret = process.env.JWT_SECRET || "fallback_portal_secret_key_2026";
    const expiresInMs = 7 * 24 * 60 * 60 * 1000;

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: role,
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return {
      token,
      expiresInMs,
      user: {
        _id: user._id,
        name: user.name || user.username || user.email.split("@")[0],
        username: user.username || user.name || user.email.split("@")[0],
        email: user.email,
        role: role,
        avatarUrl: user.avatarUrl || null,
      },
    };
  }

  /**
   * Authenticate user with Google OAuth
   */
  static async loginWithGoogle({ credential }) {
    if (!credential) {
      throw ApiError.badRequest("Google credential token is missing.");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw ApiError.unauthorized("Invalid Google token payload.");
    }

    const { email, name, picture } = payload;
    const cleanEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      user = await User.create({
        name: name || cleanEmail.split("@")[0],
        username: name || cleanEmail.split("@")[0],
        email: cleanEmail,
        avatarUrl: picture,
        role: "student",
        isGoogleAuth: true,
        loginAttempts: 0,
      });
    } else if (picture && !user.avatarUrl) {
      await User.findByIdAndUpdate(user._id, {
        $set: { avatarUrl: picture, isGoogleAuth: true },
      });
      user.avatarUrl = picture;
    }

    const role = user.role === "user" ? "student" : user.role || "student";
    const jwtSecret = process.env.JWT_SECRET || "fallback_portal_secret_key_2026";
    const expiresInMs = 7 * 24 * 60 * 60 * 1000;

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: role,
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return {
      token,
      expiresInMs,
      user: {
        _id: user._id,
        name: user.name || user.username || cleanEmail.split("@")[0],
        username: user.username || user.name || cleanEmail.split("@")[0],
        email: user.email,
        role: role,
        avatarUrl: user.avatarUrl || picture || null,
      },
    };
  }

  /**
   * Send 6-digit OTP for password recovery
   */
  static async sendPasswordResetOtp(email) {
    if (!email) {
      throw ApiError.badRequest("Email address is required.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Return success without dispatching email to prevent account enumeration attacks
      return { email: cleanEmail };
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await User.findByIdAndUpdate(user._id, {
      $set: {
        resetPasswordOtp: otp,
        resetPasswordExpires: otpExpires,
      },
    });

    await EmailService.sendPasswordResetOtp(cleanEmail, otp);
    return { email: cleanEmail };
  }

  /**
   * Verify password recovery OTP
   */
  static async verifyPasswordResetOtp({ email, otp }) {
    if (!email || !otp) {
      throw ApiError.badRequest("Email and OTP code are required.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({
      email: cleanEmail,
      resetPasswordOtp: cleanOtp,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw ApiError.badRequest("Invalid or expired OTP code.");
    }

    return true;
  }

  /**
   * Reset user password after OTP validation
   */
  static async resetPassword({ email, otp, newPassword }) {
    if (!email || !otp || !newPassword) {
      throw ApiError.badRequest("Email, OTP, and new password are required.");
    }

    if (newPassword.length < 6) {
      throw ApiError.badRequest("Password must be at least 6 characters long.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({
      email: cleanEmail,
      resetPasswordOtp: cleanOtp,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw ApiError.badRequest("Invalid or expired OTP session.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(user._id, {
      $set: {
        password: hashedPassword,
        resetPasswordOtp: null,
        resetPasswordExpires: null,
        loginAttempts: 0,
        lockUntil: null,
      },
    });

    return true;
  }
}

export default AuthService;
