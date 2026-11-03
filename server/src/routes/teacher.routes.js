import { Router } from "express";
import {
  getStudentsByDivision,
  saveAttendance,
} from "../controllers/teacher.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireTeacher } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { saveAttendanceSchema } from "../validators/attendance.validator.js";

const router = Router();

// Secure all teacher routes: Requires valid JWT + Teacher or Admin role
router.use(authenticate, requireTeacher);

router.get("/students", getStudentsByDivision);
router.post("/attendance", validate(saveAttendanceSchema), saveAttendance);

export default router;
