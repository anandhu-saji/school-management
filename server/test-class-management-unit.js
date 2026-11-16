import mongoose from "mongoose";
import AcademicClass from "./src/models/AcademicClass.js";
import Student from "./src/models/Student.js";
import { ClassService } from "./src/services/class.service.js";
import { ACADEMIC_WINGS, normalizeClassDivision, getAcademicWingForClass } from "./src/utils/classData.js";
import { ApiError } from "./src/utils/ApiError.js";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`✅ [PASS] ${message}`);
}

console.log("\n=======================================================");
console.log("   RUNNING ACADEMIC CLASS & DIVISION MANAGEMENT TESTS   ");
console.log("=======================================================\n");

// 1. Verify AcademicClass Mongoose Schema Definition
console.log("--- 1. AcademicClass Schema Validation ---");
assert(AcademicClass.schema.path("id") !== undefined, "AcademicClass.id path exists");
assert(AcademicClass.schema.path("name") !== undefined, "AcademicClass.name path exists");
assert(AcademicClass.schema.path("standard") !== undefined, "AcademicClass.standard path exists");
assert(AcademicClass.schema.path("section") !== undefined, "AcademicClass.section path exists");
assert(AcademicClass.schema.path("wing") !== undefined, "AcademicClass.wing path exists");
assert(AcademicClass.schema.path("wingShort") !== undefined, "AcademicClass.wingShort path exists");
assert(AcademicClass.schema.path("wingCode") !== undefined, "AcademicClass.wingCode path exists");
assert(AcademicClass.schema.path("stream") !== undefined, "AcademicClass.stream path exists");
assert(AcademicClass.schema.path("mentor") !== undefined, "AcademicClass.mentor path exists");
assert(AcademicClass.schema.path("room") !== undefined, "AcademicClass.room path exists");
assert(AcademicClass.schema.path("maxCapacity") !== undefined, "AcademicClass.maxCapacity path exists");
assert(AcademicClass.schema.path("isDeleted") !== undefined, "AcademicClass has soft-delete 'isDeleted' field");
assert(AcademicClass.schema.path("deletedAt") !== undefined, "AcademicClass has soft-delete 'deletedAt' field");
assert(typeof AcademicClass.prototype.softDelete === "function", "AcademicClass has softDelete() instance method");
assert(typeof AcademicClass.prototype.restore === "function", "AcademicClass has restore() instance method");

// 2. Test Canonical Name & ID Resolution Logic
console.log("\n--- 2. Canonical Standard, Section & Wing Resolution ---");

// Test LP School Class 4-C
const wingLP = getAcademicWingForClass("Class 4-C");
assert(wingLP === "LP School", `getAcademicWingForClass("Class 4-C") resolves to "LP School" (got: ${wingLP})`);

// Test UP School Class 6-C
const wingUP = getAcademicWingForClass("Class 6-C");
assert(wingUP === "UP School", `getAcademicWingForClass("Class 6-C") resolves to "UP School" (got: ${wingUP})`);

// Test High School Class 10-C
const wingHS = getAcademicWingForClass("Class 10-C");
assert(wingHS === "High School", `getAcademicWingForClass("Class 10-C") resolves to "High School" (got: ${wingHS})`);

// Test Higher Secondary Class 12-Vocational
const wingHSE = getAcademicWingForClass("Class 12-Vocational");
assert(wingHSE === "Higher Secondary", `getAcademicWingForClass("Class 12-Vocational") resolves to "Higher Secondary" (got: ${wingHSE})`);

// Test normalizeClassDivision with new dynamic classes
const norm10C = normalizeClassDivision("10-C");
assert(norm10C && norm10C.name === "Class 10-C" && norm10C.id === "10-C", `normalizeClassDivision("10-C") parses canonical name properly (got: ${norm10C?.name})`);

const norm12Sci = normalizeClassDivision("12-Science");
assert(norm12Sci && norm12Sci.name === "Class 12-Science", `normalizeClassDivision("12-Science") parses to "Class 12-Science"`);

const normCustomVoc = normalizeClassDivision("Class 12-Vocational");
assert(normCustomVoc && normCustomVoc.name === "Class 12-Vocational", `normalizeClassDivision("Class 12-Vocational") parses to "Class 12-Vocational"`);

// 3. Mocked ClassService Unit Tests (isolated from live MongoDB)
console.log("\n--- 3. ClassService Business Logic & Validation Guard Tests ---");

// Test: Validation for missing standard / section
let caughtBadRequest = false;
try {
  await ClassService.createClass({ standard: "", section: "" });
} catch (err) {
  caughtBadRequest = true;
  assert(err instanceof ApiError && err.statusCode === 400, "ClassService.createClass() throws 400 Bad Request on missing fields");
}
assert(caughtBadRequest, "Missing fields check was triggered");

// Test: Validation for invalid ObjectId in updateClass
let caughtInvalidUpdateId = false;
try {
  await ClassService.updateClass("not-an-id", { room: "Room 101" });
} catch (err) {
  caughtInvalidUpdateId = true;
  assert(err instanceof ApiError && err.statusCode === 400, "ClassService.updateClass() throws 400 on invalid ObjectId");
}
assert(caughtInvalidUpdateId, "Invalid update ID check triggered");

