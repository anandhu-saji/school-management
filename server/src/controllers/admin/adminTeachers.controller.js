import { TeacherService } from "../../services/teacher.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

/**
 * Controller: Get Teachers Records & Cadre Statistics
 * Route: GET /api/admin/teachers
 */
export const getTeachersRecords = asyncHandler(async (req, res) => {
  const result = await TeacherService.getTeachersList();
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
 * Controller: Remove a teacher record
 * Route: DELETE /api/admin/teachers/:id
 */
export const deleteTeacher = asyncHandler(async (req, res) => {
  await TeacherService.deleteTeacher(req.params.id);
  return ApiResponse.ok(res, {
    message: "Teacher record deleted successfully.",
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
