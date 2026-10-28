import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a file buffer directly to AWS S3
 * @param {Express.Multer.File} file 
 * @param {string} folder 
 * @returns {Promise<string>} public S3 URL
 */
export const uploadImageToS3 = async (file, folder = "avatars") => {
  if (!file) throw new Error("No file provided for S3 upload.");

  const fileExtension = path.extname(file.originalname);
  const randomFileName = `${folder}/${crypto.randomUUID()}${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: randomFileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${randomFileName}`;
};

/**
 * Deletes an object from AWS S3 using its full URL
 * @param {string} fileUrl 
 */
export const deleteImageFromS3 = async (fileUrl) => {
  if (!fileUrl) return;
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // removes leading '/'

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Failed to delete S3 asset:", error.message);
  }
};