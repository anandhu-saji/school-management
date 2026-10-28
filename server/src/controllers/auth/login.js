import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../../models/user.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Standard Email/Password Login
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Check account lockout (5 failed attempts)
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const remainingMinutes = Math.ceil(
        (new Date(user.lockUntil).getTime() - Date.now()) / (60 * 1000)
      );
      return res.status(403).json({
        success: false,
        message: `Account is temporarily locked. Try again in ${remainingMinutes} minutes.`,
      });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const attempts = (user.loginAttempts || 0) + 1;
      const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await User.findByIdAndUpdate(user._id, {
        $set: {
          loginAttempts: attempts,
          lockUntil: lockUntil,
        },
      });

      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Reset login attempts on successful sign-in
    await User.findByIdAndUpdate(user._id, {
      $set: {
        loginAttempts: 0,
        lockUntil: null,
      },
    });

    const jwtSecret = process.env.JWT_SECRET || "fallback_portal_secret_key_2026";
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role || "student",
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        _id: user._id,
        name: user.name || user.email.split("@")[0],
        email: user.email,
        role: user.role || "student",
      },
    });
  } catch (error) {
    console.error("Login Error Details:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error during login.",
    });
  }
};

/**
 * Google OAuth Login
 * POST /api/auth/google
 */
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential token is missing.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    const cleanEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      user = await User.create({
        name: name || cleanEmail.split("@")[0],
        email: cleanEmail,
        avatarUrl: picture,
        role: "student",
        loginAttempts: 0,
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "fallback_portal_secret_key_2026";
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role || "student",
      },
      jwtSecret,
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
    console.error("Google Auth Error:", error);
    return res.status(401).json({
      success: false,
      message: error.message || "Google authentication failed.",
    });
  }
};