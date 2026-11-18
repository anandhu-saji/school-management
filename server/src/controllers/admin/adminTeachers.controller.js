import { TeacherService } from "../../services/teacher.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

/**
 * Controller: Get Teachers Records & Cadre Statistics
 * Route: GET /api/admin/teachers
 */
export const getTeachersRecords = asyncHandler(async (req, res) => {
  const result = await TeacherService.getTeachersList({
    search: req.query.search || req.query.q || "",
    department: req.query.department || "",
    page: req.query.page,
    pageSize: req.query.pageSize || req.query.limit,
    includeDeleted: req.query.includeDeleted === "true",
    deletedOnly: req.query.deletedOnly === "true" || req.query.status === "deleted",
  });
  return ApiResponse.ok(res, result);
});

/**
 * Controller: Register a new teacher
 * Route: POST /api/admin/teachers
 */
export const createTeacher = asyncHandler(async (req, res) => {
  const teacher = await TeacherService.createTeacher(req.body);
  return ApiResponse.created(res, {
    message: `Teacher ${teacher.name} registered successfully with PEN ${teacher.penNumber}.`,
    teacher,
  });
});

/**
 * Controller: Update teacher profile details
 * Route: PUT /api/admin/teachers/:id
 */
export const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await TeacherService.updateTeacher(req.params.id, req.body);
  return ApiResponse.ok(res, {
    message: `Teacher ${teacher.name} updated successfully.`,
    teacher,
  });
});

/**
 * Controller: Update temporary student admission admin delegation for a teacher
 * Route: PUT /api/admin/teachers/:id/admission-admin
 */
export const updateTeacherAdmissionDelegation = asyncHandler(async (req, res) => {
  const adminUserId = req.user?._id;
  const teacher = await TeacherService.updateTeacherAdmissionDelegation(
    req.params.id,
    req.body,
    adminUserId
  );
  return ApiResponse.ok(res, {
    message: teacher.isAdmissionAdmin
      ? `Teacher ${teacher.name} has been designated as Temporary Admission Administrator.`
      : `Temporary Admission Administrator delegation for ${teacher.name} has been revoked.`,
    teacher,
  });
});

/**
 * Controller: Soft-delete a teacher record (moves to trash)
 * Route: DELETE /api/admin/teachers/:id
 */
export const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await TeacherService.deleteTeacher(req.params.id, req.user?._id || req.user?.email);
  return ApiResponse.ok(res, {
    message: `Teacher ${teacher.name} moved to trash (soft-deleted).`,
    teacher,
  });
});

/**
 * Controller: Restore a soft-deleted teacher record from trash
 * Route: POST /api/admin/teachers/:id/restore
 */
export const restoreTeacher = asyncHandler(async (req, res) => {
  const teacher = await TeacherService.restoreTeacher(req.params.id);
  return ApiResponse.ok(res, {
    message: `Teacher ${teacher.name} restored successfully from trash.`,
    teacher,
  });
});

/**
 * Controller: Get teacher's weekly subject & period timetable allotment
 * Route: GET /api/admin/teachers/:id/allotment
 */
export const getTeacherAllotment = asyncHandler(async (req, res) => {
  const allotment = await TeacherService.getTeacherAllotment(req.params.id);
  return ApiResponse.ok(res, { allotment });
});

/**
 * Controller: Purge all teacher records and accounts permanently
 * Route: DELETE /api/admin/teachers/purge/all
 */
export const purgeAllTeachers = asyncHandler(async (req, res) => {
  const result = await TeacherService.purgeAllTeachers();
  return ApiResponse.ok(res, {
    message: "All teacher records and accounts purged successfully.",
    ...result,
  });
});
