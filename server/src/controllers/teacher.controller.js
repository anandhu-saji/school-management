import { TeacherService } from "../services/teacher.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Controller: Fetch teacher profile, student roster, and attendance status for a division and date
 * Route: GET /api/teacher/students?division=Class 10-A&date=YYYY-MM-DD
 */
export const getStudentsByDivision = asyncHandler(async (req, res) => {
  const { division, date } = req.query;
  const result = await TeacherService.getStudentsForTeacherRegister({ division, date });

  return ApiResponse.ok(res, result);
});

/**
 * Controller: Record and lock class attendance (enforcing KER Sunday Rule and student stat sync)
 * Route: POST /api/teacher/attendance
 */
export const saveAttendance = asyncHandler(async (req, res) => {
  const { date, classDivision, records } = req.body;
  const result = await TeacherService.saveTeacherAttendance({ date, classDivision, records });

  return ApiResponse.ok(res, {
    message: `Attendance for ${classDivision || "Class"} on ${date} saved and locked successfully!`,
    ...result,
  });
});
