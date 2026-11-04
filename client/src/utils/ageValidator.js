export const CLASS_MIN_AGES = {
  1:  { min: 6,  max: 8,  name: "Class 1" },
  2:  { min: 7,  max: 9,  name: "Class 2" },
  3:  { min: 8,  max: 10, name: "Class 3" },
  4:  { min: 9,  max: 11, name: "Class 4" },
  5:  { min: 10, max: 12, name: "Class 5" },
  6:  { min: 11, max: 13, name: "Class 6" },
  7:  { min: 12, max: 14, name: "Class 7" },
  8:  { min: 13, max: 15, name: "Class 8" },
  9:  { min: 14, max: 16, name: "Class 9" },
  10: { min: 15, max: 18, name: "Class 10 (SSLC)" },
  11: { min: 16, max: 19, name: "Class 11 (+1)" },
  12: { min: 17, max: 20, name: "Class 12 (+2)" },
};

/**
 * Calculates completed age from Date of Birth string (DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD)
 */
export const calculateAgeFromDob = (dobString) => {
  if (!dobString || typeof dobString !== "string") return null;

  let birthDate;
  const trimmed = dobString.trim();

  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split(/[/-]/).map(Number);
    birthDate = new Date(y, m - 1, d);
  } else {
    birthDate = new Date(trimmed);
  }

  if (isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return {
    age,
    birthDate,
    isFuture: birthDate > today,
  };
};

export const checkStudentAgeEligibility = (dobString, divisionString) => {
  if (!dobString) return { valid: false, message: "Date of Birth is required." };

  const parsed = calculateAgeFromDob(dobString);
  if (!parsed) {
    return { valid: false, message: "Invalid date format. Use DD/MM/YYYY." };
  }

  if (parsed.isFuture) {
    return { valid: false, isFuture: true, message: "Date of birth cannot be in the future." };
  }

  const { age } = parsed;
  const match = String(divisionString || "").match(/(?:class\s*)?(\d{1,2})/i);
  const stdNum = match ? parseInt(match[1], 10) : null;

  if (stdNum && CLASS_MIN_AGES[stdNum]) {
    const rule = CLASS_MIN_AGES[stdNum];
    if (age < rule.min) {
      return {
        valid: false,
        age,
        message: `Student is ${age} yrs old. Minimum age for ${rule.name} is ${rule.min} years.`,
      };
    }
    if (age > rule.max) {
      return {
        valid: false,
        age,
        message: `Student is ${age} yrs old. Maximum allowed age for ${rule.name} is ${rule.max} years.`,
      };
    }
    return { valid: true, age, message: `Age: ${age} yrs • Eligible for ${rule.name}` };
  }

  return { valid: true, age, message: `Age: ${age} yrs` };
};

export const TEACHER_AGE_RULES = {
  min: 25,
  max: 60,
  minLabel: "25 years (Statutory service entry)",
  maxLabel: "60 years (Superannuation retirement)",
};

/**
 * Validates faculty/teacher age eligibility
 * Minimum age: 25 years (K.E.R statutory requirement)
 * Maximum age: 60 years (Superannuation limit)
 */
export const checkTeacherAgeEligibility = (dobString) => {
  if (!dobString || !dobString.trim()) {
    return { valid: false, message: "Date of Birth is required.", badge: "Required" };
  }

  const parsed = calculateAgeFromDob(dobString);
  if (!parsed) {
    return {
      valid: false,
      message: "Invalid date format. Use DD/MM/YYYY (e.g. 15/05/1988).",
      badge: "Format: DD/MM/YYYY",
    };
  }

  if (parsed.isFuture) {
    return {
      valid: false,
      isFuture: true,
      message: "Date of birth cannot be in the future.",
      badge: "Future date invalid",
    };
  }

  const { age } = parsed;

  if (age < TEACHER_AGE_RULES.min) {
    return {
      valid: false,
      age,
      message: `Faculty is ${age} yrs old. Minimum age for teaching appointment is ${TEACHER_AGE_RULES.min} years.`,
      badge: `Age: ${age} yrs (Min: ${TEACHER_AGE_RULES.min})`,
    };
  }

  if (age > TEACHER_AGE_RULES.max) {
    return {
      valid: false,
      age,
      message: `Faculty is ${age} yrs old. Exceeds statutory retirement age of ${TEACHER_AGE_RULES.max} years.`,
      badge: `Age: ${age} yrs (Max: ${TEACHER_AGE_RULES.max})`,
    };
  }

  return {
    valid: true,
    age,
    message: `Age: ${age} yrs • Eligible Teaching Faculty`,
    badge: `Age: ${age} yrs (Eligible)`,
  };
};
