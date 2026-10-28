import { Router } from "express";
import {
  getStudentsByDivision,
  saveAttendance,
} from "../controllers/teacher.controller.js";

const router = Router();

router.get("/students", getStudentsByDivision);
router.post("/attendance", saveAttendance);

export default router;