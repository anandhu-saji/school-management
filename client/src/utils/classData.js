/**
 * Kerala Sampoorna 2.0 - Standard Academic Structure & Classes Registry
 * GHSS Rajakkad (School Code: 06042)
 * 26 Consolidated Academic Divisions across 4 Wings:
 * - Lower Primary (LP): 8 Divisions (Classes 1 to 4)
 * - Upper Primary (UP): 6 Divisions (Classes 5 to 7)
 * - High School (HS): 6 Divisions (Classes 8 to 10)
 * - Higher Secondary (HSS): 6 Divisions (Classes 11 & 12)
 */

export const ACADEMIC_WINGS = [
  {
    wing: "Lower Primary (LP School)",
    wingShort: "LP School",
    standards: "Classes 1 to 4",
    code: "lp_school",
    totalDivisions: 8,
    classes: [
      { id: "1-A", name: "Class 1-A", standard: "Class 1", section: "A", stream: "Primary", mentor: "Smt. Beena P. (LPSA)", room: "LP Block Room 1" },
      { id: "1-B", name: "Class 1-B", standard: "Class 1", section: "B", stream: "Primary", mentor: "Smt. Asha Mohan (LPSA)", room: "LP Block Room 2" },
      { id: "2-A", name: "Class 2-A", standard: "Class 2", section: "A", stream: "Primary", mentor: "Smt. Sreeja K. (LPSA)", room: "LP Block Room 3" },
      { id: "2-B", name: "Class 2-B", standard: "Class 2", section: "B", stream: "Primary", mentor: "Sri. Anilkumar (LPSA)", room: "LP Block Room 4" },
      { id: "3-A", name: "Class 3-A", standard: "Class 3", section: "A", stream: "Primary", mentor: "Smt. Manju R. (LPSA)", room: "LP Block Room 5" },
      { id: "3-B", name: "Class 3-B", standard: "Class 3", section: "B", stream: "Primary", mentor: "Smt. Rema Devi (LPSA)", room: "LP Block Room 6" },
      { id: "4-A", name: "Class 4-A", standard: "Class 4", section: "A", stream: "Primary", mentor: "Sri. Shaji Mathew (LPSA)", room: "LP Block Room 7" },
      { id: "4-B", name: "Class 4-B", standard: "Class 4", section: "B", stream: "Primary", mentor: "Smt. Latha K. (LPSA)", room: "LP Block Room 8" },
    ],
  },
  {
    wing: "Upper Primary (UP School)",
    wingShort: "UP School",
    standards: "Classes 5 to 7",
    code: "up_school",
    totalDivisions: 6,
    classes: [
      { id: "5-A", name: "Class 5-A", standard: "Class 5", section: "A", stream: "General", mentor: "Smt. Mini V. (UPSA)", room: "UP Block Room 1" },
      { id: "5-B", name: "Class 5-B", standard: "Class 5", section: "B", stream: "General", mentor: "Sri. Rajesh Kumar (UPSA)", room: "UP Block Room 2" },
      { id: "6-A", name: "Class 6-A", standard: "Class 6", section: "A", stream: "General", mentor: "Smt. Sheela Thomas (UPSA)", room: "UP Block Room 3" },
      { id: "6-B", name: "Class 6-B", standard: "Class 6", section: "B", stream: "General", mentor: "Sri. Deepu Varghese (UPSA)", room: "UP Block Room 4" },
      { id: "7-A", name: "Class 7-A", standard: "Class 7", section: "A", stream: "General", mentor: "Smt. Mary K. J. (UPSA)", room: "UP Block Room 5" },
      { id: "7-B", name: "Class 7-B", standard: "Class 7", section: "B", stream: "General", mentor: "Sri. Suresh Babu (UPSA)", room: "UP Block Room 6" },
    ],
  },
  {
    wing: "High School Section",
    wingShort: "High School",
    standards: "Classes 8 to 10",
    code: "high_school",
    totalDivisions: 6,
    classes: [
      { id: "8-A", name: "Class 8-A", standard: "Class 8", section: "A", stream: "General", mentor: "Smt. Bindu S. (HST)", room: "Room 10" },
      { id: "8-B", name: "Class 8-B", standard: "Class 8", section: "B", stream: "General", mentor: "Sri. Radhakrishnan N. (HST)", room: "Room 11" },
      { id: "9-A", name: "Class 9-A", standard: "Class 9", section: "A", stream: "General", mentor: "Sri. George K. (HST)", room: "Room 12" },
      { id: "9-B", name: "Class 9-B", standard: "Class 9", section: "B", stream: "General", mentor: "Smt. Sunitha R. (HST)", room: "Room 13" },
      { id: "10-A", name: "Class 10-A", standard: "Class 10", section: "A", stream: "General (SSLC Cadre)", mentor: "Assigned Class Mentor (HST)", room: "Room 14 (Lab Wing)" },
      { id: "10-B", name: "Class 10-B", standard: "Class 10", section: "B", stream: "General (SSLC Cadre)", mentor: "Sri. George K. (HST)", room: "Room 15" },
    ],
  },
  {
    wing: "Higher Secondary Section",
    wingShort: "Higher Secondary",
    standards: "Classes 11 & 12 (+1 & +2)",
    code: "higher_secondary",
    totalDivisions: 6,
    classes: [
      { id: "11-Science", name: "Class 11-Science", standard: "Class 11", section: "Science", stream: "Bio-Maths", mentor: "Sri. Suresh C. K. (HSST)", room: "HSS Wing Lab 1" },
      { id: "11-Commerce", name: "Class 11-Commerce", standard: "Class 11", section: "Commerce", stream: "Computer App", mentor: "Smt. Priya Nair (HSST)", room: "HSS Room 202" },
      { id: "11-Humanities", name: "Class 11-Humanities", standard: "Class 11", section: "Humanities", stream: "Sociology/Hist", mentor: "Sri. Thomas Joseph (HSST)", room: "HSS Room 203" },
      { id: "12-Science", name: "Class 12-Science", standard: "Class 12", section: "Science", stream: "Bio-Maths", mentor: "Sri. Manoj P. (HSST)", room: "HSS Wing Lab 2" },
      { id: "12-Commerce", name: "Class 12-Commerce", standard: "Class 12", section: "Commerce", stream: "Computer App", mentor: "Smt. Deepa Nair (HSST)", room: "HSS Room 302" },
      { id: "12-Humanities", name: "Class 12-Humanities", standard: "Class 12", section: "Humanities", stream: "Sociology/Hist", mentor: "Sri. Thomas Joseph (HSST)", room: "HSS Room 303" },
    ],
  },
];

