import express from "express";
import {
  uploadProfileAvatar,
  uploadDocumentFile,
} from "../controllers/upload.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  uploadAvatar,
  uploadDocument,
} from "../middleware/upload.middleware.js";

const router = express.Router();

// POST /api/upload/avatar (multipart/form-data with key 'avatar')
router.post(
  "/avatar",
  authenticate,
  uploadAvatar.single("avatar"),
  uploadProfileAvatar
);

// POST /api/upload/document (multipart/form-data with key 'document') - Supports Images & PDF
router.post(
  "/document",
  authenticate,
  uploadDocument.single("document"),
  uploadDocumentFile
);

export default router;
