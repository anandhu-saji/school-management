import { uploadImageToS3, deleteImageFromS3, uploadFile } from "../services/s3.service.js";
import User from "../models/user.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";

/**
 * Controller: Uploads profile picture buffer to AWS S3 (or local fallback) and links the URL
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

    // 1. Upload buffer
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

/**
 * Controller: Uploads student ID proof document (PDF, PNG, JPG, WEBP)
 * Route: POST /api/upload/document
 */
export const uploadDocumentFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document file provided for upload.",
      });
    }

    const fileUrl = await uploadFile(req.file, "documents");
    const isPdf = req.file.mimetype === "application/pdf";

    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully.",
      fileUrl,
      fileName: req.file.originalname,
      fileType: isPdf ? "pdf" : "image",
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    next(error);
  }
};
