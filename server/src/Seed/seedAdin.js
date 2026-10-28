const path = require("path");
const dotenv = require("dotenv");

// .env is two directories up: server/src/Seed -> server/src -> server/.env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const connectDB = require("../config/db");
const User = require("../models/user");

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@ghss.edu";
    const adminPassword = "Admin@12345";
    const adminUsername = "Super Admin";

    let user = await User.findOne({ email: adminEmail });

    if (user) {
      user.role = "admin";
      user.password = adminPassword;
      user.isActive = true;
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
      console.log(`Updated existing user (${adminEmail}) to ADMIN role.`);
    } else {
      user = await User.create({
        username: adminUsername,
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        isActive: true,
      });
      console.log("Admin account created successfully!");
    }

    console.log("-----------------------------------------");
    console.log(`Email    : ${adminEmail}`);
    console.log(`Password : ${adminPassword}`);
    console.log(`Role     : admin`);
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exit(1);
  }
};

createAdmin();