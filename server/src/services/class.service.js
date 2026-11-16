import mongoose from "mongoose";
import AcademicClass from "../models/AcademicClass.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import { ACADEMIC_WINGS, getAcademicWingForClass } from "../utils/classData.js";
import { ApiError } from "../utils/ApiError.js";

// Canonical Wing Metadata Dictionary
const WING_METADATA = {
  "LP School": {
    wing: "Lower Primary (LP School)",
    wingShort: "LP School",
    wingCode: "lp_school",
  },
  "UP School": {
    wing: "Upper Primary (UP School)",
    wingShort: "UP School",
    wingCode: "up_school",
  },
  "High School": {
    wing: "High School Section",
    wingShort: "High School",
    wingCode: "high_school",
  },
  "Higher Secondary": {
    wing: "Higher Secondary Section",
    wingShort: "Higher Secondary",
    wingCode: "higher_secondary",
  },
};

export class ClassService {
  /**
   * Automatically seeds the 26 baseline Kerala Sampoorna divisions into MongoDB if empty
   */
  static async ensureDefaultClassesSeeded() {
    try {
      const existingCount = await AcademicClass.countDocuments();
      if (existingCount > 0) return;

      const seedDocs = [];
      for (const w of ACADEMIC_WINGS) {
        for (const c of w.classes) {
          seedDocs.push({
            id: c.id,
            name: c.name,
            standard: c.standard || `Class ${c.id.split("-")[0]}`,
            section: c.section || c.id.split("-")[1] || "A",
            wing: w.wing,
            wingShort: w.wingShort,
            wingCode: w.code,
            stream: c.stream || "General",
            mentor: c.mentor || "Assigned Faculty",
            room: c.room || `${w.wingShort} Academic Room`,
            enrolled: c.enrolled || 0,
            maxCapacity: 45,
            turnoutRate: c.turnoutRate || "100.0%",
            syncStatus: "Verified & Locked",
            isCustom: false,
          });
        }
      }

      if (seedDocs.length > 0) {
        await AcademicClass.insertMany(seedDocs, { ordered: false });
        console.log(`[ClassService] Seeded ${seedDocs.length} baseline academic divisions.`);
      }
    } catch (err) {
      console.warn("[ClassService] Seeding notice:", err.message);
    }
  }

  /**
   * Get all active classes and return structured academic wings list
   */
  static async getAllClasses() {
    await this.ensureDefaultClassesSeeded();

    const classes = await AcademicClass.find({})
      .sort({ wingCode: 1, standard: 1, section: 1 })
      .lean();

    // Group into 4 statutory wings
    const wingsMap = {
      lp_school: {
        wing: "Lower Primary (LP School)",
        wingShort: "LP School",
        standards: "Classes 1 to 4",
        code: "lp_school",
        classes: [],
      },
      up_school: {
        wing: "Upper Primary (UP School)",
        wingShort: "UP School",
        standards: "Classes 5 to 7",
        code: "up_school",
        classes: [],
      },
      high_school: {
        wing: "High School Section",
        wingShort: "High School",
        standards: "Classes 8 to 10",
        code: "high_school",
        classes: [],
      },
      higher_secondary: {
        wing: "Higher Secondary Section",
        wingShort: "Higher Secondary",
        standards: "Classes 11 & 12 (+1 & +2)",
        code: "higher_secondary",
        classes: [],
      },
    };

    classes.forEach((c) => {
      const wCode = c.wingCode || "high_school";
      if (!wingsMap[wCode]) {
        wingsMap[wCode] = {
          wing: c.wing || "General Section",
          wingShort: c.wingShort || "General",
          standards: c.standard || "All Standards",
          code: wCode,
          classes: [],
        };
      }
      wingsMap[wCode].classes.push({
        ...c,
        totalDivisions: wingsMap[wCode].classes.length + 1,
      });
    });

    const academicWings = Object.values(wingsMap).map((w) => ({
      ...w,
      totalDivisions: w.classes.length,
    }));

    return {
      classes,
      academicWings,
      totalCount: classes.length,
    };
  }

