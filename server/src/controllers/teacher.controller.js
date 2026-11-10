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

/**
 * Controller: Get weekly period timetable and board exam invigilation duties
 * Route: GET /api/teacher/timetable?division=Class 10-A
 */
export const getTeacherSchedule = asyncHandler(async (req, res) => {
  const { division } = req.query;
  const teacherEmail = req.user?.email;
  const result = await TeacherService.getTeacherScheduleAndDuties({
    teacherEmail,
    division,
  });

  return ApiResponse.ok(res, result);
});

/**
 * Controller: Fetch Continuous Evaluation & Internal Assessment Marks
 * Route: GET /api/teacher/internal-marks?division=Class 10-A&term=...&subject=...&type=...
 */
export const getInternalMarks = asyncHandler(async (req, res) => {
  const { division, term, subject, type } = req.query;
  const result = await TeacherService.getInternalMarks({
    division: division || "Class 10-A",
    examTerm: term || "First Terminal Examination 2026",
    subject: subject || "Mathematics",
    evaluationType: type || "Continuous Evaluation (CE)",
  });

  return ApiResponse.ok(res, result);
});

/**
 * Controller: Save & Lock Continuous Evaluation & Internal Assessment Marks
 * Route: POST /api/teacher/internal-marks
 */
export const saveInternalMarks = asyncHandler(async (req, res) => {
  const {
    classDivision,
    examTerm,
    standard,
    subject,
    evaluationType,
    maxMarks,
    passMarks,
    records,
    status,
  } = req.body;

  const teacherName = req.user?.name;
  const teacherEmail = req.user?.email;

  const result = await TeacherService.saveInternalMarks({
    classDivision,
    examTerm,
    standard,
    subject,
    evaluationType,
    maxMarks,
    passMarks,
    records,
    teacherName,
    teacherEmail,
    status,
  });

  return ApiResponse.ok(res, {
    message: `Marks for ${subject} (${examTerm}) saved successfully!`,
    evaluation: result,
  });
});

/**
 * Controller: Get authenticated teacher profile & cadre credentials
 * Route: GET /api/teacher/profile
 */
export const getTeacherProfile = asyncHandler(async (req, res) => {
  const teacherEmail = req.user?.email;
  const userId = req.user?._id;
  const teacher = await TeacherService.getTeacherProfile(teacherEmail, userId);

  return ApiResponse.ok(res, { teacher });
});


/**
 * Controller: Change / Customize teacher account password
 * Route: PUT /api/teacher/change-password
 */
export const changeTeacherPassword = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const result = await TeacherService.changeTeacherPassword({
    userId,
    currentPassword,
    newPassword,
    confirmPassword,
  });

  return ApiResponse.ok(res, result);
});
