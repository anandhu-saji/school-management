import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserRole } from "../constants/enums.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    role: {
      type: String,
      enum: [...Object.values(UserRole), "user"],
      default: UserRole.STUDENT,
    },
    isGoogleAuth: {
      type: Boolean,
      default: false,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Account Security & Lockout
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    // Password Reset OTP
    resetPasswordOtp: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Synchronize name and username so neither is ever undefined
userSchema.pre("validate", function () {
  if (!this.name && this.username) {
    this.name = this.username;
  } else if (!this.username && this.name) {
    this.username = this.name;
  }
  // Normalize legacy 'user' to 'student'
  if (this.role === "user") {
    this.role = UserRole.STUDENT;
  }
});
// Hash password before saving if modified (async, no next)
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
