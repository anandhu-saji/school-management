import { AttendanceService } from "../../services/attendance.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

/**
 * Controller: Get Admin Overview Dashboard KPI Stats
 * Route: GET /api/admin/overview-stats
 */
export const getAdminOverviewStats = asyncHandler(async (req, res) => {
  const stats = await AttendanceService.getOverviewStats();
  return ApiResponse.ok(res, { stats, sections: stats.sections });
});

/**
 * Controller: Get Division Muster Register across all 26 classes
 * Route: GET /api/admin/division-muster
 */
export const getDivisionMuster = asyncHandler(async (req, res) => {
  const divisions = await AttendanceService.getDivisionMuster();
  return ApiResponse.ok(res, { divisions });
});

/**
 * Controller: Get Class Attendance Register for a specific division and date
 * Route: GET /api/admin/attendance/register?division=Class 10-A&date=YYYY-MM-DD
 */
export const getDivisionAttendanceRegister = asyncHandler(async (req, res) => {
  const { division, date } = req.query;
  const result = await AttendanceService.getDivisionAttendanceRegister({ division, date });
  return ApiResponse.ok(res, result);
});

/**
 * Controller: Record and lock division attendance register from admin console
 * Route: POST /api/admin/attendance/register
 */
export const saveDivisionAttendanceRegister = asyncHandler(async (req, res) => {
  const { date, classDivision, records } = req.body;
  const doc = await AttendanceService.saveDivisionAttendanceRegister({ date, classDivision, records });

  return ApiResponse.ok(res, {
    message: `Attendance for ${classDivision || "Class"} on ${date} saved and locked successfully!`,
    attendance: doc,
  });
});
