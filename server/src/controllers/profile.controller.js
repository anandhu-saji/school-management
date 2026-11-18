import { ProfileService } from "../services/profile.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Controller: Get full profile of authenticated user
 * Route: GET /api/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const result = await ProfileService.getProfile(userId);
  return ApiResponse.ok(res, result);
});

/**
 * Controller: Submit profile changes (or direct update for admin)
 * Route: PUT /api/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const result = await ProfileService.requestProfileUpdate(userId, req.body);
  return ApiResponse.ok(res, result);
});

/**
 * Controller: Get user notifications
 * Route: GET /api/profile/notifications
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const notifications = await ProfileService.getNotifications(userId);
  return ApiResponse.ok(res, { notifications });
});

/**
 * Controller: Mark notification as read
 * Route: PATCH /api/profile/notifications/:id/read
 */
export const markNotificationRead = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { id } = req.params;
  const notification = await ProfileService.markNotificationRead(id, userId);
  return ApiResponse.ok(res, { notification });
});

/**
 * Controller: Delete notification
 * Route: DELETE /api/profile/notifications/:id
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { id } = req.params;
  await ProfileService.deleteNotification(id, userId);
  return ApiResponse.ok(res, { message: "Notification dismissed." });
});

/**
 * Admin: Get all profile update requests
 * Route: GET /api/profile/admin/requests (or GET /api/admin/profile-requests)
 */
export const getAdminProfileRequests = asyncHandler(async (req, res) => {
  const { status, role, search } = req.query;
  const result = await ProfileService.getAdminRequests({ status, role, search });
  return ApiResponse.ok(res, result);
});

/**
 * Admin: Approve profile update request
 * Route: POST /api/profile/admin/requests/:id/approve
 */
export const approveProfileRequest = asyncHandler(async (req, res) => {
  const adminUserId = req.user?._id;
  const { id } = req.params;
  const result = await ProfileService.approveRequest(id, adminUserId);
  return ApiResponse.ok(res, result);
});

/**
 * Admin: Reject profile update request
 * Route: POST /api/profile/admin/requests/:id/reject
 */
export const rejectProfileRequest = asyncHandler(async (req, res) => {
  const adminUserId = req.user?._id;
  const { id } = req.params;
  const { reason } = req.body;
  const result = await ProfileService.rejectRequest(id, adminUserId, reason);
  return ApiResponse.ok(res, result);
});
