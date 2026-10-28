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
    console.error("❌ Email Transporter configuration error:", error.message);
  } else {
    console.log("✅ Email Transporter is ready and connected to Gmail!");
  }
});

export class EmailService {
  /**
   * Dispatches a 6-digit OTP email
   */
  static async sendPasswordResetOtp(toEmail, otp) {
    const mailOptions = {
      from: `"Campus Gateway" <${emailUser}>`,
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
          <p style="color: #64748b; font-size: 12px;">This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
        </div>
      `,
    };

    return transporter.sendMail(mailOptions);
  }
}