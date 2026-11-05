/**
 * Examination Date Validator & Utility (Client)
 * Enforces Kerala Pareeksha Bhavan / SCERT scheduling guidelines:
 * - Prevents scheduling examinations on past dates
 * - Parses diverse input formats (ISO YYYY-MM-DD, DD/MM/YYYY, or descriptive '15 December 2026, Tue')
 * - Standardizes calendar date representations
 */

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Parse any date representation into a valid Date object
 * @param {string|Date} dateInput
 * @returns {Date|null}
 */
export function parseExamDate(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput;
  }
  if (typeof dateInput !== "string") return null;

  const trimmed = dateInput.trim();
  if (!trimmed) return null;

  // 1. Direct standard parse (e.g. YYYY-MM-DD or standard ISO)
  let d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d;

  // 2. Remove day-of-week suffix if present (e.g. '12 March 2026, Thu' -> '12 March 2026')
  const noDay = trimmed.replace(/,\s*[a-zA-Z]+$/i, "").trim();
  d = new Date(noDay);
  if (!isNaN(d.getTime())) return d;

  // 3. Handle DD/MM/YYYY or DD-MM-YYYY
  const parts = noDay.split(/[/-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (!isNaN(d.getTime())) return d;
    } else {
      // DD-MM-YYYY
      d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

/**
 * Validate that examination date is well-formed and not in the past
 * @param {string|Date} dateInput
 * @param {object} options
 * @param {boolean} [options.allowPast=false]
 * @returns {true|string} true if valid, error message string if invalid
 */
export function validateExamDate(dateInput, { allowPast = false } = {}) {
  if (!dateInput) {
    return "Examination date is required.";
  }

  const examDate = parseExamDate(dateInput);
  if (!examDate) {
    return "Invalid examination date format. Please provide a valid calendar date.";
  }

  if (!allowPast) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(
      examDate.getFullYear(),
      examDate.getMonth(),
      examDate.getDate()
    );

    if (targetDate < today) {
      return "Exam date cannot be scheduled in the past. Please select today or a future date.";
    }
  }

  return true;
}

/**
 * Format a Date object into human-readable Pareeksha Bhavan standard: '15 December 2026, Tue'
 * @param {Date} dateObj
 * @returns {string}
 */
export function formatDateToStandard(dateObj) {
  if (!dateObj || isNaN(dateObj.getTime())) return "";
  const day = dateObj.getDate();
  const month = MONTH_NAMES[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const dayName = DAY_NAMES[dateObj.getDay()];
  return `${day} ${month} ${year}, ${dayName}`;
}

/**
 * Format a Date object into 'YYYY-MM-DD' for native HTML5 date input
 * @param {Date} dateObj
 * @returns {string}
 */
export function toISODateString(dateObj) {
  if (!dateObj || isNaN(dateObj.getTime())) return "";
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Get today's ISO date string 'YYYY-MM-DD'
 * @returns {string}
 */
export function getTodayISODate() {
  return toISODateString(new Date());
}
