import { StudentMetricsService } from "./student/studentMetrics.service.js";
import { StudentExamsService } from "./student/studentExams.service.js";
import { StudentFeesService } from "./student/studentFees.service.js";
import { StudentAdminService } from "./student/studentAdmin.service.js";

/**
 * Unified Student Service Facade
 * Delegates domain operations to modular sub-services:
 * - StudentMetricsService: Student portal metrics, attendance tracking, dossier
 * - StudentExamsService: Published exam timetables, hall passes
 * - StudentFeesService: Student fee ledger, transaction receipts, dues calculation
 * - StudentAdminService: Administrative census query, student CRUD & KYC registration
 */
export class StudentService {
  // Student Portal Operations
  static getStudentMetrics = StudentMetricsService.getStudentMetrics;
  static getStudentExams = StudentExamsService.getStudentExams;
  static getStudentFees = StudentFeesService.getStudentFees;

  // Administrative Operations
  static getStudentsRecords = StudentAdminService.getStudentsRecords;
  static getStudentById = StudentAdminService.getStudentById;
  static createStudent = StudentAdminService.createStudent;
  static updateStudent = StudentAdminService.updateStudent;
  static deleteStudent = StudentAdminService.deleteStudent;
}

export {
  StudentMetricsService,
  StudentExamsService,
  StudentFeesService,
  StudentAdminService,
};

export default StudentService;
