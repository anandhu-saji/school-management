import mongoose from "mongoose";

const profileUpdateRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      enum: ["student", "teacher", "admin", "user"],
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    identifier: {
      type: String, // Admission Number (student) or PEN Number (teacher)
      trim: true,
      default: "",
    },
    division: {
      type: String, // Class Division e.g. "Class 10-A"
      trim: true,
      default: "",
    },
    currentData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    requestedChanges: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminRemark: {
      type: String,
      trim: true,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "profile_update_requests",
  }
);

const ProfileUpdateRequest = mongoose.model(
  "ProfileUpdateRequest",
  profileUpdateRequestSchema
);

export default ProfileUpdateRequest;
