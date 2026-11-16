import { ClassService } from "../../services/class.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

/**
 * Controller: Get all school academic classes & wings structure
 * Route: GET /api/admin/classes
 */
export const getClassesList = asyncHandler(async (req, res) => {
  const result = await ClassService.getAllClasses();
  return ApiResponse.ok(res, result);
});

/**
 * Controller: Add a new class and division to the school
 * Route: POST /api/admin/classes
 */
export const createClass = asyncHandler(async (req, res) => {
  const newClass = await ClassService.createClass(req.body);
  return ApiResponse.created(res, {
    message: `Academic division ${newClass.name} added to ${newClass.wingShort} successfully!`,
    class: newClass,
  });
});

/**
 * Controller: Update academic class division details
 * Route: PUT /api/admin/classes/:id
 */
export const updateClass = asyncHandler(async (req, res) => {
  const updated = await ClassService.updateClass(req.params.id, req.body);
  return ApiResponse.ok(res, {
    message: `Academic division ${updated.name} updated successfully!`,
    class: updated,
  });
});

/**
 * Controller: Soft-delete / Archive an academic division
 * Route: DELETE /api/admin/classes/:id
 */
export const deleteClass = asyncHandler(async (req, res) => {
  const deleted = await ClassService.deleteClass(req.params.id);
  return ApiResponse.ok(res, {
    message: `Academic division ${deleted.name} removed from active school list.`,
    class: deleted,
  });
});
