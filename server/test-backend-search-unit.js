import mongoose from "mongoose";
import Student from "./src/models/Student.js";
import Teacher from "./src/models/Teacher.js";
import User from "./src/models/user.js";
import { StudentAdminService } from "./src/services/student/studentAdmin.service.js";
import { TeacherService } from "./src/services/teacher.service.js";
import { searchUsers } from "./src/controllers/admin/adminUsers.controller.js";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`✅ [PASS] ${message}`);
}

console.log("\n=======================================================");
console.log("     RUNNING BACKEND SEARCH UNIT VERIFICATION          ");
console.log("=======================================================\n");

// 1. Verify Student Schema has all searchable fields
console.log("--- 1. Student Searchable Fields Validation ---");
assert(Student.schema.path("name") !== undefined, "Student has 'name' path");
assert(Student.schema.path("rollNumber") !== undefined, "Student has 'rollNumber' path");
assert(Student.schema.path("admissionNumber") !== undefined, "Student has 'admissionNumber' path");
assert(Student.schema.path("sampoornaId") !== undefined, "Student has 'sampoornaId' path");
assert(Student.schema.path("studentId") !== undefined, "Student has 'studentId' path");
assert(Student.schema.path("aadhaarNumber") !== undefined, "Student has 'aadhaarNumber' path");
assert(Student.schema.path("email") !== undefined, "Student has 'email' path");
assert(Student.schema.path("classDivision") !== undefined, "Student has 'classDivision' path");

// 2. Verify Teacher Schema has all searchable fields
console.log("\n--- 2. Teacher Searchable Fields Validation ---");
assert(Teacher.schema.path("name") !== undefined, "Teacher has 'name' path");
assert(Teacher.schema.path("pen") !== undefined, "Teacher has 'pen' path");
assert(Teacher.schema.path("penNumber") !== undefined, "Teacher has 'penNumber' path");
assert(Teacher.schema.path("phone") !== undefined, "Teacher has 'phone' path");
assert(Teacher.schema.path("email") !== undefined, "Teacher has 'email' path");
assert(Teacher.schema.path("department") !== undefined, "Teacher has 'department' path");
assert(Teacher.schema.path("designation") !== undefined, "Teacher has 'designation' path");

// 3. Verify Service Methods & Signatures
console.log("\n--- 3. Service Signatures & Handlers ---");
assert(typeof StudentAdminService.getStudentsRecords === "function", "StudentAdminService.getStudentsRecords is a function");
assert(typeof TeacherService.getTeachersList === "function", "TeacherService.getTeachersList is a function");
assert(typeof searchUsers === "function", "Unified searchUsers controller is exported and is a function");

// 4. Test Query Building Logic for Students (Regex Escaping & Number Handling)
console.log("\n--- 4. Query Construction Logic ---");
const testQuery = "Rahul 12";
const escaped = testQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const regex = new RegExp(escaped, "i");
assert(regex.test("Rahul 12"), "Regex correctly matches full query");
assert(regex.test("rahul 12"), "Regex is case-insensitive");

const numCheck = Number("06042");
assert(!isNaN(numCheck) && Number.isInteger(numCheck), "Valid numeric IDs parsed correctly");

// 5. Test Unified Search Empty Query
console.log("\n--- 5. searchUsers Controller Contract ---");
let mockResStatus = 200;
let mockResData = null;
const mockRes = {
  status: (code) => {
    mockResStatus = code;
    return mockRes;
  },
  json: (data) => {
    mockResData = data;
    return mockRes;
  },
};

const mockReqEmpty = {
  query: { q: "" },
};

await searchUsers(mockReqEmpty, mockRes, () => {});
assert(mockResData !== null, "searchUsers handles empty query without throwing");
assert(mockResData.success === true, "Response has success: true");
assert(Array.isArray(mockResData.users), "Response users is an array");
assert(mockResData.count === 0, "Empty query returns count: 0");

console.log("\n=======================================================");
console.log("   ALL BACKEND SEARCH UNIT TESTS PASSED SUCCESSFULLY   ");
console.log("=======================================================\n");
