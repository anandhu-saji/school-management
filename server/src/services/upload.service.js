import { uploadImageToS3, deleteImageFromS3, uploadFile } from "./s3.service.js";
import User from "../models/user.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import { ApiError } from "../utils/ApiError.js";

export class UploadService {
  /**
   * Upload profile avatar, update User/Student/Teacher models, and remove old avatar from S3
   */
  static async uploadAvatar(file, { userId, userRole }) {
    if (!file) {
      throw ApiError.badRequest("No image file provided for upload.");
    }

    const avatarUrl = await uploadImageToS3(file, "avatars");

    if (userRole === "teacher") {
      const teacher = await Teacher.findOne({ userId });
      if (teacher?.avatarUrl) {
        await deleteImageFromS3(teacher.avatarUrl);
      }
      await Teacher.findOneAndUpdate({ userId }, { avatarUrl }, { new: true });
    } else if (userRole === "student") {
      const student = await Student.findOne({ userId });
      if (student?.avatarUrl) {
        await deleteImageFromS3(student.avatarUrl);
      }
      await Student.findOneAndUpdate({ userId }, { avatarUrl }, { new: true });
    }

    await User.findByIdAndUpdate(userId, { avatarUrl });

    return { avatarUrl };
  }

  /**
   * Upload statutory KYC ID proof document (PDF, PNG, JPG, WEBP)
   */
  static async uploadDocument(file) {
    if (!file) {
      throw ApiError.badRequest("No document file provided for upload.");
    }

    const fileUrl = await uploadFile(file, "documents");
    const isPdf = file.mimetype === "application/pdf";

    return {
      fileUrl,
      fileName: file.originalname,
      fileType: isPdf ? "pdf" : "image",
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}

export default UploadService;
