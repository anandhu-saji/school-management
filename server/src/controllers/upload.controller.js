import { UploadService } from "../services/upload.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Controller: Uploads user profile picture avatar
 * Route: POST /api/upload/avatar
 */
export const uploadProfileAvatar = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;

  const result = await UploadService.uploadAvatar(req.file, { userId, userRole });

  return ApiResponse.ok(res, {
    message: "Avatar uploaded and saved successfully.",
    ...result,
  });
});

/**
 * Controller: Uploads student KYC / statutory ID proof document (PDF, PNG, JPG, WEBP)
 * Route: POST /api/upload/document
 */
export const uploadDocumentFile = asyncHandler(async (req, res) => {
  const result = await UploadService.uploadDocument(req.file);

  return ApiResponse.ok(res, {
    message: "Document uploaded successfully.",
    ...result,
  });
});
