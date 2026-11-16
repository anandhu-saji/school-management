import mongoose from "mongoose";
import { softDeletePlugin } from "./src/plugins/softDelete.plugin.js";
import User from "./src/models/user.js";
import Student from "./src/models/Student.js";
import Teacher from "./src/models/Teacher.js";
import Exam from "./src/models/Exam.js";
import FeePayment from "./src/models/FeePayment.js";
import Attendance from "./src/models/Attendance.js";
import InternalMark from "./src/models/InternalMark.js";

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`[PASS] ${message}`);
}

console.log("\n=======================================================");
console.log("     RUNNING SOFT DELETE PLUGIN UNIT VERIFICATION      ");
console.log("=======================================================\n");

// 1. Verify plugin schema fields
const testSchema = new mongoose.Schema({ name: String });
testSchema.plugin(softDeletePlugin);

assert(testSchema.path("isDeleted") !== undefined, "isDeleted field registered on schema");
assert(testSchema.path("isDeleted").instance === "Boolean", "isDeleted is a Boolean");
assert(testSchema.path("isDeleted").defaultValue === false, "isDeleted default is false");
assert(testSchema.path("deletedAt") !== undefined, "deletedAt field registered on schema");
assert(testSchema.path("deletedAt").instance === "Date", "deletedAt is a Date");
assert(testSchema.path("deletedBy") !== undefined, "deletedBy field registered on schema");

// 2. Verify instance methods exist
assert(typeof testSchema.methods.softDelete === "function", "softDelete instance method attached");
assert(typeof testSchema.methods.restore === "function", "restore instance method attached");

// 3. Verify static methods exist
assert(typeof testSchema.statics.softDelete === "function", "softDelete static method attached");
assert(typeof testSchema.statics.softDeleteById === "function", "softDeleteById static method attached");
assert(typeof testSchema.statics.restore === "function", "restore static method attached");
assert(typeof testSchema.statics.restoreById === "function", "restoreById static method attached");
assert(typeof testSchema.statics.findDeleted === "function", "findDeleted static method attached");
assert(typeof testSchema.statics.findWithDeleted === "function", "findWithDeleted static method attached");

// 4. Verify query helper methods
assert(typeof testSchema.query.includeDeleted === "function", "includeDeleted query helper attached");
assert(typeof testSchema.query.onlyDeleted === "function", "onlyDeleted query helper attached");

// 5. Test model compilation & query filtering hooks
const DummyModel = mongoose.model("SoftDeleteDummyTest", testSchema);
const findHook = testSchema.s.hooks._pres.get("find")[0].fn;

// Standard find query
const standardFind = DummyModel.find();
findHook.call(standardFind);
assert(
  JSON.stringify(standardFind.getFilter()).includes('"isDeleted":{"$ne":true}'),
  "Standard find() query excludes isDeleted: true"
);

// Explicit find with isDeleted: true
const explicitFind = DummyModel.find({ isDeleted: true });
findHook.call(explicitFind);
assert(
  explicitFind.getFilter().isDeleted === true,
  "Explicit find({ isDeleted: true }) retains isDeleted: true without overriding"
);

// Query with includeDeleted: true
const withDeletedQuery = DummyModel.find().setOptions({ includeDeleted: true });
findHook.call(withDeletedQuery);
assert(
  withDeletedQuery.getFilter().isDeleted === undefined,
  "Query with includeDeleted: true does not inject isDeleted filter"
);

// findDeleted helper
const findDeletedQuery = DummyModel.findDeleted();
findHook.call(findDeletedQuery);
assert(
  findDeletedQuery.getFilter().isDeleted === true,
  "findDeleted() properly queries isDeleted: true"
);

// findWithDeleted helper
const findWithDeletedQuery = DummyModel.findWithDeleted();
findHook.call(findWithDeletedQuery);
assert(
  findWithDeletedQuery.getOptions().includeDeleted === true,
  "findWithDeleted() properly sets includeDeleted: true option"
);

// 6. Test Aggregation pipeline filter hook
const aggHook = testSchema.s.hooks._pres.get("aggregate")[0].fn;
const agg = DummyModel.aggregate([{ $project: { name: 1 } }]);
aggHook.call(agg);
const pipeline = agg.pipeline();
assert(
  pipeline[0].$match && pipeline[0].$match.isDeleted && pipeline[0].$match.isDeleted.$ne === true,
  "Aggregation pipeline unshifts { $match: { isDeleted: { $ne: true } } }"
);

// Aggregation with includeDeleted option
const aggWithDeleted = DummyModel.aggregate([{ $project: { name: 1 } }]);
aggWithDeleted.options = { includeDeleted: true };
aggHook.call(aggWithDeleted);
assert(
  aggWithDeleted.pipeline().length === 1,
  "Aggregation with includeDeleted: true preserves original pipeline"
);

// 7. Verify all actual project models have soft delete capabilities attached
const models = [
  { name: "User", model: User },
  { name: "Student", model: Student },
  { name: "Teacher", model: Teacher },
  { name: "Exam", model: Exam },
  { name: "FeePayment", model: FeePayment },
  { name: "Attendance", model: Attendance },
  { name: "InternalMark", model: InternalMark },
];

console.log("\n--- Checking Project Models ---");
for (const { name, model } of models) {
  assert(model.schema.path("isDeleted") !== undefined, `${name} has 'isDeleted' field`);
  assert(model.schema.path("deletedAt") !== undefined, `${name} has 'deletedAt' field`);
  assert(typeof model.prototype.softDelete === "function", `${name} has 'softDelete()' method`);
  assert(typeof model.prototype.restore === "function", `${name} has 'restore()' method`);
  assert(typeof model.softDeleteById === "function", `${name} has 'softDeleteById()' static method`);
  assert(typeof model.restoreById === "function", `${name} has 'restoreById()' static method`);
}

console.log("\n=======================================================");
console.log("       ALL SOFT DELETE UNIT CHECKS PASSED (100%)       ");
console.log("=======================================================\n");
