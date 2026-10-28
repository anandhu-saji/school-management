import { StudentService } from "../services/student.service.js";

/**
 * Controller: Fetch student profile details and real-time attendance statistics
 * Route: GET /api/student/dashboard-data
 */
export const getStudentDashboardData = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const email = req.user?.email;

    const data = await StudentService.getStudentMetrics({
      userId,
      email,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};