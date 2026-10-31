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
    sectionLabel: w.wingShort,
  }))
);
