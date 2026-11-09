import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/user.js";
import Teacher from "../models/Teacher.js";

const addTeacherRecord = async () => {
  try {
    await connectDB();

    const teacherAccount = {
      name: "Mrs. Priya Nair",
      username: "Mrs. Priya Nair",
      email: "priyanair@ghss.edu",
      password: "Teacher@12345",
      role: "teacher",
    };

    // 1. Create or find User login account
    let user = await User.findOne({ email: teacherAccount.email });
    if (!user) {
      user = await User.create({
        name: teacherAccount.name,
        username: teacherAccount.username,
        email: teacherAccount.email,
        password: teacherAccount.password,
        role: "teacher",
        isActive: true,
      });
      console.log(`[OK] Created User login account for ${user.email}`);
    } else {
      user.role = "teacher";
      user.password = teacherAccount.password;
      await user.save();
      console.log(`[OK] Updated User login account for ${user.email}`);
    }

    // 2. Create or update Teacher profile document
    let profile = await Teacher.findOne({ userId: user._id });
    if (!profile) {
      profile = await Teacher.create({
        userId: user._id,
        name: teacherAccount.name,
        email: teacherAccount.email,
        department: "Languages",
        mentorClass: "Class 10-A",
        assignedClass: "Class 10-A",
        subject: "Malayalam",
        phone: "+91 94470 12345",
        isActive: true,
      });
      console.log("[OK] Teacher profile document created!");
    } else {
      profile.name = teacherAccount.name;
      profile.mentorClass = "Class 10-A";
      profile.assignedClass = "Class 10-A";
      await profile.save();
      console.log("[OK] Teacher profile document updated.");
    }

    console.log("=========================================");
    console.log(" TEACHER LOGIN CREDENTIALS:");
    console.log(` Email    : ${user.email}`);
    console.log(` Password : ${teacherAccount.password}`);
    console.log(` Role     : teacher`);
    console.log(` Mentor of: Class 10-A`);
    console.log("=========================================");

    process.exit(0);
  } catch (error) {
    console.error("[ERROR] Error seeding teacher:", error.message);
    process.exit(1);
  }
};

addTeacherRecord();