import nodemailer from "nodemailer";

const emailUser = (process.env.EMAIL_USER || "").trim();
const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "").trim();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("[Error] Email Transporter configuration error:", error.message);
  } else {
    console.log("[OK] Email Transporter is ready and connected to Gmail!");
  }
});

export class EmailService {
  /**
   * Dispatches a 6-digit OTP email for password reset
   */
  static async sendPasswordResetOtp(toEmail, otp) {
    const mailOptions = {
      from: `"Campus Gateway" <${emailUser || "no-reply@ghssrajakkad.org"}>`,
      to: toEmail,
      subject: "Campus Gateway - Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 460px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #071a33; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">
            Use the verification code below to reset your account password:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1c385f; background: #eef3ff; padding: 12px 28px; border-radius: 8px;">
              ${otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 12px;">This code expires in 5 minutes. If you did not request this, you can ignore this email.</p>
        </div>
      `,
    };

    console.log(`[EmailService] Password Reset OTP for ${toEmail}: ${otp}`);

    if (!emailUser || !emailPass) {
      console.warn("[EmailService] EMAIL_USER/EMAIL_PASS not configured. OTP logged to console.");
      return { messageId: "dev-mock-id", accepted: [toEmail] };
    }

    try {
      return await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error("[EmailService] Failed to send email via SMTP, falling back to console log:", err.message);
      return { messageId: "dev-fallback-id", accepted: [toEmail] };
    }
  }

  /**
   * Dispatches a 6-digit OTP email for user registration / admission verification
   */
  static async sendRegistrationVerificationOtp(toEmail, otp, purpose = "general") {
    const isTeacher = purpose === "teacher_registration";
    const title = isTeacher
      ? "Faculty Onboarding Verification"
      : "Student Admission Email Verification";
    const roleText = isTeacher ? "faculty member" : "student scholar";

    const mailOptions = {
      from: `"Campus Gateway" <${emailUser || "no-reply@ghssrajakkad.org"}>`,
      to: toEmail,
      subject: `Campus Gateway - ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="border-bottom: 2px solid #1c385f; padding-bottom: 12px; margin-bottom: 16px;">
            <h3 style="margin: 0; color: #1c385f; font-size: 16px;">GOVERNMENT HIGHER SECONDARY SCHOOL, RAJAKKAD</h3>
            <p style="margin: 2px 0 0; color: #64748b; font-size: 11px;">Official Academic &amp; Institutional Registry</p>
          </div>
          <h2 style="color: #071a33; margin-top: 0; font-size: 18px;">${title}</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">
            An institutional onboarding request has been initiated for you as a <strong>${roleText}</strong>. Please use the 6-digit verification code below to verify your email address:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1c385f; background: #eef3ff; padding: 12px 28px; border-radius: 8px; border: 1px solid #c7d7fe;">
              ${otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 12px;">This verification code expires in 5 minutes. If this admission/registration was not requested by you, please report to the school administration desk immediately.</p>
        </div>
      `,
    };

    console.log(`[EmailService] Registration OTP for ${toEmail} (${purpose}): ${otp}`);

    if (!emailUser || !emailPass) {
      console.warn("[EmailService] EMAIL_USER/EMAIL_PASS not configured. OTP logged to console.");
      return { messageId: "dev-mock-id", accepted: [toEmail] };
    }

    try {
      return await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error("[EmailService] Failed to send email via SMTP, falling back to console log:", err.message);
      return { messageId: "dev-fallback-id", accepted: [toEmail] };
    }
  }
}

export default EmailService;
