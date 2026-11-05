/**
 * Validates whether a provided string represents an authentic, real human name.
 * Rejects numbers (e.g. "0000000"), pure symbols, repetitive spam, and common dummy placeholders.
 * 
 * @param {string} name - Name to validate
 * @param {string} [fieldLabel="Name"] - User-friendly label for error messages
 * @returns {true|string} - `true` if valid, or an error message string if invalid
 */
export const validateHumanName = (name, fieldLabel = "Name") => {
  if (!name || typeof name !== "string") {
    return `${fieldLabel} is required.`;
  }

  const trimmed = name.trim();

  // 1. Length constraints
  if (trimmed.length < 2) {
    return `${fieldLabel} must be at least 2 characters long.`;
  }
  if (trimmed.length > 70) {
    return `${fieldLabel} cannot exceed 70 characters.`;
  }

  // 2. Reject numbers / digits entirely (e.g. "0000000", "Anandhu123")
  if (/\d/.test(trimmed)) {
    return `${fieldLabel} cannot contain numeric digits (e.g. "${trimmed}"). Please enter a genuine, real name.`;
  }

  // 3. Allowed characters: only letters, combining marks, spaces, dots, hyphens, and apostrophes
  // Uses Unicode letter (\p{L}) and mark (\p{M}) properties to support all language scripts cleanly
  const validCharsRegex = /^[\p{L}\p{M}\s.'-]+$/u;
  if (!validCharsRegex.test(trimmed)) {
    return `${fieldLabel} contains invalid symbols. Only letters, spaces, dots (.), and hyphens (-) are permitted.`;
  }

  // 4. Must contain at least two actual alphabetic letters
  const lettersOnly = trimmed.replace(/[^\p{L}\p{M}]/gu, "");
  if (lettersOnly.length < 2) {
    return `${fieldLabel} must contain at least 2 alphabetic letters.`;
  }

  // 5. Reject repetitive single-character spam (e.g. "aaaaaa", "bbbbb")
  if (/^(.)\1{3,}$/i.test(lettersOnly)) {
    return `${fieldLabel} appears to be invalid or repetitive spam ("${trimmed}"). Please provide a genuine official name.`;
  }

  // 6. Reject known dummy / placeholder keywords
  const dummyList = [
    "null",
    "undefined",
    "test",
    "testing",
    "tester",
    "admin",
    "administrator",
    "fake",
    "dummy",
    "sample",
    "unknown",
    "asdf",
    "qwerty",
    "na",
    "n/a",
    "none",
    "anonymous",
    "user",
    "student",
    "teacher",
  ];
  if (dummyList.includes(trimmed.toLowerCase())) {
    return `"${trimmed}" is a placeholder and not accepted as an official name. Please enter a genuine full name.`;
  }

  return true;
};

export default validateHumanName;
