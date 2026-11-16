import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import Student from "../../models/Student.js";
import Teacher from "../../models/Teacher.js";
import User from "../../models/user.js";

/**
 * Controller: Unified User Search across all roles (Students, Teachers, Admins)
 * Route: GET /api/admin/users/search
 * Query Params:
 *  - q / search: Search query string (name, ID, email, PEN, admission #, roll #, etc.)
 *  - role: Optional filter ('student' | 'teacher' | 'admin' | 'all')
 *  - limit: Maximum results per category (default: 20)
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || req.query.search || "").trim();
  const roleFilter = (req.query.role || "all").toLowerCase();
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  if (!q) {
    return ApiResponse.ok(res, {
      query: "",
      count: 0,
      users: [],
    });
  }

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");
  const numVal = Number(q);

  const results = [];

  // Search Students
  if (roleFilter === "all" || roleFilter === "student") {
    const studentOr = [
      { name: regex },
      { admissionNumber: regex },
      { sampoornaId: regex },
      { studentId: regex },
      { email: regex },
      { aadhaarNumber: regex },
      { guardian: regex },
    ];
    if (!isNaN(numVal) && Number.isInteger(numVal)) {
      studentOr.push({ rollNumber: numVal });
    }

    const students = await Student.find({ $or: studentOr })
      .limit(limit)
      .lean();

    for (const s of students) {
      results.push({
        _id: s._id,
        userId: s.userId || null,
        type: "student",
        role: "student",
        name: s.name,
        identifier: s.admissionNumber || s.sampoornaId || `Roll #${s.rollNumber}`,
        rollNumber: s.rollNumber,
        admissionNumber: s.admissionNumber,
        sampoornaId: s.sampoornaId,
        email: s.email,
        classDivision: s.classDivision || s.division,
        gender: s.gender,
        guardian: s.guardian,
      });
    }
  }

  // Search Teachers
  if (roleFilter === "all" || roleFilter === "teacher") {
    const teachers = await Teacher.find({
      $or: [
        { name: regex },
        { pen: regex },
        { penNumber: regex },
        { email: regex },
        { phone: regex },
        { department: regex },
        { designation: regex },
      ],
    })
      .limit(limit)
      .lean();

    for (const t of teachers) {
      results.push({
        _id: t._id,
        userId: t.userId || null,
        type: "teacher",
        role: "teacher",
        name: t.name,
        identifier: t.pen || t.penNumber || "N/A",
        pen: t.pen || t.penNumber,
        email: t.email,
        phone: t.phone,
        department: t.department,
        designation: t.designation,
        assignedClass: t.assignedClass,
      });
    }
  }

  // Search Accounts / Admins from User model
  if (roleFilter === "all" || roleFilter === "admin") {
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }, { username: regex }],
    })
      .limit(limit)
      .select("-password")
      .lean();

    for (const u of users) {
      const alreadyInList = results.some(
        (r) => String(r.userId) === String(u._id) || String(r._id) === String(u._id)
      );
      if (!alreadyInList) {
        results.push({
          _id: u._id,
          userId: u._id,
          type: u.role || "user",
          role: u.role || "user",
          name: u.name || u.username || u.email,
          identifier: u.email,
          email: u.email,
          isActive: u.isActive,
        });
      }
    }
  }

  return ApiResponse.ok(res, {
    query: q,
    count: results.length,
    users: results,
  });
});
