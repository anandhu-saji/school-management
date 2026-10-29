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
        isLocked: true, // <-- MISSING PROPERTY: Allows client lockout modal to trigger
        remainingMinutes,
        message: `Account is temporarily locked. Try again in ${remainingMinutes} minutes.`,
      });
    }

    // Compare hashed password
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
        return res.status(403).json({
          success: false,
          isLocked: true, // <-- MISSING PROPERTY: Trigger lockout popup on 5th failure
          message: "You have entered wrong details 5 times. Your account has been temporarily blocked for 15 minutes.",
        });
      }

      return res.status(401).json({
        success: false,
        message: `Invalid credentials. (${5 - attempts} attempt${5 - attempts === 1 ? "" : "s"} left before lockout)`,
      });
    }

    // Reset login attempts on successful sign-in
    await User.findByIdAndUpdate(user._id, {
      $set: {
        loginAttempts: 0,
        lockUntil: null,
      },
    });

    const role = user.role === "user" ? "student" : (user.role || "student");
    const jwtSecret = process.env.JWT_SECRET || "fallback_portal_secret_key_2026";
    const expiresInMs = 7 * 24 * 60 * 60 * 1000; // 7 days

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: role,
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      expiresInMs, // <-- MISSING PROPERTY: Read by client's saveAuthSession
      user: {
        _id: user._id,
        name: user.name || user.username || user.email.split("@")[0],
        username: user.username || user.name || user.email.split("@")[0], // <-- MISSING PROPERTY
        email: user.email,
        role: role,
        avatarUrl: user.avatarUrl || null, // <-- MISSING PROPERTY
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
        username: name || cleanEmail.split("@")[0],
        email: cleanEmail,
        avatarUrl: picture, // Persist Google picture
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

    const role = user.role === "user" ? "student" : (user.role || "student");
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

    return res.status(200).json({
      success: true,
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
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(401).json({
      success: false,
      message: error.message || "Google authentication failed.",
    });
  }
};