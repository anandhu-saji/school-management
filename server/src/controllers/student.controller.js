import { StudentService } from "../services/student.service.js";
import Student from "../models/Student.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Controller: Fetch student profile details, identity dossier, and real-time attendance statistics
 * Route: GET /api/student/dashboard-data
 */
export const getStudentDashboardData = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const email = req.user?.email;

  const data = await StudentService.getStudentMetrics({
    userId,
    email,
  });

  return ApiResponse.ok(res, { data });
});

/**
 * Controller: Fetch published exam timetables and hall tickets for the logged-in student
 * Route: GET /api/student/exams
 */
export const getStudentExamsData = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const email = req.user?.email;

  let student = null;
  if (userId) student = await Student.findOne({ userId }).lean();
  if (!student && email) student = await Student.findOne({ email: email.toLowerCase() }).lean();

  const exams = await StudentService.getStudentExams({
    className: student?.className || "Class 10-A",
    classDivision: student?.classDivision || "10-A",
  });

  return ApiResponse.ok(res, { exams });
});

/**
 * Controller: Fetch fee payment history, ledger receipts, and due balance for the logged-in student
 * Route: GET /api/student/fees
 */
export const getStudentFeesData = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const email = req.user?.email;

  let student = null;
  if (userId) student = await Student.findOne({ userId }).lean();
  if (!student && email) student = await Student.findOne({ email: email.toLowerCase() }).lean();

  const feeData = await StudentService.getStudentFees({
    studentId: student?.studentId,
    admissionNumber: student?.admissionNumber,
    studentName: student?.name,
    studentMongoId: student?._id,
  });

  return ApiResponse.ok(res, feeData);
});
