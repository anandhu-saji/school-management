import { ApiError } from "../utils/ApiError.js";

/**
 * Validates request data (body, query, params) against a given schema
 * 
 * Schema structure example:
 * {
 *   body: {
 *     email: { required: true, email: true, message: "Valid email is required" },
 *     password: { required: true, minLength: 6 }
 *   },
 *   query: { ... },
 *   params: { ... }
 * }
 * 
 * Or a custom validation function: (req) => errors[]
 */
export const validate = (schema) => {
  return (req, res, next) => {
    if (!schema) return next();

    // Support function-based validator
    if (typeof schema === "function") {
      const errors = schema(req);
      if (errors && errors.length > 0) {
        return next(ApiError.badRequest("Validation failed", errors));
      }
      return next();
    }

    const errors = [];

    const validatePart = (target, rules, partName) => {
      if (!rules) return;
      const data = target || {};

      for (const [field, rule] of Object.entries(rules)) {
        const val = data[field];

        // 1. Required check
        if (rule.required && (val === undefined || val === null || val === "")) {
          errors.push({
            part: partName,
            field,
            message: rule.message || `${field} is required.`,
          });
          continue;
        }

        // If not required and empty, skip further checks
        if (val === undefined || val === null || val === "") {
          continue;
        }

        // 2. Type check
        if (rule.type) {
          if (rule.type === "array" && !Array.isArray(val)) {
            errors.push({ part: partName, field, message: `${field} must be an array.` });
          } else if (rule.type === "number" && (typeof val !== "number" || isNaN(val))) {
            errors.push({ part: partName, field, message: `${field} must be a valid number.` });
          } else if (rule.type === "string" && typeof val !== "string") {
            errors.push({ part: partName, field, message: `${field} must be a string.` });
          }
        }

        // 3. String minLength
        if (rule.minLength && typeof val === "string" && val.trim().length < rule.minLength) {
          errors.push({
            part: partName,
            field,
            message: `${field} must be at least ${rule.minLength} characters long.`,
          });
        }

        // 4. Email format check
        if (rule.email && typeof val === "string") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val.trim())) {
            errors.push({
              part: partName,
              field,
              message: `${field} must be a valid email address.`,
            });
          }
        }

        // 5. Enum check
        if (rule.enum && Array.isArray(rule.enum) && !rule.enum.includes(val)) {
          errors.push({
            part: partName,
            field,
            message: `${field} must be one of: ${rule.enum.join(", ")}.`,
          });
        }

        // 6. Custom validation function
        if (typeof rule.custom === "function") {
          const result = rule.custom(val, data);
          if (result !== true) {
            errors.push({
              part: partName,
              field,
              message: typeof result === "string" ? result : `${field} failed validation.`,
            });
          }
        }
      }
    };

    validatePart(req.body, schema.body, "body");
    validatePart(req.query, schema.query, "query");
    validatePart(req.params, schema.params, "params");

    if (errors.length > 0) {
      const summaryMsg = errors[0].message || "Validation failed";
      return next(ApiError.badRequest(summaryMsg, errors));
    }

    next();
  };
};

export default validate;