  /**
   * Create a new class & division in the school
   */
  static async createClass(data) {
    if (!data.standard || !data.section) {
      throw ApiError.badRequest("Standard (grade) and Section (division letter or stream) are required.");
    }

    const cleanStandardNum = String(data.standard).replace(/^Class\s*/i, "").trim();
    const cleanStandard = `Class ${cleanStandardNum}`;
    const cleanSection = String(data.section).trim();

    // Canonical ID: e.g. "10-C", "11-Bio", "8-D"
    const canonId = `${cleanStandardNum}-${cleanSection}`;
    // Canonical Name: e.g. "Class 10-C", "Class 11-Bio"
    const canonName = `Class ${canonId}`;

    // Resolve Academic Wing
    let resolvedWingShort = data.wingShort || data.wing;
    if (!resolvedWingShort || !WING_METADATA[resolvedWingShort]) {
      resolvedWingShort = getAcademicWingForClass(canonName);
    }
    const wingMeta = WING_METADATA[resolvedWingShort] || WING_METADATA["High School"];

    // Check if class already exists
    const existing = await AcademicClass.findOne({
      $or: [{ id: canonId }, { name: canonName }],
    }).setOptions({ includeDeleted: true });

    if (existing) {
      if (existing.isDeleted) {
        // Restore soft-deleted class with new details
        await existing.restore();
        existing.wing = wingMeta.wing;
        existing.wingShort = wingMeta.wingShort;
        existing.wingCode = wingMeta.wingCode;
        existing.stream = data.stream?.trim() || existing.stream || "General";
        existing.room = data.room?.trim() || existing.room || `${wingMeta.wingShort} Academic Room`;
        existing.mentor = data.mentor?.trim() || existing.mentor || "Assigned Class Mentor";
        if (data.maxCapacity) existing.maxCapacity = Number(data.maxCapacity);
        await existing.save();
        return existing;
      }
      throw ApiError.conflict(`Academic division '${canonName}' already exists in the school register.`);
    }

    // Default stream depending on wing
    let defaultStream = "General";
    if (wingMeta.wingCode === "lp_school") defaultStream = "Primary";
    else if (wingMeta.wingCode === "higher_secondary") {
      defaultStream = /science|bio|math/i.test(cleanSection)
        ? "Bio-Maths"
        : /comm/i.test(cleanSection)
        ? "Commerce"
        : /hum|arts|soc/i.test(cleanSection)
        ? "Humanities"
        : "Higher Secondary General";
    }

    const newClass = await AcademicClass.create({
      id: canonId,
      name: canonName,
      standard: cleanStandard,
      section: cleanSection,
      wing: wingMeta.wing,
      wingShort: wingMeta.wingShort,
      wingCode: wingMeta.wingCode,
      stream: data.stream?.trim() || defaultStream,
      room: data.room?.trim() || `${wingMeta.wingShort} Academic Room`,
      mentor: data.mentor?.trim() || "Assigned Class Mentor",
      maxCapacity: Number(data.maxCapacity) || 45,
      enrolled: 0,
      turnoutRate: "100.0%",
      syncStatus: "Active & Verified",
      isCustom: true,
    });

    return newClass;
  }

  /**
   * Update an academic class details
   */
  static async updateClass(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid class ID format.");
    }

    const cls = await AcademicClass.findById(id);
    if (!cls) {
      throw ApiError.notFound("Academic class division not found.");
    }

    if (data.room !== undefined) cls.room = data.room.trim();
    if (data.mentor !== undefined) cls.mentor = data.mentor.trim();
    if (data.stream !== undefined) cls.stream = data.stream.trim();
    if (data.maxCapacity !== undefined) cls.maxCapacity = Number(data.maxCapacity) || cls.maxCapacity;

    await cls.save();
    return cls;
  }

  /**
   * Delete / Archive an academic class division
   */
  static async deleteClass(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid class ID format.");
    }

    const cls = await AcademicClass.findById(id);
    if (!cls) {
      throw ApiError.notFound("Academic class division not found.");
    }

    // Guard: Check if students are actively enrolled in this class
    const studentCount = await Student.countDocuments({
      $or: [
        { classDivision: cls.name },
        { className: cls.name },
        { division: cls.id },
      ],
    });

    if (studentCount > 0) {
      throw ApiError.badRequest(
        `Cannot remove division '${cls.name}' because ${studentCount} students are currently enrolled in it. Please reassign the students before removing this division.`
      );
    }

    await cls.softDelete();
    return cls;
  }
}

export default ClassService;
