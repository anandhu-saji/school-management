import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/user.js";

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || "sajianandhu043@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
    const adminName = process.env.ADMIN_NAME || "Headmaster";
    const adminUsername = process.env.ADMIN_USERNAME || "admin_hm";

    let user = await User.findOne({ email: adminEmail });

    if (user) {
      user.role = "admin";
      user.name = adminName;
      user.username = adminUsername;
      user.password = adminPassword; // Triggers pre-save bcrypt hook
      user.isActive = true;
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
      console.log(`[OK] Updated existing user (${adminEmail}) to ADMIN (HM) role.`);
    } else {
      user = await User.create({
        name: adminName,
        username: adminUsername,
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        isActive: true,
      });
      console.log("[OK] Admin (HM) account created successfully!");
    }

    console.log("=========================================");
    console.log(" ADMIN (HM) LOGIN CREDENTIALS:");
    console.log(` Email    : ${adminEmail}`);
    console.log(` Password : ${adminPassword}`);
    console.log(` Role     : admin (Headmaster)`);
    console.log(` Name     : ${adminName}`);
    console.log("=========================================");

    process.exit(0);
  } catch (error) {
    console.error("[ERROR] Admin creation failed:", error.message);
    process.exit(1);
  }
};

createAdmin();
