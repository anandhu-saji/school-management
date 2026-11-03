/**
 * Minimum and maximum age rules for all classes (Classes 1 to 12)
 * Baseline standard: Standard 1 = minimum 6 years old
 */
export const CLASS_AGE_RULES = {
  1:  { min: 6,  max: 8,  label: "Class 1 (LP School)" },
  2:  { min: 7,  max: 9,  label: "Class 2 (LP School)" },
  3:  { min: 8,  max: 10, label: "Class 3 (LP School)" },
  4:  { min: 9,  max: 11, label: "Class 4 (LP School)" },
  5:  { min: 10, max: 12, label: "Class 5 (UP School)" },
  6:  { min: 11, max: 13, label: "Class 6 (UP School)" },
  7:  { min: 12, max: 14, label: "Class 7 (UP School)" },
  8:  { min: 13, max: 15, label: "Class 8 (High School)" },
  9:  { min: 14, max: 16, label: "Class 9 (High School)" },
  10: { min: 15, max: 18, label: "Class 10 (SSLC Cadre)" },
  11: { min: 16, max: 19, label: "Class 11 (+1 Higher Secondary)" },
  12: { min: 17, max: 20, label: "Class 12 (+2 Higher Secondary)" },
};

/**
 * Calculates exact age in completed years from Date of Birth
 * Supports formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
 */
export const calculateStudentAge = (dobString) => {
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
 * Validates age eligibility against any class/division
 * Returns `true` if valid, or a descriptive error string if invalid
 */
export const validateStudentAgeForClass = (dob, division) => {
  if (!dob) return "Date of birth (DOB) is required for student admission.";

  const parsed = calculateStudentAge(dob);
  if (!parsed) {
    return "Invalid Date of Birth format. Please use DD/MM/YYYY (e.g., 14/05/2010).";
  }

  if (parsed.isFuture) {
    return `Date of birth cannot be a future date (${dob}).`;
  }

  // Extract the standard number (e.g. "1-A" -> 1, "10-B" -> 10, "11-Science" -> 11)
  const match = String(division || "").match(/(?:class\s*)?(\d{1,2})/i);
  const standardNumber = match ? parseInt(match[1], 10) : null;

  if (standardNumber && CLASS_AGE_RULES[standardNumber]) {
    const rule = CLASS_AGE_RULES[standardNumber];

    if (parsed.age < rule.min) {
      return `Student is ${parsed.age} year(s) old and not eligible for ${rule.label}. Minimum required age is ${rule.min} years.`;
    }

    if (parsed.age > rule.max) {
      return `Student is ${parsed.age} year(s) old and exceeds the age limit for ${rule.label} (Maximum allowed: ${rule.max} years).`;
    }
  }

  return true;
};

export const createStudentSchema = {
  body: {
    name: {
      required: true,
      minLength: 2,
      message: "Student full name is required (min 2 characters).",
    },
    dob: {
      required: true,
      custom: (val, body) => validateStudentAgeForClass(val, body.division || body.classDivision),
    },
  },
};

export const updateStudentSchema = {
  params: {
    id: {
      required: true,
      message: "Student database ID is required in URL path.",
    },
  },
  body: {
    dob: {
      custom: (val, body) => {
        if (!val) return true; // optional during update if not changed
        return validateStudentAgeForClass(val, body.division || body.classDivision);
      },
    },
  },
};
