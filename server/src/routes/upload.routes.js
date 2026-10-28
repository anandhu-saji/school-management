import express from "express";
import { uploadProfileAvatar } from "../controllers/upload.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { uploadAvatar } from "../middleware/upload.middleware.js";

const router = express.Router();

// POST /api/upload/avatar (multipart/form-data with key 'avatar')
router.post(
  "/avatar",
  authenticate,
  uploadAvatar.single("avatar"),
  uploadProfileAvatar
);

export default router;