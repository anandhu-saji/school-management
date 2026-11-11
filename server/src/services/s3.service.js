import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";
import fs from "fs";

/**
 * Instantiates and caches the S3 client using current environment credentials
 */
const getS3Client = () => {
  return new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  });
};

/**
 * Checks if real AWS S3 credentials are configured
 */
const isAwsConfigured = () => {
  const key = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secret = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.AWS_S3_BUCKET_NAME?.trim();

  return Boolean(
    key &&
    !key.includes("your_aws") &&
    secret &&
    !secret.includes("your_aws") &&
    bucket &&
    !bucket.includes("your_s3")
  );
};

/**
 * Uploads a file buffer (Image, PDF, or Document) to AWS S3, or falls back to local uploads folder
 * @param {Express.Multer.File} file 
 * @param {string} folder 
 * @returns {Promise<string>} public S3 URL or relative local path /uploads/...
 */
export const uploadFile = async (file, folder = "documents") => {
  if (!file) throw new Error("No file provided for upload.");

  if (isAwsConfigured()) {
    try {
      const fileExtension = path.extname(file.originalname);
      const randomFileName = `${folder}/${crypto.randomUUID()}${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: randomFileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await getS3Client().send(command);

      const region = process.env.AWS_REGION || "ap-south-1";
      return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${randomFileName}`;
    } catch (s3Err) {
      console.warn("AWS S3 upload failed, falling back to local file storage:", s3Err.message);
    }
  }

  // Graceful local disk fallback
  const uploadDir = path.resolve("uploads", folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileExtension = path.extname(file.originalname);
  const safeBaseName = path
    .basename(file.originalname, fileExtension)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 30);
  const randomFileName = `${Date.now()}_${safeBaseName}_${crypto.randomBytes(4).toString("hex")}${fileExtension}`;
  const filePath = path.join(uploadDir, randomFileName);

  fs.writeFileSync(filePath, file.buffer);

  return `/uploads/${folder}/${randomFileName}`;
};

/**
 * Uploads an avatar image buffer directly
 */
export const uploadImageToS3 = async (file, folder = "avatars") => {
  return uploadFile(file, folder);
};

/**
 * Deletes an object from AWS S3 or local storage (with path traversal security check)
 * @param {string} fileUrl 
 */
export const deleteImageFromS3 = async (fileUrl) => {
  if (!fileUrl) return;
  try {
    if (fileUrl.startsWith("/uploads/")) {
      const uploadsDir = path.resolve("uploads");
      const localPath = path.resolve(fileUrl.replace(/^\//, ""));
      if (localPath.startsWith(uploadsDir) && fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
      return;
    }

    if (isAwsConfigured()) {
      const url = new URL(fileUrl);
      const key = url.pathname.substring(1);

      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
      });

      await getS3Client().send(command);
    }
  } catch (error) {
    console.error("Failed to delete asset:", error.message);
  }
};
