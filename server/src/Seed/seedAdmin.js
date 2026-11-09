import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/user.js";

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@ghss.edu";
    const adminPassword = "Admin@12345";
    const adminName = "Super Admin";

    let user = await User.findOne({ email: adminEmail });

    if (user) {
      user.role = "admin";
      user.name = adminName;
      user.username = adminName;
      user.password = adminPassword; // Triggers pre-save bcrypt hook
      user.isActive = true;
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
      console.log(`[OK] Updated existing user (${adminEmail}) to ADMIN role.`);
    } else {
      user = await User.create({
        name: adminName,
        username: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        isActive: true,
      });
      console.log("[OK] Admin account created successfully!");
    }

    console.log("=========================================");
    console.log(" ADMIN LOGIN CREDENTIALS:");
    console.log(` Email    : ${adminEmail}`);
    console.log(` Password : ${adminPassword}`);
    console.log(` Role     : admin`);
    console.log("=========================================");

    process.exit(0);
  } catch (error) {
    console.error("[ERROR] Admin creation failed:", error.message);
    process.exit(1);
  }
};

createAdmin();