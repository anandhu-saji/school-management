import TeacherCrudService from "./teacher/teacherCrud.service.js";
import TeacherAttendanceService from "./teacher/teacherAttendance.service.js";
import TeacherScheduleService from "./teacher/teacherSchedule.service.js";
import TeacherMarksService from "./teacher/teacherMarks.service.js";

export class TeacherService {
  // Staff CRUD & Identity
  static getTeachersList = TeacherCrudService.getTeachersList;
  static getTeacherById = TeacherCrudService.getTeacherById;
  static createTeacher = TeacherCrudService.createTeacher;
  static updateTeacher = TeacherCrudService.updateTeacher;
  static deleteTeacher = TeacherCrudService.deleteTeacher;
  static restoreTeacher = TeacherCrudService.restoreTeacher;
  static getTeacherProfile = TeacherCrudService.getTeacherProfile;
  static changeTeacherPassword = TeacherCrudService.changeTeacherPassword;
  static purgeAllTeachers = TeacherCrudService.purgeAllTeachers;

  // Attendance & Classroom Rosters
  static getTeacherAllotment = TeacherAttendanceService.getTeacherAllotment;
  static getStudentsForTeacherRegister = TeacherAttendanceService.getStudentsForTeacherRegister;
  static saveTeacherAttendance = TeacherAttendanceService.saveTeacherAttendance;

  // Academic Schedule & Duties
  static updateTeacherAdmissionDelegation = TeacherScheduleService.updateTeacherAdmissionDelegation;
  static getTeacherScheduleAndDuties = TeacherScheduleService.getTeacherScheduleAndDuties;

  // Evaluation & Internal Marks
  static getCompletedExams = TeacherMarksService.getCompletedExams;
  static getInternalMarks = TeacherMarksService.getInternalMarks;
  static saveInternalMarks = TeacherMarksService.saveInternalMarks;
}

export default TeacherService;
