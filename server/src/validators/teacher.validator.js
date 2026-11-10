import { validateHumanName } from "../utils/nameValidator.js";

/**
 * Minimum and maximum age rules for teaching cadre (Kerala Education Rules / Statutory service entry)
 * - Minimum appointment age: 25 years
 * - Maximum statutory service age limit: 60 years
 */
export const TEACHER_AGE_RULES = {
  min: 25,
  max: 60,
  minLabel: "25 years (Statutory service entry)",
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


/**
 * Validates teacher date of appointment
 * - Must be a valid date in DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD
 * - Cannot be in the future (e.g. 2030)
 * - Cannot be before 1970
 * - Cannot be before Date of Birth (must be at least 21 years of age on appointment date)
 */
export const validateTeacherAppointmentDate = (appointmentDate, dob) => {
  if (!appointmentDate || typeof appointmentDate !== "string" || !appointmentDate.trim()) {
    return true;
  }

  const trimmed = appointmentDate.trim();
  let apptDate;
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split(/[/-]/).map(Number);
    if (m < 1 || m > 12 || d < 1 || d > 31) {
      return "Invalid Date of Appointment format. Please use DD/MM/YYYY.";
    }
    apptDate = new Date(y, m - 1, d);
    if (isNaN(apptDate.getTime()) || apptDate.getMonth() !== m - 1 || apptDate.getDate() !== d) {
      return "Invalid calendar date for Date of Appointment. Please use DD/MM/YYYY.";
    }
  } else {
    apptDate = new Date(trimmed);
  }

  if (isNaN(apptDate.getTime())) {
    return "Invalid Date of Appointment format. Please use DD/MM/YYYY (e.g., 01/06/2018).";
  }

  const today = new Date();
  if (apptDate > today) {
    return `Date of appointment cannot be in the future (${appointmentDate}).`;
  }

  if (apptDate.getFullYear() < 1970) {
    return `Date of appointment cannot be before 1970 (${appointmentDate}).`;
  }

  if (dob) {
    const parsedDob = calculateTeacherAge(dob);
    if (parsedDob && parsedDob.birthDate) {
      if (apptDate <= parsedDob.birthDate) {
        return "Date of appointment cannot be on or before Date of Birth.";
      }
      let ageAtAppt = apptDate.getFullYear() - parsedDob.birthDate.getFullYear();
      const mDiff = apptDate.getMonth() - parsedDob.birthDate.getMonth();
      if (mDiff < 0 || (mDiff === 0 && apptDate.getDate() < parsedDob.birthDate.getDate())) {
        ageAtAppt--;
      }
      if (ageAtAppt < 21) {
        return `Faculty candidate was ${ageAtAppt} years old on appointment date. Minimum entry age under Kerala Education Rules is 21 years.`;
      }
    }
  }

  return true;
};

export const createTeacherSchema = {
  body: {
    name: {
      required: true,
      custom: (val) => validateHumanName(val, "Teacher name"),
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
    appointmentDate: {
      custom: (val, body) => validateTeacherAppointmentDate(val, body?.dob || body?.body?.dob),
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
    name: {
      custom: (val) => (!val ? true : validateHumanName(val, "Teacher name")),
    },
    dob: {
      custom: (val) => {
        if (!val) return true; // optional during update if not modified
        return validateTeacherAge(val);
      },
    },
    appointmentDate: {
      custom: (val, body) => validateTeacherAppointmentDate(val, body?.dob || body?.body?.dob),
    },
  },
};
