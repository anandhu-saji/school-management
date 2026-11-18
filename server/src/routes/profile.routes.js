import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationRead,
  deleteNotification,
  getAdminProfileRequests,
  approveProfileRequest,
  rejectProfileRequest,
} from "../controllers/profile.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/role.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Current user profile endpoints
router.get("/", getProfile);
router.put("/", updateProfile);

// Notifications endpoints
router.get("/notifications", getNotifications);
router.patch("/notifications/:id/read", markNotificationRead);
router.delete("/notifications/:id", deleteNotification);

// Admin-only endpoints for reviewing profile update requests
router.get("/admin/requests", requireAdmin, getAdminProfileRequests);
router.post("/admin/requests/:id/approve", requireAdmin, approveProfileRequest);
router.post("/admin/requests/:id/reject", requireAdmin, rejectProfileRequest);

export default router;
