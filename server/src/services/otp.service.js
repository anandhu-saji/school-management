import crypto from "crypto";
import EmailVerification from "../models/EmailVerification.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import { EmailService } from "./email.service.js";
import { ApiError } from "../utils/ApiError.js";

export class OtpService {
  /**
   * Send 6-digit OTP for email verification
   */
  static async sendRegistrationOtp({ email, purpose = "general" }) {
    if (!email || !email.trim()) {
      throw ApiError.badRequest("Valid email address is required.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw ApiError.badRequest("Invalid email address format.");
    }

    // Check if email already belongs to an existing student or teacher
    if (purpose === "student_admission") {
      const existingStudent = await Student.findOne({ email: cleanEmail });
      if (existingStudent) {
        throw ApiError.conflict(
          `A student is already registered with email "${cleanEmail}" (${existingStudent.name}).`
        );
      }
    } else if (purpose === "teacher_registration") {
      const existingTeacher = await Teacher.findOne({ email: cleanEmail });
      if (existingTeacher) {
        throw ApiError.conflict(
          `A teacher is already registered with email "${cleanEmail}" (${existingTeacher.name}).`
        );
      }
    }

    // Generate 6-digit cryptographically secure OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store or update in EmailVerification collection
    await EmailVerification.findOneAndUpdate(
      { email: cleanEmail, purpose },
      {
        otp,
        isVerified: false,
        expiresAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send email
    await EmailService.sendRegistrationVerificationOtp(cleanEmail, otp, purpose);

    return {
      email: cleanEmail,
      purpose,
      expiresInSeconds: 300,
      devOtp: otp,
    };
  }

  /**
   * Verify the 6-digit OTP
   */
  static async verifyRegistrationOtp({ email, otp, purpose = "general" }) {
    if (!email || !otp) {
      throw ApiError.badRequest("Email and 6-digit OTP code are required.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const record = await EmailVerification.findOne({
      email: cleanEmail,
      purpose,
      otp: cleanOtp,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      throw ApiError.badRequest("Invalid or expired verification code.");
    }

    record.isVerified = true;
    await record.save();

    return {
      email: cleanEmail,
      verified: true,
      message: "Email verified successfully.",
    };
  }

  /**
   * Check if an email has been verified for a purpose
   */
  static async isEmailVerified({ email, purpose }) {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();
    const record = await EmailVerification.findOne({
      email: cleanEmail,
      purpose,
      isVerified: true,
    });
    return Boolean(record);
  }

  /**
   * Consume / remove verification token once entity is created
   */
  static async consumeVerification({ email, purpose }) {
    if (!email) return;
    const cleanEmail = email.trim().toLowerCase();
    await EmailVerification.deleteMany({ email: cleanEmail, purpose });
  }
}

export default OtpService;
