import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/ghss_student_portal?replicaSet=rs0";

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // 1. Clean existing records for this division
    await Student.deleteMany({ classDivision: "Class 10-A" });
    await Teacher.deleteMany({ email: "kathalanx@gmail.com" });

    // 2. Ensure Teacher User Account Exists
    const hashedPassword = await bcrypt.hash("Teacher@123", 10);
    let teacherUser = await User.findOne({ email: "kathalanx@gmail.com" });

    if (!teacherUser) {
      teacherUser = await User.create({
        name: "Indu B Nair",
        email: "kathalanx@gmail.com",
        password: hashedPassword,
        role: "teacher",
      });
    }

    // 3. Link Teacher Profile to Class 10-A
    await Teacher.create({
      userId: teacherUser._id,
      name: "Indu B Nair",
      email: "kathalanx@gmail.com",
      assignedClass: "Class 10-A",
      department: "Mathematics",
      phone: "+91 98470 12345",
    });

    console.log("✅ Teacher Indu B Nair assigned to Class 10-A");

    // 4. Exact 20 Students for Class 10-A
    const studentsData = [
      { rollNumber: 1, name: "Aaron Biju", gender: "Male", monthlyLeavesTaken: 0 },
      { rollNumber: 2, name: "Anandhu Saji", gender: "Male", monthlyLeavesTaken: 1 },
      { rollNumber: 3, name: "Aswin Shiju", gender: "Male", monthlyLeavesTaken: 0 },
      { rollNumber: 4, name: "Basil Jomon", gender: "Male", monthlyLeavesTaken: 2 },
      { rollNumber: 5, name: "Ben Subash", gender: "Male", monthlyLeavesTaken: 0 },
      { rollNumber: 6, name: "Benidict James", gender: "Male", monthlyLeavesTaken: 1 },
      { rollNumber: 7, name: "Domenic James", gender: "Male", monthlyLeavesTaken: 0 },
      { rollNumber: 8, name: "Emmanual Binoy", gender: "Male", monthlyLeavesTaken: 0 },
      { rollNumber: 9, name: "Thomaskutty A", gender: "Male", monthlyLeavesTaken: 3 }, // quota exhausted test
      { rollNumber: 10, name: "R Balagopal", gender: "Male", monthlyLeavesTaken: 0 },
      { rollNumber: 11, name: "Ashna Joshi", gender: "Female", monthlyLeavesTaken: 1 },
      { rollNumber: 12, name: "Aswani Biju", gender: "Female", monthlyLeavesTaken: 0 },
      { rollNumber: 13, name: "Aswathi Baby", gender: "Female", monthlyLeavesTaken: 2 },
      { rollNumber: 14, name: "Devika PT", gender: "Female", monthlyLeavesTaken: 0 },
      { rollNumber: 15, name: "Jewal Joby", gender: "Female", monthlyLeavesTaken: 0 },
      { rollNumber: 16, name: "Krishnendhu B", gender: "Female", monthlyLeavesTaken: 1 },
      { rollNumber: 17, name: "Sadhika Santhosh", gender: "Female", monthlyLeavesTaken: 0 },
      { rollNumber: 18, name: "Sneha Ciby", gender: "Female", monthlyLeavesTaken: 0 },
      { rollNumber: 19, name: "Sandra Sajesh", gender: "Female", monthlyLeavesTaken: 1 },
      { rollNumber: 20, name: "Sithara Pathpanabhan", gender: "Female", monthlyLeavesTaken: 0 },
    ].map((student) => ({
      ...student,
      admissionNumber: `ADM-2026-${100 + student.rollNumber}`,
      classDivision: "Class 10-A",
      parentContact: `+91 94471 ${String(11000 + student.rollNumber)}`,
    }));

    await Student.insertMany(studentsData);
    console.log(`✅ ${studentsData.length} students seeded successfully for Class 10-A.`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();