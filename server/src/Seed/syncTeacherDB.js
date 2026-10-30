import mongoose from "mongoose";
import "dotenv/config";
import Teacher from "../models/Teacher.js";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/ghss_student_portal?replicaSet=rs0";

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    const indexes = await Teacher.collection.indexes();
    for (const idx of indexes) {
      if (
        idx.name === "userId_1" ||
        idx.name === "teacherId_1" ||
        idx.name === "email_1"
      ) {
        try {
          await Teacher.collection.dropIndex(idx.name);
          console.log(`Dropped legacy index ${idx.name}`);
        } catch (e) {
          // ignore if already dropped
        }
      }
    }

    try {
      await Teacher.collection.createIndex({ userId: 1 }, { unique: true, sparse: true });
      await Teacher.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    } catch (e) {
      // ignore
    }

    // Update Indu B Nair with full government faculty details
    const indu = await Teacher.findOneAndUpdate(
      { email: "kathalanx@gmail.com" },
      {
        $set: {
          name: "Mrs. Indu B Nair",
          pen: "849201",
          department: "HST Mathematics",
          designation: "HST",
          assignedClass: "Class 10-A Mentor",
          mentorClass: "10-A",
          subject: "Mathematics",
          periods: "24 hrs / Week",
          status: "In Class",
          phone: "+91 98470 12345",
          qualification: "M.Sc Mathematics, B.Ed",
          appointmentDate: "01/06/2016",
        },
      },
      { returnDocument: "after" }
    );
    console.log("Updated Indu B Nair:", indu?.name, "PEN:", indu?.pen, "Status:", indu?.status);

    const defaultCadre = [
      {
        name: "Sri. George K.",
        email: "george.k@ghssrajakkad.kerala.gov.in",
        department: "HST Mathematics",
        designation: "HST",
        assignedClass: "Class 10-B Mentor",
        mentorClass: "10-B",
        pen: "849202",
        phone: "+91 94462 88219",
        periods: "26 hrs / Week",
        status: "Active",
        qualification: "M.Sc Mathematics, B.Ed",
        appointmentDate: "01/06/2015",
      },
      {
        name: "Smt. Bindu S.",
        email: "bindu.s@ghssrajakkad.kerala.gov.in",
        department: "HST Physical Science",
        designation: "HST",
        assignedClass: "Class 9-A Mentor",
        mentorClass: "9-A",
        pen: "849205",
        phone: "+91 98470 55123",
        periods: "22 hrs / Week + Lab",
        status: "Active",
        qualification: "M.Sc Physics, B.Ed",
        appointmentDate: "15/07/2017",
      },
      {
        name: "Sri. Suresh C. K.",
        email: "suresh.ck@ghssrajakkad.kerala.gov.in",
        department: "HSST Chemistry",
        designation: "HSST",
        assignedClass: "Class 11 Science",
        mentorClass: "11-A",
        pen: "849219",
        phone: "+91 94956 77123",
        periods: "Practical Exam Observer",
        status: "On Duty",
        qualification: "M.Sc Chemistry, B.Ed, SET",
        appointmentDate: "02/06/2012",
      },
      {
        name: "Sri. Thomas Joseph",
        email: "thomas.joseph@ghssrajakkad.kerala.gov.in",
        department: "HSST English",
        designation: "HSST",
        assignedClass: "Class 12 Humanities",
        mentorClass: "12-A",
        pen: "849210",
        phone: "+91 94951 44321",
        periods: "25 hrs / Week",
        status: "Active",
        qualification: "M.A English, B.Ed, NET",
        appointmentDate: "01/06/2014",
      },
      {
        name: "Smt. Radhakrishnan N.",
        email: "radhakrishnan.n@ghssrajakkad.kerala.gov.in",
        department: "HST Social Science",
        designation: "HST",
        assignedClass: "Class 8-C Mentor",
        mentorClass: "8-C",
        pen: "849214",
        phone: "+91 94468 11902",
        periods: "22 hrs / Week",
        status: "Active",
        qualification: "M.A History, B.Ed",
        appointmentDate: "01/06/2019",
      },
    ];

    for (const t of defaultCadre) {
      const exists = await Teacher.findOne({ pen: t.pen });
      if (!exists) {
        await Teacher.create(t);
        console.log(`Created cadre faculty: ${t.name} (${t.pen})`);
      }
    }

    const allTeachers = await Teacher.find().lean();
    console.log(`\nFinal count: ${allTeachers.length} teachers in DB:`);
    allTeachers.forEach((t) => {
      console.log(`- ${t.name} | PEN: ${t.pen} | Dept: ${t.department} | Assigned: ${t.assignedClass} | Status: ${t.status}`);
    });

    await mongoose.disconnect();
    console.log("Teacher synchronization finished.");
  } catch (err) {
    console.error("Error in sync:", err);
  }
}

run();
