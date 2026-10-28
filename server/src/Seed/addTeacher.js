const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const connectDB = require("../config/db");
const User = require("../models/user");
const Teacher = require("../models/Teacher");

const addTeacherRecord = async () => {
  try {
    await connectDB();

    const teacherAccount = {
      username: "Mrs. Priya Nair",
      email: "priyanair@ghss.edu",
      password: "Teacher@12345",
      role: "teacher",
    };

    // 1. Create or find User login account
    let user = await User.findOne({ email: teacherAccount.email });
    if (!user) {
      user = await User.create({
        username: teacherAccount.username,
        email: teacherAccount.email,
        password: teacherAccount.password,
        role: teacherAccount.role,
        isActive: true,
      });
      console.log(`Created user account for ${user.email}`);
    } else {
      user.role = "teacher";
      user.password = teacherAccount.password;
      await user.save();
      console.log(`Updated user account role to teacher for ${user.email}`);
    }

    // 2. Create or update Teacher profile document
    let profile = await Teacher.findOne({ userId: user._id });
    if (!profile) {
      profile = await Teacher.create({
        userId: user._id,
        teacherId: "GHSS-RJK-0428",
        penNumber: "PEN-984210",
        fullName: "Mrs. Priya Nair",
        designation: "HSST Malayalam",
        department: "Languages",
        mentorClass: "Class 10-A",
        phone: "+91 94470 00000",
        assignedSubjects: [
          { subjectName: "Malayalam Paper I", className: "Class 10-A" },
          { subjectName: "Malayalam Paper I", className: "Class 10-B" },
          { subjectName: "Malayalam Literature", className: "Class 9-A" },
        ],
      });
      console.log("Teacher profile data saved successfully!");
    } else {
      profile.fullName = teacherAccount.username;
      profile.mentorClass = "Class 10-A";
      await profile.save();
      console.log("Teacher profile updated.");
    }

    console.log("-----------------------------------------");
    console.log(`Email    : ${user.email}`);
    console.log(`Password : Teacher@12345`);
    console.log(`Role     : teacher`);
    console.log(`TeacherID: ${profile.teacherId}`);
    console.log(`Mentor of: ${profile.mentorClass}`);
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Error creating teacher:", error.message);
    process.exit(1);
  }
};

addTeacherRecord();