import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../../models/user.js";
import { UserRole } from "../../constants/enums.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: "Google credential token is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const cleanEmail = payload.email.toLowerCase();

    // Check if account already exists
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Create user if signing in with Google for the first time
      user = await User.create({
        name: payload.name,
        email: cleanEmail,
        role: UserRole.STUDENT, // Defaults to student
        isGoogleAuth: true,
      });
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({ success: false, message: "Google authentication failed" });
  }
};