// Flattend list of all 26 classes
export const ALL_CLASSES = ACADEMIC_WINGS.flatMap((w) =>
  w.classes.map((c) => ({ ...c, wing: w.wing, wingCode: w.code, wingShort: w.wingShort }))
);

export const getAllClassIds = () => ALL_CLASSES.map((c) => c.id);

export const getClassDetailsById = (classId) => {
  if (!classId) return null;
  const clean = classId.replace(/^Class\s*/i, "").trim();
  return (
    ALL_CLASSES.find(
      (c) =>
        c.id.toLowerCase() === clean.toLowerCase() ||
        c.name.toLowerCase() === classId.toLowerCase() ||
        c.id.toLowerCase() === classId.toLowerCase()
    ) || {
      id: clean,
      name: `Class ${clean}`,
      standard: `Class ${clean.split("-")[0]}`,
      section: clean.split("-")[1] || "A",
      stream: "General",
      mentor: "Assigned Faculty",
      room: "General Classroom",
      wing: "General Academic Wing",
      wingCode: "general",
      wingShort: "General",
    }
  );
};

/**
 * Normalizes any class/division input string to canonical Kerala 2.0 Academic Division
 * Examples: "12 science", "Class 12 science", "12-Science" -> { id: "12-Science", name: "Class 12-Science" }
 */
export const normalizeClassDivision = (input) => {
  if (!input || typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw) return null;

  // Direct match by name or id
  const direct = ALL_CLASSES.find(
    (c) => c.name.toLowerCase() === raw.toLowerCase() || c.id.toLowerCase() === raw.toLowerCase()
  );
  if (direct) {
    return {
      id: direct.id,
      name: direct.name,
      standard: direct.standard,
      stream: direct.stream,
    };
  }

  // Alphanumeric clean match (removing spaces, hyphens, and trailing suffixes like Mentor, In-charge, etc.)
  const clean = raw
    .replace(/\s*(Mentor|Class Teacher|In-charge|Teacher|Cadre)\s*$/i, "")
    .replace(/[\s-]/g, "")
    .toLowerCase();

  const match = ALL_CLASSES.find((c) => {
    const cClean = c.name.replace(/[\s-]/g, "").toLowerCase();
    const idClean = c.id.replace(/[\s-]/g, "").toLowerCase();
    return cClean === clean || idClean === clean;
  });

  if (match) {
    return {
      id: match.id,
      name: match.name,
      standard: match.standard,
      stream: match.stream,
    };
  }

  // Fallback for custom division string
  const cleanId = raw
    .replace(/^Class\s*/i, "")
    .replace(/\s*(Mentor|Class Teacher|In-charge|Teacher)\s*$/i, "")
    .trim();

  return {
    id: cleanId,
    name: raw.startsWith("Class ") ? raw : `Class ${raw}`,
    standard: `Class ${cleanId.split("-")[0] || cleanId}`,
    stream: "General",
  };
};
