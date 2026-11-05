import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import Exam from "../models/Exam.js";
import FeePayment from "../models/FeePayment.js";
import InternalMark from "../models/InternalMark.js";
import { ACADEMIC_WINGS, ALL_CLASSES } from "../utils/classData.js";
import { calculateKeralaGrade } from "../utils/gradeCalculator.js";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/ghss_student_portal?replicaSet=rs0";

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Master Seeding of all 26 Academic Divisions...");

    // -------------------------------------------------------------
    // 0. CLEAN & FIX LEGACY UNIQUE INDEXES
    // -------------------------------------------------------------
    try {
      const usersColl = mongoose.connection.collection("users");
      const userIndexes = await usersColl.indexes();
      if (userIndexes.some((idx) => idx.name === "username_1")) {
        await usersColl.dropIndex("username_1");
        console.log("ℹ️ Dropped legacy index: username_1 from users.");
      }
    } catch (e) {
      // index does not exist or already dropped
    }

    try {
      const studentsColl = mongoose.connection.collection("students");
      const studentIndexes = await studentsColl.indexes();
      for (const idx of studentIndexes) {
        if (idx.name === "email_1") {
          await studentsColl.dropIndex("email_1");
          console.log("ℹ️ Dropped non-sparse email_1 from students.");
        }
      }
      await studentsColl.createIndex({ email: 1 }, { unique: true, sparse: true });
      await studentsColl.createIndex({ admissionNumber: 1 }, { unique: true, sparse: true });
    } catch (e) {
      // fallback
    }

    try {
      const teachersColl = mongoose.connection.collection("teachers");
      const teacherIndexes = await teachersColl.indexes();
      for (const idx of teacherIndexes) {
        if (
          idx.name === "teacherId_1" ||
          (idx.name === "userId_1" && !idx.sparse) ||
          (idx.name === "email_1" && !idx.sparse) ||
          (idx.name === "pen_1" && !idx.sparse)
        ) {
          await teachersColl.dropIndex(idx.name);
          console.log(`ℹ️ Dropped index: ${idx.name} from teachers.`);
        }
      }
      await teachersColl.createIndex({ userId: 1 }, { unique: true, sparse: true });
      await teachersColl.createIndex({ email: 1 }, { unique: true, sparse: true });
      await teachersColl.createIndex({ pen: 1 }, { unique: true, sparse: true });
    } catch (e) {
      // fallback
    }

    // -------------------------------------------------------------
    // 1. ENSURE CORE AUTH USERS
    // -------------------------------------------------------------
    // 1a. Super Admin
    let adminUser = await User.findOne({ email: "admin@ghss.edu" });
    if (!adminUser) {
      adminUser = await User.create({
        name: "Headmaster Sri. K. R. Madhavan",
        username: "admin_ghss",
        email: "admin@ghss.edu",
        password: "Admin@12345",
        role: "admin",
        isActive: true,
      });
      console.log("✅ Created Admin User: admin@ghss.edu");
    }

    // 1b. Teacher User (Mrs. Indu B Nair)
    let teacherUser = await User.findOne({ email: "kathalanx@gmail.com" });
    if (!teacherUser) {
      teacherUser = await User.create({
        name: "Mrs. Indu B Nair",
        username: "indubnair",
        email: "kathalanx@gmail.com",
        password: "Teacher@123",
        role: "teacher",
        isActive: true,
      });
      console.log("✅ Created Teacher User: kathalanx@gmail.com");
    }

    // 1c. Student User (Anandhu Saji)
    let studentUser = await User.findOne({
      $or: [
        { email: "student@ghss.edu" },
        { username: "Anandhu Saji" },
        { username: "anandhusaji" },
      ],
    });
    if (!studentUser) {
      studentUser = await User.create({
        name: "Anandhu Saji",
        username: "anandhusaji",
        email: "student@ghss.edu",
        password: "Student@123",
        role: "student",
        isActive: true,
      });
      console.log("✅ Created Student User: student@ghss.edu");
    }

    // -------------------------------------------------------------
    // 2. SEED FACULTY CADRE (26 MENTORS ACROSS ALL ACADEMIC WINGS)
    // -------------------------------------------------------------
    const fullFacultyCadre = [
      // High School Mentors & Cadre
      {
        name: "Mrs. Indu B Nair",
        userId: teacherUser._id,
        email: "kathalanx@gmail.com",
        pen: "849201",
        department: "HST Mathematics",
        designation: "HST",
        assignedClass: "Class 10-A",
        mentorClass: "10-A",
        subject: "Mathematics",
        phone: "+91 94471 23450",
        periods: "24 hrs / Week",
        status: "In Class",
        qualification: "M.Sc Mathematics, B.Ed",
        appointmentDate: "01/06/2016",
        highestDegree: "Post Graduate (Master's)",
        pgDegreeName: "M.Sc Mathematics",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9901",
        panNumber: "ABCDE1234F",
      },
      {
        name: "Sri. George K.",
        email: "george.k@ghssrajakkad.kerala.gov.in",
        pen: "849202",
        department: "HST Mathematics",
        designation: "HST",
        assignedClass: "Class 10-B",
        mentorClass: "10-B",
        subject: "Mathematics",
        phone: "+91 94462 88219",
        periods: "26 hrs / Week",
        status: "Active",
        qualification: "M.Sc Mathematics, B.Ed",
        appointmentDate: "01/06/2015",
        highestDegree: "Post Graduate (Master's)",
        pgDegreeName: "M.Sc Mathematics",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9902",
        panNumber: "ABCDE1235F",
      },
      {
        name: "Smt. Bindu S.",
        email: "bindu.s@ghssrajakkad.kerala.gov.in",
        pen: "849205",
        department: "HST Physical Science",
        designation: "HST",
        assignedClass: "Class 9-A",
        mentorClass: "9-A",
        subject: "Physical Science",
        phone: "+91 98470 55123",
        periods: "22 hrs / Week + Lab",
        status: "Active",
        qualification: "M.Sc Physics, B.Ed",
        appointmentDate: "15/07/2017",
        highestDegree: "Post Graduate (Master's)",
        pgDegreeName: "M.Sc Physics",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9905",
        panNumber: "ABCDE1236F",
      },
      {
        name: "Smt. Sunitha R.",
        email: "sunitha.r@ghssrajakkad.kerala.gov.in",
        pen: "849207",
        department: "HST Natural Science",
        designation: "HST",
        assignedClass: "Class 9-B",
        mentorClass: "9-B",
        subject: "Natural Science",
        phone: "+91 98470 55199",
        periods: "24 hrs / Week",
        status: "Active",
        qualification: "M.Sc Botany, B.Ed",
        appointmentDate: "01/06/2018",
        highestDegree: "Post Graduate (Master's)",
        pgDegreeName: "M.Sc Botany",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9907",
        panNumber: "ABCDE1237F",
      },
      {
        name: "Smt. Radhakrishnan N.",
        email: "radhakrishnan.n@ghssrajakkad.kerala.gov.in",
        pen: "849214",
        department: "HST Social Science",
        designation: "HST",
        assignedClass: "Class 8-B",
        mentorClass: "8-B",
        subject: "Social Science",
        phone: "+91 94468 11902",
        periods: "22 hrs / Week",
        status: "Active",
        qualification: "M.A History, B.Ed",
        appointmentDate: "01/06/2019",
        highestDegree: "Post Graduate (Master's)",
        pgDegreeName: "M.A History",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9914",
        panNumber: "ABCDE1238F",
      },
      {
        name: "Mrs. Priya Nair",
        email: "priya.nair@ghssrajakkad.kerala.gov.in",
        pen: "849208",
        department: "HST Malayalam",
        designation: "HST",
        assignedClass: "Class 8-A",
        mentorClass: "8-A",
        subject: "Malayalam",
        phone: "+91 94471 99208",
        periods: "24 hrs / Week",
        status: "Active",
        qualification: "M.A Malayalam, B.Ed",
        appointmentDate: "01/06/2017",
        highestDegree: "Post Graduate (Master's)",
        pgDegreeName: "M.A Malayalam",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9908",
        panNumber: "ABCDE1239F",
      },

      // Higher Secondary Mentors & Cadre
      {
        name: "Sri. Suresh C. K.",
        email: "suresh.ck@ghssrajakkad.kerala.gov.in",
        pen: "849219",
        department: "HSST Chemistry",
        designation: "HSST",
        assignedClass: "Class 11-Science",
        mentorClass: "11-Science",
        subject: "Chemistry",
        phone: "+91 94956 77123",
        periods: "Practical Exam Observer",
        status: "On Duty",
        qualification: "M.Sc Chemistry, B.Ed, SET",
        appointmentDate: "02/06/2012",
        highestDegree: "Post Graduate (Master's)",
        pgDegreeName: "M.Sc Chemistry",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9919",
        panNumber: "ABCDE1240F",
      },
      {
        name: "Smt. Deepa Nair",
        email: "deepa.nair@ghssrajakkad.kerala.gov.in",
        pen: "849241",
        department: "HSST Commerce",
        designation: "HSST",
        assignedClass: "Class 11-Commerce",
        mentorClass: "11-Commerce",
        subject: "Commerce",
        phone: "+91 94956 88241",
        periods: "25 hrs / Week",
        status: "Active",
        qualification: "M.Com, B.Ed, SET",
        appointmentDate: "01/06/2015",
        highestDegree: "Post Graduate (Master's)",
        pgDegreeName: "M.Com Finance",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9941",
        panNumber: "ABCDE1241F",
      },
      {
        name: "Sri. Thomas Joseph",
        email: "thomas.joseph@ghssrajakkad.kerala.gov.in",
        pen: "849210",
        department: "HSST English",
        designation: "HSST",
        assignedClass: "Class 11-Humanities",
        mentorClass: "11-Humanities",
        subject: "English",
        phone: "+91 94951 44321",
        periods: "25 hrs / Week",
        status: "Active",
        qualification: "M.A English, B.Ed, NET",
        appointmentDate: "01/06/2014",
        highestDegree: "Post Graduate (Master's)",
        pgDegreeName: "M.A English Literature",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9910",
        panNumber: "ABCDE1242F",
      },
      {
        name: "Sri. Manoj P.",
        email: "manoj.p@ghssrajakkad.kerala.gov.in",
        pen: "849242",
        department: "HSST Physics",
        designation: "HSST",
        assignedClass: "Class 12-Science",
        mentorClass: "12-Science",
        subject: "Physics",
        phone: "+91 94956 99242",
        periods: "26 hrs / Week",
        status: "Active",
        qualification: "M.Sc Physics, B.Ed, SET",
        appointmentDate: "01/06/2013",
        highestDegree: "Post Graduate (Master's)",
        pgDegreeName: "M.Sc Physics",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9942",
        panNumber: "ABCDE1243F",
      },
      {
        name: "Smt. Kavitha R.",
        email: "kavitha.r@ghssrajakkad.kerala.gov.in",
        pen: "849243",
        department: "HSST Economics",
        designation: "HSST",
        assignedClass: "Class 12-Commerce",
        mentorClass: "12-Commerce",
        subject: "Economics",
        phone: "+91 94956 99243",
        periods: "24 hrs / Week",
        status: "Active",
        qualification: "M.A Economics, B.Ed, SET",
        appointmentDate: "01/06/2015",
        highestDegree: "Post Graduate (Master's)",
        pgDegreeName: "M.A Economics",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9943",
        panNumber: "ABCDE1244F",
      },
      {
        name: "Sri. Rajeev M.",
        email: "rajeev.m@ghssrajakkad.kerala.gov.in",
        pen: "849244",
        department: "HSST History",
        designation: "HSST",
        assignedClass: "Class 12-Humanities",
        mentorClass: "12-Humanities",
        subject: "History",
        phone: "+91 94956 99244",
        periods: "24 hrs / Week",
        status: "Active",
        qualification: "M.A History, B.Ed, NET",
        appointmentDate: "01/06/2016",
        highestDegree: "Post Graduate (Master's)",
        pgDegreeName: "M.A History",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9944",
        panNumber: "ABCDE1245F",
      },

      // Upper Primary (UPSA) Mentors & Cadre
      {
        name: "Smt. Mini V.",
        email: "mini.v@ghssrajakkad.kerala.gov.in",
        pen: "849231",
        department: "UPSA Malayalam",
        designation: "UPSA",
        assignedClass: "Class 5-A",
        mentorClass: "5-A",
        subject: "Malayalam",
        phone: "+91 94471 11231",
        periods: "25 hrs / Week",
        status: "Active",
        qualification: "B.A Malayalam, B.Ed, KTET",
        appointmentDate: "01/06/2018",
        highestDegree: "Bachelor's Degree",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9931",
        panNumber: "ABCDE1246F",
      },
      {
        name: "Sri. Rajesh Kumar",
        email: "rajesh.kumar@ghssrajakkad.kerala.gov.in",
        pen: "849232",
        department: "UPSA Mathematics",
        designation: "UPSA",
        assignedClass: "Class 5-B",
        mentorClass: "5-B",
        subject: "Mathematics",
        phone: "+91 94471 11232",
        periods: "26 hrs / Week",
        status: "Active",
        qualification: "B.Sc Mathematics, B.Ed, KTET",
        appointmentDate: "01/06/2017",
        highestDegree: "Bachelor's Degree",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9932",
        panNumber: "ABCDE1247F",
      },
      {
        name: "Smt. Sheela Thomas",
        email: "sheela.thomas@ghssrajakkad.kerala.gov.in",
        pen: "849233",
        department: "UPSA Science",
        designation: "UPSA",
        assignedClass: "Class 6-A",
        mentorClass: "6-A",
        subject: "Science",
        phone: "+91 94471 11233",
        periods: "25 hrs / Week",
        status: "Active",
        qualification: "B.Sc Chemistry, B.Ed, KTET",
        appointmentDate: "01/06/2016",
        highestDegree: "Bachelor's Degree",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9933",
        panNumber: "ABCDE1248F",
      },
      {
        name: "Sri. Deepu Varghese",
        email: "deepu.varghese@ghssrajakkad.kerala.gov.in",
        pen: "849234",
        department: "UPSA Social Science",
        designation: "UPSA",
        assignedClass: "Class 6-B",
        mentorClass: "6-B",
        subject: "Social Science",
        phone: "+91 94471 11234",
        periods: "24 hrs / Week",
        status: "Active",
        qualification: "B.A History, B.Ed, KTET",
        appointmentDate: "01/06/2019",
        highestDegree: "Bachelor's Degree",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9934",
        panNumber: "ABCDE1249F",
      },
      {
        name: "Smt. Mary K. J.",
        email: "mary.kj@ghssrajakkad.kerala.gov.in",
        pen: "849235",
        department: "UPSA English",
        designation: "UPSA",
        assignedClass: "Class 7-A",
        mentorClass: "7-A",
        subject: "English",
        phone: "+91 94471 11235",
        periods: "25 hrs / Week",
        status: "Active",
        qualification: "B.A English, B.Ed, KTET",
        appointmentDate: "01/06/2015",
        highestDegree: "Bachelor's Degree",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9935",
        panNumber: "ABCDE1250F",
      },
      {
        name: "Sri. Suresh Babu",
        email: "suresh.babu@ghssrajakkad.kerala.gov.in",
        pen: "849236",
        department: "UPSA Mathematics",
        designation: "UPSA",
        assignedClass: "Class 7-B",
        mentorClass: "7-B",
        subject: "Mathematics",
        phone: "+91 94471 11236",
        periods: "26 hrs / Week",
        status: "Active",
        qualification: "B.Sc Mathematics, B.Ed, KTET",
        appointmentDate: "01/06/2014",
        highestDegree: "Bachelor's Degree",
        hasBed: true,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9936",
        panNumber: "ABCDE1251F",
      },

      // Lower Primary (LPSA) Mentors & Cadre
      {
        name: "Smt. Beena P.",
        email: "beena.p@ghssrajakkad.kerala.gov.in",
        pen: "849221",
        department: "LPSA Primary Education",
        designation: "LPSA",
        assignedClass: "Class 1-A",
        mentorClass: "1-A",
        subject: "Primary Education",
        phone: "+91 94471 22221",
        periods: "28 hrs / Week",
        status: "Active",
        qualification: "TTC / D.El.Ed, KTET",
        appointmentDate: "01/06/2014",
        highestDegree: "D.El.Ed",
        hasBed: false,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9921",
        panNumber: "ABCDE1252F",
      },
      {
        name: "Smt. Asha Mohan",
        email: "asha.mohan@ghssrajakkad.kerala.gov.in",
        pen: "849222",
        department: "LPSA Primary Education",
        designation: "LPSA",
        assignedClass: "Class 1-B",
        mentorClass: "1-B",
        subject: "Primary Education",
        phone: "+91 94471 22222",
        periods: "28 hrs / Week",
        status: "Active",
        qualification: "TTC / D.El.Ed, KTET",
        appointmentDate: "01/06/2015",
        highestDegree: "D.El.Ed",
        hasBed: false,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9922",
        panNumber: "ABCDE1253F",
      },
      {
        name: "Smt. Sreeja K.",
        email: "sreeja.k@ghssrajakkad.kerala.gov.in",
        pen: "849223",
        department: "LPSA Primary Education",
        designation: "LPSA",
        assignedClass: "Class 2-A",
        mentorClass: "2-A",
        subject: "Primary Education",
        phone: "+91 94471 22223",
        periods: "28 hrs / Week",
        status: "Active",
        qualification: "TTC / D.El.Ed, KTET",
        appointmentDate: "01/06/2016",
        highestDegree: "D.El.Ed",
        hasBed: false,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9923",
        panNumber: "ABCDE1254F",
      },
      {
        name: "Sri. Anilkumar M.",
        email: "anilkumar.m@ghssrajakkad.kerala.gov.in",
        pen: "849224",
        department: "LPSA Primary Education",
        designation: "LPSA",
        assignedClass: "Class 2-B",
        mentorClass: "2-B",
        subject: "Primary Education",
        phone: "+91 94471 22224",
        periods: "28 hrs / Week",
        status: "Active",
        qualification: "TTC / D.El.Ed, KTET",
        appointmentDate: "01/06/2017",
        highestDegree: "D.El.Ed",
        hasBed: false,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9924",
        panNumber: "ABCDE1255F",
      },
      {
        name: "Smt. Manju R.",
        email: "manju.r@ghssrajakkad.kerala.gov.in",
        pen: "849225",
        department: "LPSA Primary Education",
        designation: "LPSA",
        assignedClass: "Class 3-A",
        mentorClass: "3-A",
        subject: "Primary Education",
        phone: "+91 94471 22225",
        periods: "28 hrs / Week",
        status: "Active",
        qualification: "TTC / D.El.Ed, KTET",
        appointmentDate: "01/06/2018",
        highestDegree: "D.El.Ed",
        hasBed: false,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9925",
        panNumber: "ABCDE1256F",
      },
      {
        name: "Smt. Rema Devi",
        email: "rema.devi@ghssrajakkad.kerala.gov.in",
        pen: "849226",
        department: "LPSA Primary Education",
        designation: "LPSA",
        assignedClass: "Class 3-B",
        mentorClass: "3-B",
        subject: "Primary Education",
        phone: "+91 94471 22226",
        periods: "28 hrs / Week",
        status: "Active",
        qualification: "TTC / D.El.Ed, KTET",
        appointmentDate: "01/06/2019",
        highestDegree: "D.El.Ed",
        hasBed: false,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9926",
        panNumber: "ABCDE1257F",
      },
      {
        name: "Sri. Shaji Mathew",
        email: "shaji.mathew@ghssrajakkad.kerala.gov.in",
        pen: "849227",
        department: "LPSA Primary Education",
        designation: "LPSA",
        assignedClass: "Class 4-A",
        mentorClass: "4-A",
        subject: "Primary Education",
        phone: "+91 94471 22227",
        periods: "28 hrs / Week",
        status: "Active",
        qualification: "TTC / D.El.Ed, KTET",
        appointmentDate: "01/06/2015",
        highestDegree: "D.El.Ed",
        hasBed: false,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9927",
        panNumber: "ABCDE1258F",
      },
      {
        name: "Smt. Latha K.",
        email: "latha.k@ghssrajakkad.kerala.gov.in",
        pen: "849228",
        department: "LPSA Primary Education",
        designation: "LPSA",
        assignedClass: "Class 4-B",
        mentorClass: "4-B",
        subject: "Primary Education",
        phone: "+91 94471 22228",
        periods: "28 hrs / Week",
        status: "Active",
        qualification: "TTC / D.El.Ed, KTET",
        appointmentDate: "01/06/2017",
        highestDegree: "D.El.Ed",
        hasBed: false,
        hasSetOrKtet: true,
        aadharNumber: "7845 1204 9928",
        panNumber: "ABCDE1259F",
      },
    ];

    for (const t of fullFacultyCadre) {
      await Teacher.findOneAndUpdate(
        { pen: t.pen },
        { $set: t },
        { upsert: true, returnDocument: "after" }
      );
    }
    console.log(`✅ Upserted ${fullFacultyCadre.length} faculty mentors across all 26 classes in MongoDB.`);

    // -------------------------------------------------------------
    // 3. SEED STUDENTS FOR ALL 26 ACADEMIC DIVISIONS
    // -------------------------------------------------------------
    // Delete existing students to ensure a fresh, calibrated roll
    await Student.deleteMany({});
    console.log("ℹ️ Cleared existing student collection for fresh multi-wing seed.");

    const sampleKeralaNames = [
      { name: "Aaditya S. Kumar", g: "Male", cat: "General", dob: "14/05/2010", p: "Santhosh Kumar K." },
      { name: "Ananya Manoj", g: "Female", cat: "OBC", dob: "22/08/2010", p: "Manoj Varghese" },
      { name: "Devanand P. B.", g: "Male", cat: "SC", dob: "11/01/2010", p: "Balakrishnan P." },
      { name: "Fathima Nizar", g: "Female", cat: "OEC", dob: "03/12/2009", p: "Nizar Rawther" },
      { name: "Gopika Krishna", g: "Female", cat: "General", dob: "18/07/2010", p: "Radhakrishnan P." },
      { name: "Harikrishnan M.", g: "Male", cat: "OBC", dob: "09/03/2010", p: "Muraleedharan V." },
      { name: "Irfan Habeeb", g: "Male", cat: "General", dob: "25/11/2010", p: "Habeeb Rahman" },
      { name: "Kavya Rajesh", g: "Female", cat: "OBC", dob: "14/06/2010", p: "Rajesh Kumar" },
      { name: "Muhammed Bilal", g: "Male", cat: "OEC", dob: "29/09/2010", p: "Shajahan E." },
      { name: "Nandana Suresh", g: "Female", cat: "General", dob: "05/02/2010", p: "Suresh Babu" },
      { name: "Pranav P.", g: "Male", cat: "General", dob: "19/04/2010", p: "Pradeep Kumar" },
      { name: "Rithika Nair", g: "Female", cat: "General", dob: "30/10/2010", p: "Vijayan Nair" },
      { name: "Rohit R. Chandran", g: "Male", cat: "SC", dob: "12/08/2010", p: "Ramachandran K." },
      { name: "Sneha Santhosh", g: "Female", cat: "OBC", dob: "07/01/2010", p: "Santhosh M." },
      { name: "Vaishnav V.", g: "Male", cat: "General", dob: "15/09/2010", p: "Venugopal K." },
    ];

    const allStudentsToInsert = [];
    let globalRollIndex = 1;

    ALL_CLASSES.forEach((cls) => {
      const clsName = cls.name; // e.g. "Class 10-A"
      const clsCode = cls.id;   // e.g. "10-A"

      // 15 Students per division
      sampleKeralaNames.forEach((item, rIdx) => {
        const roll = rIdx + 1;
        const isStudentTestUser = clsCode === "10-A" && item.name === "Aaditya S. Kumar";
        const studentName = isStudentTestUser ? "Anandhu Saji" : item.name;

        const admNo = `ADM-${clsCode.replace(/[^a-zA-Z0-9]/g, "")}-${100 + roll}`;
        const smpId = `SMP-06042-${clsCode.replace(/[^a-zA-Z0-9]/g, "")}-${200 + roll}`;

        const doc = {
          rollNumber: roll,
          name: studentName,
          gender: item.g,
          category: item.cat,
          dob: item.dob,
          bloodGroup: roll % 4 === 0 ? "A+" : roll % 4 === 1 ? "B+" : roll % 4 === 2 ? "O+" : "AB+",
          religion: "Hindu",
          caste: item.cat,
          admissionNumber: admNo,
          studentId: admNo,
          sampoornaId: smpId,
          classDivision: clsName,
          className: clsName,
          division: clsCode,
          overallAttendance: (95 + ((roll * 2) % 5)).toFixed(1) + "%",
          parentContact: `+91 94471 ${String(10000 + (globalRollIndex % 90000))}`,
          fatherName: item.p,
          motherName: `Smt. ${item.p.split(" ")[0]}a Devi`,
          guardian: item.p,
          guardianRelation: "Father",
          aadhaarNumber: `7845 ${String(1000 + (globalRollIndex % 9000))} ${String(5000 + (globalRollIndex % 5000))}`,
          birthCertificateNumber: `KL-IDK-2024-${String(10000 + globalRollIndex)}`,
          address: {
            houseName: `${item.p.split(" ")[0]} Nivas`,
            street: "Post Office Road",
            postOffice: "Rajakkad P.O",
            city: "Rajakkad",
            district: "Idukki",
            state: "Kerala",
            pincode: "685566",
          },
          fullAddress: `${item.p.split(" ")[0]} Nivas, Post Office Road, Rajakkad P.O, Idukki, Kerala - 685566`,
          previousSchool: "Government Lower/Upper Primary School",
          tcNumber: `TC-${5000 + globalRollIndex}`,
          identificationMarks: "A small mole on the right cheek",
          monthlyLeavesTaken: roll % 5 === 0 ? 1 : 0,
        };

        if (isStudentTestUser) {
          doc.userId = studentUser._id;
          doc.email = "student@ghss.edu";
        }

        allStudentsToInsert.push(doc);
        globalRollIndex++;
      });
    });

    const insertedStudents = await Student.insertMany(allStudentsToInsert);
    console.log(`✅ Seeded ${insertedStudents.length} students across all 26 classes in MongoDB!`);

    // -------------------------------------------------------------
    // 4. SEED DAILY MUSTER ATTENDANCE FOR ALL 26 CLASSES FOR TODAY
    // -------------------------------------------------------------
    await Attendance.deleteMany({});
    const todayStr = new Date().toISOString().split("T")[0];

    const attendanceDocsToInsert = [];

    ALL_CLASSES.forEach((cls) => {
      const clsStudents = insertedStudents.filter(
        (s) => s.classDivision === cls.name || s.division === cls.id
      );

      const records = clsStudents.map((s, idx) => ({
        studentId: s._id,
        rollNumber: s.rollNumber,
        name: s.name,
        status: idx === 3 ? "Absent" : "Present", // 1 absent per class for realistic turnout
      }));

      const totalPresent = records.filter((r) => r.status === "Present").length;
      const totalAbsent = records.filter((r) => r.status === "Absent").length;

      attendanceDocsToInsert.push({
        date: todayStr,
        classDivision: cls.name,
        records,
        totalPresent,
        totalAbsent,
        markedBy: "admin@ghss.edu (Headmaster Sign-off)",
      });
    });

    await Attendance.insertMany(attendanceDocsToInsert);
    console.log(`✅ Seeded ${attendanceDocsToInsert.length} daily attendance registers in MongoDB for ${todayStr}.`);

    // -------------------------------------------------------------
    // 5. SEED EXAM TIMETABLES & SEATING PLANS ACROSS ALL WINGS
    // -------------------------------------------------------------
    await Exam.deleteMany({});

    const examTimetables = [
      // Standard 10 (SSLC State Board Examination)
      {
        term: "SSLC Board Examination March 2026",
        standard: "Standard 10 (SSLC)",
        academicYear: "2025-2026",
        date: "12 March 2026, Thu",
        examDate: new Date("2026-03-12T04:00:00Z"),
        startTime: "09:30 AM",
        endTime: "12:15 PM",
        duration: "2 hrs 45 mins",
        subject: "Mathematics",
        qpCode: "KL-SSLC-M401",
        hall: "Halls 01, 02, 03, 04, 05",
        totalCandidates: 242,
        invigilator: "Mrs. Indu B Nair, Sri. George K.",
        maxMarks: 80,
        status: "Approved & Published",
        seatingPlan: [
          { hallNumber: "Hall 01", roomName: "Room 101 (Main Block - First Floor)", rollRange: "ADM-10A-101 to ADM-10A-140", candidateCount: 40, invigilatorName: "Mrs. Indu B Nair", invigilatorPen: "849201" },
          { hallNumber: "Hall 02", roomName: "Room 102 (Main Block - First Floor)", rollRange: "ADM-10A-141 to ADM-10B-120", candidateCount: 40, invigilatorName: "Sri. George K.", invigilatorPen: "849202" },
          { hallNumber: "Hall 03", roomName: "Room 201 (Science Block)", rollRange: "ADM-10B-121 to ADM-10C-110", candidateCount: 40, invigilatorName: "Smt. Bindu S.", invigilatorPen: "849205" },
          { hallNumber: "Hall 04", roomName: "Room 202 (Science Block)", rollRange: "ADM-10C-111 to ADM-10D-110", candidateCount: 42, invigilatorName: "Smt. Sunitha R.", invigilatorPen: "849207" },
          { hallNumber: "Hall 05", roomName: "Auditorium Hall A", rollRange: "ADM-10D-111 to ADM-10E-140", candidateCount: 80, invigilatorName: "Sri. Radhakrishnan N.", invigilatorPen: "849214" },
        ],
      },
      {
        term: "SSLC Board Examination March 2026",
        standard: "Standard 10 (SSLC)",
        academicYear: "2025-2026",
        date: "10 March 2026, Tue",
        examDate: new Date("2026-03-10T04:00:00Z"),
        startTime: "09:30 AM",
        endTime: "12:15 PM",
        duration: "2 hrs 45 mins",
        subject: "First Language Malayalam Paper I",
        qpCode: "KL-SSLC-FL101",
        hall: "Halls 01, 02, 03, 04, 05",
        totalCandidates: 242,
        invigilator: "Mrs. Priya Nair, Smt. Mini V.",
        maxMarks: 80,
        status: "Approved & Published",
      },
      {
        term: "SSLC Board Examination March 2026",
        standard: "Standard 10 (SSLC)",
        academicYear: "2025-2026",
        date: "16 March 2026, Mon",
        examDate: new Date("2026-03-16T04:00:00Z"),
        startTime: "09:30 AM",
        endTime: "11:45 AM",
        duration: "2 hrs 15 mins",
        subject: "Physical Science (Physics)",
        qpCode: "KL-SSLC-PS302",
        hall: "Halls 01, 02, 03, 04, 05",
        totalCandidates: 242,
        invigilator: "Smt. Bindu S., Sri. Suresh C. K.",
        maxMarks: 60,
        status: "Approved & Published",
      },
      {
        term: "SSLC Board Examination March 2026",
        standard: "Standard 10 (SSLC)",
        academicYear: "2025-2026",
        date: "19 March 2026, Thu",
        examDate: new Date("2026-03-19T04:00:00Z"),
        startTime: "09:30 AM",
        endTime: "12:15 PM",
        duration: "2 hrs 45 mins",
        subject: "Social Science",
        qpCode: "KL-SSLC-SS501",
        hall: "Halls 01, 02, 03, 04, 05",
        totalCandidates: 242,
        invigilator: "Sri. Radhakrishnan N., Sri. Deepu Varghese",
        maxMarks: 80,
        status: "Approved & Published",
      },
      {
        term: "SSLC Board Examination March 2026",
        standard: "Standard 10 (SSLC)",
        academicYear: "2025-2026",
        date: "23 March 2026, Mon",
        examDate: new Date("2026-03-23T04:00:00Z"),
        startTime: "09:30 AM",
        endTime: "12:15 PM",
        duration: "2 hrs 45 mins",
        subject: "English Language & Literature",
        qpCode: "KL-SSLC-ENG201",
        hall: "Halls 01, 02, 03, 04, 05",
        totalCandidates: 242,
        invigilator: "Sri. Thomas Joseph, Smt. Mary K. J.",
        maxMarks: 80,
        status: "Approved & Published",
      },

      // Higher Secondary (+2 Second Year DHSE Examination)
      {
        term: "Plus Two Higher Secondary March 2026",
        standard: "Standard 12 (Plus Two Science)",
        academicYear: "2025-2026",
        date: "11 March 2026, Wed",
        examDate: new Date("2026-03-11T04:00:00Z"),
        startTime: "09:30 AM",
        endTime: "12:15 PM",
        duration: "2 hrs 45 mins",
        subject: "Physics",
        qpCode: "DHSE-HSE-PHY12",
        hall: "HSS Halls 01, 02, 03",
        totalCandidates: 100,
        invigilator: "Sri. Manoj P., Sri. Suresh C. K.",
        maxMarks: 60,
        status: "Approved & Published",
        seatingPlan: [
          { hallNumber: "Hall 01", roomName: "HSS Physics Lab Room 301", rollRange: "ADM-12Sci-101 to ADM-12Sci-150", candidateCount: 50, invigilatorName: "Sri. Manoj P.", invigilatorPen: "849242" },
          { hallNumber: "Hall 02", roomName: "HSS Chemistry Lab Room 302", rollRange: "ADM-12Sci-151 to ADM-12Sci-200", candidateCount: 50, invigilatorName: "Sri. Suresh C. K.", invigilatorPen: "849219" },
        ],
      },
      {
        term: "Plus Two Higher Secondary March 2026",
        standard: "Standard 12 (Plus Two Commerce)",
        academicYear: "2025-2026",
        date: "14 March 2026, Sat",
        examDate: new Date("2026-03-14T04:00:00Z"),
        startTime: "09:30 AM",
        endTime: "12:15 PM",
        duration: "2 hrs 45 mins",
        subject: "Accountancy with AFS",
        qpCode: "DHSE-HSE-ACC12",
        hall: "HSS Halls 04, 05",
        totalCandidates: 99,
        invigilator: "Smt. Deepa Nair, Smt. Kavitha R.",
        maxMarks: 80,
        status: "Approved & Published",
      },
      {
        term: "Plus Two Higher Secondary March 2026",
        standard: "Standard 12 (Plus Two Humanities)",
        academicYear: "2025-2026",
        date: "17 March 2026, Tue",
        examDate: new Date("2026-03-17T04:00:00Z"),
        startTime: "09:30 AM",
        endTime: "12:15 PM",
        duration: "2 hrs 45 mins",
        subject: "History & World Civilization",
        qpCode: "DHSE-HSE-HIS12",
        hall: "HSS Room 203",
        totalCandidates: 49,
        invigilator: "Sri. Rajeev M.",
        maxMarks: 80,
        status: "Approved & Published",
      },

      // Higher Secondary (+1 First Year Examination)
      {
        term: "Plus One Board Examination March 2026",
        standard: "Standard 11 (Plus One Science)",
        academicYear: "2025-2026",
        date: "13 March 2026, Fri",
        examDate: new Date("2026-03-13T08:00:00Z"),
        startTime: "01:30 PM",
        endTime: "04:15 PM",
        duration: "2 hrs 45 mins",
        subject: "Chemistry",
        qpCode: "DHSE-FY-CHE11",
        hall: "HSS Halls 01, 02",
        totalCandidates: 50,
        invigilator: "Sri. Suresh C. K.",
        maxMarks: 60,
        status: "Approved & Published",
      },
      {
        term: "Plus One Board Examination March 2026",
        standard: "Standard 11 (Plus One Commerce)",
        academicYear: "2025-2026",
        date: "18 March 2026, Wed",
        examDate: new Date("2026-03-18T08:00:00Z"),
        startTime: "01:30 PM",
        endTime: "04:15 PM",
        duration: "2 hrs 45 mins",
        subject: "Business Studies",
        qpCode: "DHSE-FY-BST11",
        hall: "HSS Halls 03, 04",
        totalCandidates: 49,
        invigilator: "Smt. Deepa Nair",
        maxMarks: 80,
        status: "Approved & Published",
      },

      // Upper Primary (Classes 5 to 7 Annual Evaluation)
      {
        term: "UP School Annual Evaluation March 2026",
        standard: "Class 7 (UP Evaluation)",
        academicYear: "2025-2026",
        date: "11 March 2026, Wed",
        examDate: new Date("2026-03-11T04:30:00Z"),
        startTime: "10:00 AM",
        endTime: "12:00 PM",
        duration: "2 hrs",
        subject: "Basic Science",
        qpCode: "SCERT-UP-SCI07",
        hall: "UP Block Rooms 05, 06",
        totalCandidates: 93,
        invigilator: "Smt. Sheela Thomas, Sri. Suresh Babu",
        maxMarks: 50,
        status: "Approved & Published",
      },
      {
        term: "UP School Annual Evaluation March 2026",
        standard: "Class 6 (UP Evaluation)",
        academicYear: "2025-2026",
        date: "12 March 2026, Thu",
        examDate: new Date("2026-03-12T04:30:00Z"),
        startTime: "10:00 AM",
        endTime: "12:00 PM",
        duration: "2 hrs",
        subject: "Mathematics",
        qpCode: "SCERT-UP-MAT06",
        hall: "UP Block Rooms 03, 04",
        totalCandidates: 92,
        invigilator: "Sri. Rajesh Kumar, Sri. Deepu Varghese",
        maxMarks: 50,
        status: "Approved & Published",
      },
      {
        term: "UP School Annual Evaluation March 2026",
        standard: "Class 5 (UP Evaluation)",
        academicYear: "2025-2026",
        date: "13 March 2026, Fri",
        examDate: new Date("2026-03-13T04:30:00Z"),
        startTime: "10:00 AM",
        endTime: "12:00 PM",
        duration: "2 hrs",
        subject: "Malayalam Paper I",
        qpCode: "SCERT-UP-MAL05",
        hall: "UP Block Rooms 01, 02",
        totalCandidates: 91,
        invigilator: "Smt. Mini V., Smt. Mary K. J.",
        maxMarks: 50,
        status: "Approved & Published",
      },

      // Lower Primary (Classes 1 to 4 Evaluation)
      {
        term: "LP School Primary Evaluation March 2026",
        standard: "Class 4 (LP Primary Evaluation)",
        academicYear: "2025-2026",
        date: "10 March 2026, Tue",
        examDate: new Date("2026-03-10T04:30:00Z"),
        startTime: "10:00 AM",
        endTime: "11:30 AM",
        duration: "1 hr 30 mins",
        subject: "Environmental Studies (EVS)",
        qpCode: "SCERT-LP-EVS04",
        hall: "LP Block Rooms 07, 08",
        totalCandidates: 78,
        invigilator: "Sri. Shaji Mathew, Smt. Latha K.",
        maxMarks: 40,
        status: "Approved & Published",
      },
      {
        term: "LP School Primary Evaluation March 2026",
        standard: "Class 3 (LP Primary Evaluation)",
        academicYear: "2025-2026",
        date: "11 March 2026, Wed",
        examDate: new Date("2026-03-11T04:30:00Z"),
        startTime: "10:00 AM",
        endTime: "11:30 AM",
        duration: "1 hr 30 mins",
        subject: "Mathematics Activity Evaluation",
        qpCode: "SCERT-LP-MAT03",
        hall: "LP Block Rooms 05, 06",
        totalCandidates: 78,
        invigilator: "Smt. Manju R., Smt. Rema Devi",
        maxMarks: 40,
        status: "Approved & Published",
      },
      {
        term: "LP School Primary Evaluation March 2026",
        standard: "Class 2 (LP Primary Evaluation)",
        academicYear: "2025-2026",
        date: "12 March 2026, Thu",
        examDate: new Date("2026-03-12T04:30:00Z"),
        startTime: "10:00 AM",
        endTime: "11:30 AM",
        duration: "1 hr 30 mins",
        subject: "Malayalam Reading & Writing",
        qpCode: "SCERT-LP-MAL02",
        hall: "LP Block Rooms 03, 04",
        totalCandidates: 79,
        invigilator: "Smt. Sreeja K., Sri. Anilkumar M.",
        maxMarks: 40,
        status: "Approved & Published",
      },
      {
        term: "LP School Primary Evaluation March 2026",
        standard: "Class 1 (LP Primary Evaluation)",
        academicYear: "2025-2026",
        date: "13 March 2026, Fri",
        examDate: new Date("2026-03-13T04:30:00Z"),
        startTime: "10:00 AM",
        endTime: "11:30 AM",
        duration: "1 hr 30 mins",
        subject: "Basic Literacy & Numeracy Evaluation",
        qpCode: "SCERT-LP-LIT01",
        hall: "LP Block Rooms 01, 02",
        totalCandidates: 77,
        invigilator: "Smt. Beena P., Smt. Asha Mohan",
        maxMarks: 40,
        status: "Approved & Published",
      },
    ];

    await Exam.insertMany(examTimetables);
    console.log(`✅ Seeded ${examTimetables.length} exam schedules across all standards in MongoDB!`);

    // -------------------------------------------------------------
    // 6. SEED OFFICIAL FEE PAYMENTS ACROSS DIVISIONS
    // -------------------------------------------------------------
    await FeePayment.deleteMany({});
    const feeTemplates = [
      { feeCategory: "Bus Fee", totalAmount: 4500, term: "Monthly Bus Pass", remarks: "School Bus Route 03 - Rajakkad Town to Kallar" },
      { feeCategory: "Annual Fee", totalAmount: 6800, term: "Annual", remarks: "Composite Academic & Amenities Fee 2026-27" },
      { feeCategory: "PTA Fund", totalAmount: 1500, term: "Annual", remarks: "Parent-Teacher Association Development Fund" },
      { feeCategory: "Bus Fee", totalAmount: 4800, term: "Monthly Bus Pass", remarks: "School Bus Route 01 - Ponmudi & Bisonvalley" },
      { feeCategory: "Lab & Computer Fee", totalAmount: 2200, term: "Term 1", remarks: "High-Tech Computer Lab & Smart Classroom Charge" },
      { feeCategory: "Special / Exam Fee", totalAmount: 1200, term: "Term 1", remarks: "SCERT Model & Board Examination Fee" },
      { feeCategory: "Sports & Library", totalAmount: 850, term: "Annual", remarks: "Sports Equipment & Library Lending Card" },
      { feeCategory: "PTA Fund", totalAmount: 1500, term: "Annual", remarks: "General Education Protection Mission Support" },
    ];

    const paymentModes = [
      "UPI / Online (Google Pay / PhonePe)",
      "Net Banking",
      "Cash at School Counter",
      "Bank Challan (SBT/SBI)",
    ];

    const feeDocsToInsert = [];
    let receiptCounter = 1042;

    const selectedFeeStudents = insertedStudents.slice(0, 45);
    selectedFeeStudents.forEach((s, idx) => {
      const template1 = feeTemplates[idx % feeTemplates.length];
      const template2 = feeTemplates[(idx + 2) % feeTemplates.length];
      const items = [template1, template2];

      items.forEach((tmpl, iIdx) => {
        receiptCounter++;
        const isPaid = (idx + iIdx) % 5 !== 0;
        const amountPaid = isPaid ? tmpl.totalAmount : Math.round(tmpl.totalAmount * 0.5);
        const dueAmount = tmpl.totalAmount - amountPaid;
        const status = dueAmount === 0 ? "Paid" : "Partial";

        let wing = "High School";
        const divLower = (s.classDivision || "").toLowerCase();
        if (divLower.includes("11") || divLower.includes("12") || divLower.includes("science") || divLower.includes("commerce")) {
          wing = "Higher Secondary";
        } else if (divLower.includes("5") || divLower.includes("6") || divLower.includes("7")) {
          wing = "UP School";
        } else if (divLower.includes("1") || divLower.includes("2") || divLower.includes("3") || divLower.includes("4")) {
          wing = "LP School";
        }

        feeDocsToInsert.push({
          receiptNumber: `REC-2026-${receiptCounter}`,
          studentId: s._id,
          studentName: s.name,
          admissionNumber: s.admissionNumber,
          classDivision: s.classDivision,
          wing,
          feeCategory: tmpl.feeCategory,
          term: tmpl.term,
          totalAmount: tmpl.totalAmount,
          amountPaid,
          dueAmount,
          paymentDate: `2026-10-${String(10 + (idx % 18)).padStart(2, "0")}`,
          paymentMode: paymentModes[(idx + iIdx) % paymentModes.length],
          transactionReference:
            (idx + iIdx) % 2 === 0
              ? `UPI/${629000000 + receiptCounter}`
              : `COUNTER-CASH-${receiptCounter}`,
          status,
          collectedBy: "Accounts Desk / Sri. R. Krishnan",
          remarks: tmpl.remarks,
        });
      });
    });

    await FeePayment.insertMany(feeDocsToInsert);
    console.log(`✅ Seeded ${feeDocsToInsert.length} fee transaction records in MongoDB!`);

    // -------------------------------------------------------------
    // 7. SEED CONTINUOUS EVALUATION (CE) & INTERNAL MARKS
    // -------------------------------------------------------------
    await InternalMark.deleteMany({});

    const internalMarksToInsert = [];

    // Class 10-A: Mathematics - Continuous Evaluation (CE)
    const class10AStudents = insertedStudents.filter((s) => s.classDivision === "Class 10-A");
    if (class10AStudents.length > 0) {
      const maxMarks = 20;
      const passMarks = 6;
      const ceRecords = class10AStudents.map((std, idx) => {
        const marksObtained = 14 + (idx % 7);
        const { grade } = calculateKeralaGrade(marksObtained, maxMarks);
        return {
          studentId: std._id,
          rollNumber: std.rollNumber,
          admissionNumber: std.admissionNumber,
          studentName: std.name,
          marksObtained,
          isAbsent: false,
          grade,
          remarks: marksObtained >= 18 ? "Outstanding performance" : "Satisfactory",
        };
      });

      const totalMarks = ceRecords.reduce((acc, r) => acc + r.marksObtained, 0);
      const classAverage = Number((totalMarks / ceRecords.length).toFixed(1));
      const highestScore = Math.max(...ceRecords.map((r) => r.marksObtained));
      const lowestScore = Math.min(...ceRecords.map((r) => r.marksObtained));

      internalMarksToInsert.push({
        examTerm: "First Terminal Examination 2026",
        standard: "Class 10",
        classDivision: "Class 10-A",
        subject: "Mathematics",
        evaluationType: "Continuous Evaluation (CE)",
        maxMarks,
        passMarks,
        teacherName: "Mrs. Indu B Nair",
        teacherEmail: "kathalanx@gmail.com",
        teacherPen: "849201",
        records: ceRecords,
        classAverage,
        highestScore,
        lowestScore,
        passPercentage: 100,
        status: "Submitted",
      });

      // Class 10-A: Mathematics - Written Exam
      const writtenMax = 80;
      const writtenPass = 24;
      const writtenRecords = class10AStudents.map((std, idx) => {
        const marksObtained = 52 + ((idx * 4) % 27);
        const { grade } = calculateKeralaGrade(marksObtained, writtenMax);
        return {
          studentId: std._id,
          rollNumber: std.rollNumber,
          admissionNumber: std.admissionNumber,
          studentName: std.name,
          marksObtained,
          isAbsent: false,
          grade,
          remarks: marksObtained >= 70 ? "Excellent" : "Good grasp of concepts",
        };
      });

      const writtenTotalMarks = writtenRecords.reduce((acc, r) => acc + r.marksObtained, 0);
      const writtenAverage = Number((writtenTotalMarks / writtenRecords.length).toFixed(1));

      internalMarksToInsert.push({
        examTerm: "First Terminal Examination 2026",
        standard: "Class 10",
        classDivision: "Class 10-A",
        subject: "Mathematics",
        evaluationType: "Written Exam",
        maxMarks: writtenMax,
        passMarks: writtenPass,
        teacherName: "Mrs. Indu B Nair",
        teacherEmail: "kathalanx@gmail.com",
        teacherPen: "849201",
        records: writtenRecords,
        classAverage: writtenAverage,
        highestScore: Math.max(...writtenRecords.map((r) => r.marksObtained)),
        lowestScore: Math.min(...writtenRecords.map((r) => r.marksObtained)),
        passPercentage: 100,
        status: "Submitted",
      });
    }

    // Class 10-B: Mathematics - Continuous Evaluation (CE)
    const class10BStudents = insertedStudents.filter((s) => s.classDivision === "Class 10-B");
    if (class10BStudents.length > 0) {
      const maxMarks = 20;
      const passMarks = 6;
      const ceRecords10B = class10BStudents.map((std, idx) => {
        const marksObtained = 13 + (idx % 8);
        const { grade } = calculateKeralaGrade(marksObtained, maxMarks);
        return {
          studentId: std._id,
          rollNumber: std.rollNumber,
          admissionNumber: std.admissionNumber,
          studentName: std.name,
          marksObtained,
          isAbsent: false,
          grade,
          remarks: "Good",
        };
      });

      const totalMarks10B = ceRecords10B.reduce((acc, r) => acc + r.marksObtained, 0);

      internalMarksToInsert.push({
        examTerm: "First Terminal Examination 2026",
        standard: "Class 10",
        classDivision: "Class 10-B",
        subject: "Mathematics",
        evaluationType: "Continuous Evaluation (CE)",
        maxMarks,
        passMarks,
        teacherName: "Sri. George K.",
        teacherEmail: "george.k@ghssrajakkad.kerala.gov.in",
        teacherPen: "849202",
        records: ceRecords10B,
        classAverage: Number((totalMarks10B / ceRecords10B.length).toFixed(1)),
        highestScore: Math.max(...ceRecords10B.map((r) => r.marksObtained)),
        lowestScore: Math.min(...ceRecords10B.map((r) => r.marksObtained)),
        passPercentage: 100,
        status: "Submitted",
      });
    }

    // Class 12-Science: Physics - Continuous Evaluation (CE)
    const class12SciStudents = insertedStudents.filter((s) => s.classDivision === "Class 12-Science");
    if (class12SciStudents.length > 0) {
      const maxMarks = 20;
      const passMarks = 6;
      const ceRecords12Sci = class12SciStudents.map((std, idx) => {
        const marksObtained = 15 + (idx % 6);
        const { grade } = calculateKeralaGrade(marksObtained, maxMarks);
        return {
          studentId: std._id,
          rollNumber: std.rollNumber,
          admissionNumber: std.admissionNumber,
          studentName: std.name,
          marksObtained,
          isAbsent: false,
          grade,
          remarks: "Regular in laboratory and assignments",
        };
      });

      const totalMarks12Sci = ceRecords12Sci.reduce((acc, r) => acc + r.marksObtained, 0);

      internalMarksToInsert.push({
        examTerm: "First Terminal Examination 2026",
        standard: "Class 12",
        classDivision: "Class 12-Science",
        subject: "Physics",
        evaluationType: "Continuous Evaluation (CE)",
        maxMarks,
        passMarks,
        teacherName: "Sri. Manoj P.",
        teacherEmail: "manoj.p@ghssrajakkad.kerala.gov.in",
        teacherPen: "849242",
        records: ceRecords12Sci,
        classAverage: Number((totalMarks12Sci / ceRecords12Sci.length).toFixed(1)),
        highestScore: Math.max(...ceRecords12Sci.map((r) => r.marksObtained)),
        lowestScore: Math.min(...ceRecords12Sci.map((r) => r.marksObtained)),
        passPercentage: 100,
        status: "Submitted",
      });
    }

    if (internalMarksToInsert.length > 0) {
      await InternalMark.insertMany(internalMarksToInsert);
      console.log(`✅ Seeded ${internalMarksToInsert.length} internal evaluation mark registers in MongoDB!`);
    }

    console.log("\n========================================================");
    console.log("       🎉 MASTER SEEDING COMPLETED SUCCESSFULLY!        ");
    console.log("========================================================");
    console.log("  TOTAL ACADEMIC WINGS       : 4 Wings (LP, UP, HS, HSS)");
    console.log("  TOTAL ACADEMIC DIVISIONS   : 26 Divisions");
    console.log(`  TOTAL STUDENTS SEEDED      : ${insertedStudents.length}`);
    console.log(`  TOTAL TEACHERS / MENTORS   : ${fullFacultyCadre.length}`);
    console.log(`  TOTAL ATTENDANCE REGISTERS : ${attendanceDocsToInsert.length}`);
    console.log(`  TOTAL EXAM SCHEDULES       : ${examTimetables.length}`);
    console.log(`  TOTAL FEE PAYMENTS         : ${feeDocsToInsert.length}`);
    console.log(`  TOTAL INTERNAL MARK PAPERS : ${internalMarksToInsert.length}`);
    console.log("--------------------------------------------------------");
    console.log("  LOGIN CREDENTIALS:");
    console.log("  - Super Admin : admin@ghss.edu     / Admin@12345");
    console.log("  - Teacher     : kathalanx@gmail.com / Teacher@123");
    console.log("  - Student     : student@ghss.edu   / Student@123");
    console.log("========================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Master Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
