import Student from "../../models/Student.js";
import { ALL_CLASSES, normalizeClassDivision } from "../../utils/classData.js";

export class StudentQueryService {
  /**
   * Fetch all student admission records for admin census table with backend search, filter, and pagination
   */
  static async getStudentsRecords({
    limit,
    includeDeleted = false,
    deletedOnly = false,
    search = "",
    division = "",
    page,
    pageSize,
  } = {}) {
    const filter = {};
    if (deletedOnly) {
      filter.isDeleted = true;
    }

    const andConditions = [];

    // Backend Search by name, roll number, admission number, Sampoorna ID, Aadhaar, guardian, etc.
    if (search && search.trim() !== "") {
      const q = search.trim();
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escaped, "i");
      const numVal = Number(q);

      const orConditions = [
        { name: searchRegex },
        { admissionNumber: searchRegex },
        { sampoornaId: searchRegex },
        { studentId: searchRegex },
        { email: searchRegex },
        { aadhaarNumber: searchRegex },
        { guardian: searchRegex },
        { fatherName: searchRegex },
        { motherName: searchRegex },
        { parentContact: searchRegex },
        { phone: searchRegex },
      ];

      if (!isNaN(numVal)) {
        orConditions.push({ rollNumber: numVal });
      }

      andConditions.push({ $or: orConditions });
    }

    // Backend Division filter
    if (division && division !== "All") {
      const cleanDiv = normalizeClassDivision(division);
      const escapedDiv = cleanDiv.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = cleanDiv.replace(/[\s-]/g, "").split("").join("[\\s-]*");
      andConditions.push({
        $or: [
          { classDivision: new RegExp(`^${escapedDiv}$`, "i") },
          { classDivision: new RegExp(`^${pattern}$`, "i") },
          { classDivision: new RegExp(pattern, "i") },
        ],
      });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    let query = Student.find(filter).sort({ rollNumber: 1, name: 1 });
    if (includeDeleted) {
      query = query.setOptions({ includeDeleted: true });
    }

    let pagination = null;
    if (page && pageSize) {
      const pageNum = Math.max(1, Number(page));
      const sizeNum = Math.max(1, Number(pageSize));
      const totalFiltered = await Student.countDocuments(filter);
      query = query.skip((pageNum - 1) * sizeNum).limit(sizeNum);
      pagination = {
        currentPage: pageNum,
        pageSize: sizeNum,
        totalRecords: totalFiltered,
        totalPages: Math.ceil(totalFiltered / sizeNum) || 1,
      };
    } else if (limit) {
      query = query.limit(Number(limit));
    }

    const studentsRaw = await query.lean();

    // Compute live census stats
    const allLiveStudents = await Student.find(deletedOnly ? { isDeleted: true } : {}).lean();
    const stats = {
      totalStrength: allLiveStudents.length,
      maleStudents: allLiveStudents.filter(
        (s) => s.gender && s.gender.toLowerCase() === "male"
      ).length,
      femaleStudents: allLiveStudents.filter(
        (s) => s.gender && s.gender.toLowerCase() === "female"
      ).length,
      activeDivisionsCount: new Set(
        allLiveStudents
          .map((s) => normalizeClassDivision(s.classDivision))
          .filter(Boolean)
      ).size,
      totalDivisionsCapacity: ALL_CLASSES.length,
    };

    const students = studentsRaw.map((s) => {
      const formattedDOB = s.dateOfBirth
        ? new Date(s.dateOfBirth).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "N/A";

      const formattedAdmDate = s.admissionDate
        ? new Date(s.admissionDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "N/A";

      return {
        _id: s._id,
        id: s._id,
        admissionNumber: s.admissionNumber,
        sampoornaId: s.sampoornaId,
        studentId: s.studentId || s.admissionNumber,
        name: s.name,
        gender: s.gender,
        classDivision: normalizeClassDivision(s.classDivision),
        rollNumber: s.rollNumber,
        dateOfBirth: formattedDOB,
        rawDOB: s.dateOfBirth,
        bloodGroup: s.bloodGroup || "O+",
        religion: s.religion || "General",
        caste: s.caste || "",
        category: s.category || "General",
        aadhaarNumber: s.aadhaarNumber,
        guardian: s.guardian,
        relationWithGuardian: s.relationWithGuardian || "Parent",
        fatherName: s.fatherName || "",
        motherName: s.motherName || "",
        parentContact: s.parentContact || s.phone,
        phone: s.phone || s.parentContact,
        email: s.email,
        admissionDate: formattedAdmDate,
        mediumOfInstruction: s.mediumOfInstruction || "Malayalam",
        firstLanguage: s.firstLanguage || "Malayalam",
        documentsSubmitted: s.documentsSubmitted || {
          birthCertificate: true,
          transferCertificate: false,
          aadhaarCopy: true,
          rationCard: false,
        },
        documentUrls: s.documentUrls || {
          aadhaarCard: "",
          birthCertificate: "",
          rationCard: "",
          transferCertificate: "",
        },
        scholarships: s.scholarships || [],
        concessionEligible: Boolean(s.concessionEligible),
        isDeleted: Boolean(s.isDeleted),
        deletedAt: s.deletedAt,
        status: s.status || "Active",
        fullAddress:
          s.fullAddress ||
          (s.address
            ? [
                s.address.houseName,
                s.address.street,
                s.address.postOffice,
                s.address.district,
                s.address.pincode ? `PIN: ${s.address.pincode}` : "",
              ]
                .filter(Boolean)
                .join(", ")
            : "Rajakkad P.O, Idukki, Kerala"),
        previousSchool: s.previousSchool || "",
        tcNumber: s.tcNumber || "",
        identificationMarks: s.identificationMarks || "",
      };
    });

    return {
      stats,
      count: students.length,
      students,
      ...(pagination ? { pagination } : {}),
    };
  }
}

export default StudentQueryService;
