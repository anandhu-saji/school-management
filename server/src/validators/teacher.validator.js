/**
 * Minimum and maximum age rules for teaching cadre (Kerala Education Rules / Statutory service entry)
 * - Minimum appointment age: 21 years
 * - Maximum statutory service age limit: 60 years
 */
export const TEACHER_AGE_RULES = {
  min: 21,
  max: 60,
  minLabel: "21 years (Statutory service entry)",
  maxLabel: "60 years (Superannuation retirement)",
};

/**
 * Calculates exact age in completed years from Date of Birth
 * Supports formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
 */
export const calculateTeacherAge = (dobString) => {
  if (!dobString || typeof dobString !== "string") return null;

  let birthDate;
  const trimmed = dobString.trim();

  // Match DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split(/[/-]/).map(Number);
    birthDate = new Date(year, month - 1, day);
  } else {
    birthDate = new Date(trimmed);
  }

  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return {
    age,
    birthDate,
    isFuture: birthDate > today,
  };
};

/**
 * Validates teacher age eligibility
 * Returns `true` if valid, or a descriptive error string if invalid
 */
export const validateTeacherAge = (dob) => {
  if (!dob) return "Date of birth (DOB) is required for teacher appointment.";

  const parsed = calculateTeacherAge(dob);
  if (!parsed) {
    return "Invalid Date of Birth format. Please use DD/MM/YYYY (e.g., 15/05/1988).";
  }

  if (parsed.isFuture) {
    return `Date of birth cannot be a future date (${dob}).`;
  }

  if (parsed.age < TEACHER_AGE_RULES.min) {
    return `Teacher candidate is ${parsed.age} year(s) old and not eligible. Minimum required age for teaching cadre is ${TEACHER_AGE_RULES.min} years under Kerala Education Rules.`;
  }

  if (parsed.age > TEACHER_AGE_RULES.max) {
    return `Teacher candidate is ${parsed.age} year(s) old and exceeds the statutory retirement age limit (${TEACHER_AGE_RULES.max} years).`;
  }

  return true;
};

export const createTeacherSchema = {
  body: {
    name: {
      required: true,
      minLength: 2,
      message: "Teacher name is required (min 2 characters).",
    },
    email: {
      required: true,
      email: true,
      message: "A valid teacher institutional email is required.",
    },
    dob: {
      required: true,
      custom: (val) => validateTeacherAge(val),
    },
  },
};

export const updateTeacherSchema = {
  params: {
    id: {
      required: true,
      message: "Teacher database ID is required in URL path.",
    },
  },
  body: {
    dob: {
      custom: (val) => {
        if (!val) return true; // optional during update if not modified
        return validateTeacherAge(val);
      },
    },
  },
};
