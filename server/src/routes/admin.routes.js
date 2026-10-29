import { Router } from "express";
import {
  getAdminOverviewStats,
  getDivisionMuster,
  getTeachersRecords,
  getStudentsRecords,
  getExamTimetables,
} from "../controllers/admin.controller.js";

const router = Router();
router.get("/overview-stats", getAdminOverviewStats);
router.get("/division-muster", getDivisionMuster);
router.get("/teachers", getTeachersRecords);
router.get("/students", getStudentsRecords);
router.get("/exams", getExamTimetables);

export default router;