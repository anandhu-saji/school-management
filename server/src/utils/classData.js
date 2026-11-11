/**
 * Kerala Sampoorna 2.0 - Standard Academic Structure & Classes Registry
 * GHSS Rajakkad (School Code: 06042)
 * 26 Consolidated Academic Divisions across 4 Wings
 */

export const ACADEMIC_WINGS = [
  {
    wing: "Lower Primary (LP School)",
    wingShort: "LP School",
    standards: "Classes 1 to 4",
    code: "lp_school",
    totalDivisions: 8,
    classes: [
      { id: "1-A", name: "Class 1-A", standard: "Class 1", section: "A", stream: "Primary", mentor: "Smt. Beena P. (LPSA)", enrolled: 39, present: 38, absent: 1, turnoutRate: "97.4%", syncStatus: "Verified & Locked" },
      { id: "1-B", name: "Class 1-B", standard: "Class 1", section: "B", stream: "Primary", mentor: "Smt. Asha Mohan (LPSA)", enrolled: 38, present: 37, absent: 1, turnoutRate: "97.4%", syncStatus: "Verified & Locked" },
      { id: "2-A", name: "Class 2-A", standard: "Class 2", section: "A", stream: "Primary", mentor: "Smt. Sreeja K. (LPSA)", enrolled: 40, present: 39, absent: 1, turnoutRate: "97.5%", syncStatus: "Verified & Locked" },
      { id: "2-B", name: "Class 2-B", standard: "Class 2", section: "B", stream: "Primary", mentor: "Sri. Anilkumar (LPSA)", enrolled: 39, present: 37, absent: 2, turnoutRate: "94.9%", syncStatus: "Verified & Locked" },
      { id: "3-A", name: "Class 3-A", standard: "Class 3", section: "A", stream: "Primary", mentor: "Smt. Manju R. (LPSA)", enrolled: 39, present: 38, absent: 1, turnoutRate: "97.4%", syncStatus: "Verified & Locked" },
      { id: "3-B", name: "Class 3-B", standard: "Class 3", section: "B", stream: "Primary", mentor: "Smt. Rema Devi (LPSA)", enrolled: 39, present: 37, absent: 2, turnoutRate: "94.9%", syncStatus: "Verified & Locked" },
      { id: "4-A", name: "Class 4-A", standard: "Class 4", section: "A", stream: "Primary", mentor: "Sri. Shaji Mathew (LPSA)", enrolled: 39, present: 38, absent: 1, turnoutRate: "97.4%", syncStatus: "Verified & Locked" },
      { id: "4-B", name: "Class 4-B", standard: "Class 4", section: "B", stream: "Primary", mentor: "Smt. Latha K. (LPSA)", enrolled: 39, present: 37, absent: 2, turnoutRate: "94.9%", syncStatus: "Verified & Locked" },
    ],
  },
  {
    wing: "Upper Primary (UP School)",
    wingShort: "UP School",
    standards: "Classes 5 to 7",
    code: "up_school",
    totalDivisions: 6,
    classes: [
      { id: "5-A", name: "Class 5-A", standard: "Class 5", section: "A", stream: "General", mentor: "Smt. Mini V. (UPSA)", enrolled: 46, present: 45, absent: 1, turnoutRate: "97.8%", syncStatus: "Verified & Locked" },
      { id: "5-B", name: "Class 5-B", standard: "Class 5", section: "B", stream: "General", mentor: "Sri. Rajesh Kumar (UPSA)", enrolled: 45, present: 43, absent: 2, turnoutRate: "95.6%", syncStatus: "Verified & Locked" },
      { id: "6-A", name: "Class 6-A", standard: "Class 6", section: "A", stream: "General", mentor: "Smt. Sheela Thomas (UPSA)", enrolled: 47, present: 46, absent: 1, turnoutRate: "97.9%", syncStatus: "Verified & Locked" },
      { id: "6-B", name: "Class 6-B", standard: "Class 6", section: "B", stream: "General", mentor: "Sri. Deepu Varghese (UPSA)", enrolled: 45, present: 43, absent: 2, turnoutRate: "95.6%", syncStatus: "Verified & Locked" },
      { id: "7-A", name: "Class 7-A", standard: "Class 7", section: "A", stream: "General", mentor: "Smt. Mary K. J. (UPSA)", enrolled: 47, present: 46, absent: 1, turnoutRate: "97.9%", syncStatus: "Verified & Locked" },
      { id: "7-B", name: "Class 7-B", standard: "Class 7", section: "B", stream: "General", mentor: "Sri. Suresh Babu (UPSA)", enrolled: 46, present: 44, absent: 2, turnoutRate: "95.7%", syncStatus: "Verified & Locked" },
    ],
  },
  {
    wing: "High School Section",
    wingShort: "High School",
    standards: "Classes 8 to 10",
    code: "high_school",
    totalDivisions: 6,
    classes: [
      { id: "8-A", name: "Class 8-A", standard: "Class 8", section: "A", stream: "General", mentor: "Smt. Bindu S. (HST)", enrolled: 45, present: 44, absent: 1, turnoutRate: "97.8%", syncStatus: "Verified & Locked" },
      { id: "8-B", name: "Class 8-B", standard: "Class 8", section: "B", stream: "General", mentor: "Sri. Radhakrishnan N. (HST)", enrolled: 44, present: 42, absent: 2, turnoutRate: "95.5%", syncStatus: "Verified & Locked" },
      { id: "9-A", name: "Class 9-A", standard: "Class 9", section: "A", stream: "General", mentor: "Sri. George K. (HST)", enrolled: 46, present: 45, absent: 1, turnoutRate: "97.8%", syncStatus: "Verified & Locked" },
      { id: "9-B", name: "Class 9-B", standard: "Class 9", section: "B", stream: "General", mentor: "Smt. Sunitha R. (HST)", enrolled: 47, present: 45, absent: 2, turnoutRate: "95.7%", syncStatus: "Verified & Locked" },
      { id: "10-A", name: "Class 10-A", standard: "Class 10", section: "A", stream: "General (SSLC Cadre)", mentor: "Mrs. Indu B Nair (HST)", enrolled: 48, present: 47, absent: 1, turnoutRate: "97.9%", syncStatus: "Verified & Locked" },
      { id: "10-B", name: "Class 10-B", standard: "Class 10", section: "B", stream: "General (SSLC Cadre)", mentor: "Sri. George K. (HST)", enrolled: 46, present: 44, absent: 2, turnoutRate: "95.6%", syncStatus: "Verified & Locked" },
    ],
  },
  {
    wing: "Higher Secondary Section",
    wingShort: "Higher Secondary",
    standards: "Classes 11 & 12 (+1 & +2)",
    code: "higher_secondary",
    totalDivisions: 6,
    classes: [
      { id: "11-Science", name: "Class 11-Science", standard: "Class 11", section: "Science", stream: "Bio-Maths", mentor: "Sri. Suresh C. K. (HSST)", enrolled: 50, present: 48, absent: 2, turnoutRate: "96.0%", syncStatus: "Verified & Locked" },
      { id: "11-Commerce", name: "Class 11-Commerce", standard: "Class 11", section: "Commerce", stream: "Computer App", mentor: "Smt. Priya Nair (HSST)", enrolled: 49, present: 47, absent: 2, turnoutRate: "95.9%", syncStatus: "Verified & Locked" },
      { id: "11-Humanities", name: "Class 11-Humanities", standard: "Class 11", section: "Humanities", stream: "Sociology/Hist", mentor: "Sri. Thomas Joseph (HSST)", enrolled: 48, present: 46, absent: 2, turnoutRate: "95.8%", syncStatus: "Verified & Locked" },
      { id: "12-Science", name: "Class 12-Science", standard: "Class 12", section: "Science", stream: "Bio-Maths", mentor: "Sri. Manoj P. (HSST)", enrolled: 50, present: 48, absent: 2, turnoutRate: "96.0%", syncStatus: "Verified & Locked" },
      { id: "12-Commerce", name: "Class 12-Commerce", standard: "Class 12", section: "Commerce", stream: "Computer App", mentor: "Smt. Deepa Nair (HSST)", enrolled: 50, present: 48, absent: 2, turnoutRate: "96.0%", syncStatus: "Verified & Locked" },
      { id: "12-Humanities", name: "Class 12-Humanities", standard: "Class 12", section: "Humanities", stream: "Sociology/Hist", mentor: "Sri. Thomas Joseph (HSST)", enrolled: 49, present: 47, absent: 2, turnoutRate: "95.9%", syncStatus: "Verified & Locked" },
    ],
  },
];

