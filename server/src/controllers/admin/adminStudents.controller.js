import { StudentService } from "../../services/student.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

/**
 * Controller: Get student admission records & census stats
 * Route: GET /api/admin/students
 */
export const getStudentsRecords = asyncHandler(async (req, res) => {
  const result = await StudentService.getStudentsRecords({ limit: req.query.limit });
  return ApiResponse.ok(res, result);
});

/**
 * Controller: Create / Admit new student
 * Route: POST /api/admin/students
 */
export const createStudent = asyncHandler(async (req, res) => {
  const student = await StudentService.createStudent(req.body);
  return ApiResponse.created(res, {
    message: `Student ${student.name} admitted successfully with Sampoorna ID ${student.sampoornaId}.`,
    student,
  });
});

/**
 * Controller: Update student record
 * Route: PUT /api/admin/students/:id
 */
export const updateStudent = asyncHandler(async (req, res) => {
  const student = await StudentService.updateStudent(req.params.id, req.body);
  return ApiResponse.ok(res, {
    message: `Student ${student.name} updated successfully.`,
    student,
  });
});

/**
 * Controller: Delete student record
 * Route: DELETE /api/admin/students/:id
 */
export const deleteStudent = asyncHandler(async (req, res) => {
  await StudentService.deleteStudent(req.params.id);
  return ApiResponse.ok(res, {
    message: "Student record deleted successfully.",
  });
});

/**
 * Controller: Purge all student records permanently
 * Route: DELETE /api/admin/students/purge/all
 */
export const purgeAllStudents = asyncHandler(async (req, res) => {
  const result = await StudentService.purgeAllStudents();
  return ApiResponse.ok(res, {
    message: `All student records and accounts permanently removed (${result.deletedStudents} students, ${result.deletedAccounts} accounts).`,
    ...result,
  });
});