// Test: Validation for invalid ObjectId in deleteClass
let caughtInvalidDeleteId = false;
try {
  await ClassService.deleteClass("not-an-id");
} catch (err) {
  caughtInvalidDeleteId = true;
  assert(err instanceof ApiError && err.statusCode === 400, "ClassService.deleteClass() throws 400 on invalid ObjectId");
}
assert(caughtInvalidDeleteId, "Invalid delete ID check triggered");

// 4. Test Class Creation & Duplicate Handling Logic
console.log("\n--- 4. ClassService Creation, Duplicate Prevention & Restoration ---");

const originalFindOne = AcademicClass.findOne;
const originalCreate = AcademicClass.create;
const originalCount = Student.countDocuments;
const originalFindById = AcademicClass.findById;

// Case 4.1: Creating a brand new class
let createdDoc = null;
AcademicClass.findOne = () => ({
  setOptions: () => Promise.resolve(null), // simulate not found
});
AcademicClass.create = async (doc) => {
  createdDoc = { ...doc, _id: new mongoose.Types.ObjectId() };
  return createdDoc;
};

const newClassResult = await ClassService.createClass({
  standard: "Class 10",
  section: "C",
  wing: "High School Section",
  wingShort: "High School",
  wingCode: "high_school",
  stream: "General",
  room: "Room 18 (Main Academic Block)",
  mentor: "Sri. K. R. Harikrishnan",
  maxCapacity: 45,
});

assert(newClassResult.id === "10-C", `Class created with canonical id '10-C' (got: ${newClassResult.id})`);
assert(newClassResult.name === "Class 10-C", `Class created with canonical name 'Class 10-C' (got: ${newClassResult.name})`);
assert(newClassResult.wingCode === "high_school", "Class assigned to high_school wing");
assert(newClassResult.isCustom === true, "Class marked as isCustom: true");

// Case 4.2: Duplicate class detection
AcademicClass.findOne = () => ({
  setOptions: () => Promise.resolve({ isDeleted: false, name: "Class 10-C" }), // simulate already exists active
});

let caughtConflict = false;
try {
  await ClassService.createClass({ standard: "Class 10", section: "C" });
} catch (err) {
  caughtConflict = true;
  assert(err instanceof ApiError && err.statusCode === 409, "ClassService.createClass() throws 409 Conflict on duplicate class");
}
assert(caughtConflict, "Duplicate detection was triggered");

// Case 4.3: Soft-deleted class restoration
let restored = false;
let saved = false;
const mockDeletedClass = {
  isDeleted: true,
  name: "Class 10-C",
  restore: async () => { restored = true; mockDeletedClass.isDeleted = false; },
  save: async () => { saved = true; },
};
AcademicClass.findOne = () => ({
  setOptions: () => Promise.resolve(mockDeletedClass),
});

const restoredClass = await ClassService.createClass({
  standard: "Class 10",
  section: "C",
  room: "New Block Room 2",
});

assert(restored, "Previously soft-deleted class triggered restore()");
assert(saved, "Restored class saved with updated attributes");
assert(mockDeletedClass.room === "New Block Room 2", "Restored class received updated room details");

// 5. Test Safety Guard on Class Deletion (Cannot delete class with active students)
console.log("\n--- 5. Student Enrollment Deletion Guard ---");

const testClassId = new mongoose.Types.ObjectId();
AcademicClass.findById = async () => ({
  _id: testClassId,
  name: "Class 10-C",
  id: "10-C",
  softDelete: async () => { return true; },
});

// Case 5.1: 5 students enrolled -> deletion BLOCKED
Student.countDocuments = async () => 5;
let caughtGuardError = false;
try {
  await ClassService.deleteClass(testClassId.toString());
} catch (err) {
  caughtGuardError = true;
  assert(err instanceof ApiError && err.statusCode === 400, "ClassService.deleteClass() returns 400 when students are enrolled");
  assert(err.message.includes("5 students are currently enrolled"), "Guard error message accurately reports enrolled count");
}
assert(caughtGuardError, "Safety guard prevented deletion of populated class");

// Case 5.2: 0 students enrolled -> deletion SUCCEEDS
let softDeletedCalled = false;
AcademicClass.findById = async () => ({
  _id: testClassId,
  name: "Class 10-C",
  id: "10-C",
  softDelete: async () => { softDeletedCalled = true; return true; },
});
Student.countDocuments = async () => 0;

await ClassService.deleteClass(testClassId.toString());
assert(softDeletedCalled, "Soft-delete executed cleanly when 0 students enrolled in division");

// Restore mocked functions
AcademicClass.findOne = originalFindOne;
AcademicClass.create = originalCreate;
Student.countDocuments = originalCount;
AcademicClass.findById = originalFindById;

console.log("\n=======================================================");
console.log("   ALL ACADEMIC CLASS MANAGEMENT TESTS PASSED (100%)   ");
console.log("=======================================================\n");