export const ALL_CLASSES = ACADEMIC_WINGS.flatMap((w) =>
  w.classes.map((c) => ({
    ...c,
    standardDivision: c.name,
    section: c.code || w.code,
    wing: w.wing,
    wingCode: w.code,
    wingShort: w.wingShort,
    sectionLabel: w.wingShort,
  }))
);

/**
 * Resolves the statutory academic wing for a given class or division string
 * Returns: "LP School" | "UP School" | "High School" | "Higher Secondary"
 */
export const getAcademicWingForClass = (classDivisionOrStandard) => {
  if (!classDivisionOrStandard || typeof classDivisionOrStandard !== "string") {
    return "High School";
  }

  const raw = classDivisionOrStandard.trim();
  const directMatch = ALL_CLASSES.find(
    (c) => c.name.toLowerCase() === raw.toLowerCase() || c.id.toLowerCase() === raw.toLowerCase()
  );
  if (directMatch && directMatch.wingShort) {
    return directMatch.wingShort;
  }

  const norm = normalizeClassDivision(raw);
  if (norm) {
    const matchedClass = ALL_CLASSES.find((c) => c.id === norm.id || c.name === norm.name);
    if (matchedClass && matchedClass.wingShort) {
      return matchedClass.wingShort;
    }
  }

  // Fallback by standard number extraction
  const numMatch = raw.match(/\b(1[0-2]|[1-9])\b/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    if (num >= 1 && num <= 4) return "LP School";
    if (num >= 5 && num <= 7) return "UP School";
    if (num >= 8 && num <= 10) return "High School";
    if (num >= 11 && num <= 12) return "Higher Secondary";
  }

  if (/plus\s*two|plus\s*one|\+1|\+2|hss/i.test(raw)) return "Higher Secondary";
  if (/sslc|high/i.test(raw)) return "High School";
  if (/up/i.test(raw)) return "UP School";
  if (/lp|primary/i.test(raw)) return "LP School";

  return "High School";
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
