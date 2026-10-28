const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectDB = require("./config/db");
const User = require("./models/user");

const seedTestUser = async () => {
  try {
    await connectDB();

    const email = "rahulstudent@gmail.com";
    let user = await User.findOne({ email });

    if (user) {
      user.password = "Rahul@123";
      user.isActive = true;
      await user.save();
      console.log(`Updated test user: ${email} with password: Rahul@123`);
    } else {
      user = await User.create({
        username: "Rahul Student",
        email,
        password: "Rahul@123",
        role: "user",
        isActive: true,
      });
      console.log(`Created test user: ${email} with password: Rahul@123`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedTestUser();