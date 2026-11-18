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
    const user = await User.findById(userId);
    const userEmail = user?.email?.toLowerCase()?.trim();

    if (userRole === "teacher") {
      let teacher = await Teacher.findOne({
        $or: [{ userId }, ...(userEmail ? [{ email: userEmail }] : [])],
      });
      if (teacher?.avatarUrl) {
        await deleteImageFromS3(teacher.avatarUrl);
      }
      if (teacher) {
        teacher.avatarUrl = avatarUrl;
        if (!teacher.userId && userId) teacher.userId = userId;
        await teacher.save();
      }
    } else if (userRole === "student" || userRole === "user") {
      let student = await Student.findOne({
        $or: [{ userId }, ...(userEmail ? [{ email: userEmail }] : [])],
      });
      if (student?.avatarUrl) {
        await deleteImageFromS3(student.avatarUrl);
      }
      if (student) {
        student.avatarUrl = avatarUrl;
        if (!student.userId && userId) student.userId = userId;
        await student.save();
      }
    }

    if (user?.avatarUrl && user.avatarUrl !== avatarUrl) {
      await deleteImageFromS3(user.avatarUrl);
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
