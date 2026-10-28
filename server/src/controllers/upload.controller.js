import { uploadImageToS3, deleteImageFromS3 } from "../services/s3.service.js";
import User from "../models/user.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";

/**
 * Controller: Uploads profile picture buffer to AWS S3 and links the URL
 * Route: POST /api/upload/avatar
 */
export const uploadProfileAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided for upload.",
      });
    }

    const userId = req.user?._id;
    const userRole = req.user?.role;

    // 1. Upload buffer directly to AWS S3 bucket
    const avatarUrl = await uploadImageToS3(req.file, "avatars");

    // 2. Update role-specific collection and clean up old avatar
    if (userRole === "teacher") {
      const teacher = await Teacher.findOne({ userId });
      if (teacher?.avatarUrl) {
        await deleteImageFromS3(teacher.avatarUrl);
      }
      await Teacher.findOneAndUpdate(
        { userId },
        { avatarUrl },
        { new: true }
      );
    } else if (userRole === "student") {
      const student = await Student.findOne({ userId });
      if (student?.avatarUrl) {
        await deleteImageFromS3(student.avatarUrl);
      }
      await Student.findOneAndUpdate(
        { userId },
        { avatarUrl },
        { new: true }
      );
    }

    // 3. Keep User document updated if applicable
    await User.findByIdAndUpdate(userId, { avatarUrl });

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded and saved successfully.",
      avatarUrl,
    });
  } catch (error) {
    next(error);
  }
};