import { ExamService } from "../../services/exam.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

/**
 * Controller: Get exam timetables & statistics
 * Route: GET /api/admin/exams
 */
export const getExamTimetables = asyncHandler(async (req, res) => {
  const result = await ExamService.getExamTimetables();
  return ApiResponse.ok(res, result);
});

/**
 * Controller: Schedule new examination session
 * Route: POST /api/admin/exams
 */
export const createExam = asyncHandler(async (req, res) => {
  const exam = await ExamService.createExam(req.body);
  return ApiResponse.created(res, {
    message: `New exam paper ${exam.subject} scheduled successfully!`,
    exam,
  });
});

/**
 * Controller: Update exam schedule details
 * Route: PUT /api/admin/exams/:id
 */
export const updateExam = asyncHandler(async (req, res) => {
  const exam = await ExamService.updateExam(req.params.id, req.body);
  return ApiResponse.ok(res, {
    message: `Updated schedule for ${exam.subject}!`,
    exam,
  });
});

/**
 * Controller: Delete examination schedule
 * Route: DELETE /api/admin/exams/:id
 */
export const deleteExam = asyncHandler(async (req, res) => {
  await ExamService.deleteExam(req.params.id);
  return ApiResponse.ok(res, {
    message: "Exam schedule deleted successfully.",
  });
});

/**
 * Controller: Purge all examination schedules permanently
 * Route: DELETE /api/admin/exams/purge/all
 */
export const purgeAllExams = asyncHandler(async (req, res) => {
  const result = await ExamService.purgeAllExams();
  return ApiResponse.ok(res, {
    message: `All examination timetables permanently removed (${result.deletedExams} records).`,
    ...result,
  });
});

/**
 * Controller: Get hall seating plan for an exam
 * Route: GET /api/admin/exams/:id/seating
 */
export const getExamSeatingPlan = asyncHandler(async (req, res) => {
  const seatingPlan = await ExamService.getExamSeatingPlan(req.params.id);
  return ApiResponse.ok(res, { seatingPlan });
});
