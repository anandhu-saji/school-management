import mongoose from "mongoose";
import FeePayment from "../models/FeePayment.js";
import Student from "../models/Student.js";
import { ApiError } from "../utils/ApiError.js";
import { validateHumanName } from "../utils/nameValidator.js";
import { getAcademicWingForClass, normalizeClassDivision } from "../utils/classData.js";

export class PaymentService {
  /**
   * Auto-seed initial fee payments if ledger is empty
   */
  static async autoSeedInitialPayments() {
    return;
  }

  /**
   * Calculate live fee aggregation metrics across all records
   */
  /**
   * Synchronize all FeePayment records with the latest student class, division, wing and name
   */
  static async syncPaymentsWithStudents() {
    try {
      const allPayments = await FeePayment.find({}).lean();
      if (!allPayments || allPayments.length === 0) return;

      const allStudents = await Student.find({}).lean();
      if (!allStudents || allStudents.length === 0) return;

      const studentById = new Map();
      const studentByAdm = new Map();
      const studentByName = new Map();

      for (const s of allStudents) {
        if (s._id) studentById.set(s._id.toString(), s);
        if (s.admissionNumber) studentByAdm.set(s.admissionNumber.toLowerCase().trim(), s);
        if (s.name) studentByName.set(s.name.toLowerCase().trim(), s);
      }

      for (const p of allPayments) {
        let std = null;
        if (p.studentId && studentById.has(p.studentId.toString())) {
          std = studentById.get(p.studentId.toString());
        }
        if (!std && p.admissionNumber && studentByAdm.has(p.admissionNumber.toLowerCase().trim())) {
          std = studentByAdm.get(p.admissionNumber.toLowerCase().trim());
        }
        if (!std && p.studentName && studentByName.has(p.studentName.toLowerCase().trim())) {
          std = studentByName.get(p.studentName.toLowerCase().trim());
        }

        if (std) {
          const norm = normalizeClassDivision(std.classDivision || std.className || std.division);
          const currentClass = norm ? norm.name : (std.classDivision || std.className || p.classDivision);
          const currentWing = getAcademicWingForClass(currentClass);

          const needsUpdate =
            p.classDivision !== currentClass ||
            p.wing !== currentWing ||
            p.studentName !== std.name ||
            p.admissionNumber !== std.admissionNumber ||
            !p.studentId ||
            (p.studentId.toString() !== std._id.toString());

          if (needsUpdate) {
            await FeePayment.findByIdAndUpdate(p._id, {
              $set: {
                studentId: std._id,
                studentName: std.name,
                admissionNumber: std.admissionNumber,
                rollNumber: std.rollNumber || p.rollNumber,
                classDivision: currentClass,
                wing: currentWing,
              },
            });
          }
        } else {
          const norm = normalizeClassDivision(p.classDivision);
          const canonClass = norm ? norm.name : p.classDivision;
          const correctWing = getAcademicWingForClass(canonClass);
          if (p.wing !== correctWing || p.classDivision !== canonClass) {
            await FeePayment.findByIdAndUpdate(p._id, {
              $set: {
                classDivision: canonClass,
                wing: correctWing,
              },
            });
          }
        }
      }
    } catch (err) {
      console.error("[PaymentService] Sync error:", err);
    }
  }

  /**
   * Calculate live fee aggregation metrics across all records
   */
  static async calculateSummaryMetrics() {
    const allPayments = await FeePayment.find({}).lean();
    let totalBilled = 0;
    let totalCollected = 0;
    let totalDue = 0;
    let busFeeCollected = 0;
    let busFeeDue = 0;
    let annualFeeCollected = 0;
    let annualFeeDue = 0;
    let ptaFundCollected = 0;
    let ptaFundDue = 0;
    let labFeeCollected = 0;
    let labFeeDue = 0;
    let otherCollected = 0;

    const wingStats = {
      "LP School": { total: 0, collected: 0, due: 0, count: 0 },
      "UP School": { total: 0, collected: 0, due: 0, count: 0 },
      "High School": { total: 0, collected: 0, due: 0, count: 0 },
      "Higher Secondary": { total: 0, collected: 0, due: 0, count: 0 },
    };

    allPayments.forEach((p) => {
      totalBilled += p.totalAmount || 0;
      totalCollected += p.amountPaid || 0;
      totalDue += p.dueAmount || 0;

      if (p.feeCategory === "Bus Fee") {
        busFeeCollected += p.amountPaid || 0;
        busFeeDue += p.dueAmount || 0;
      } else if (p.feeCategory === "Annual Fee") {
        annualFeeCollected += p.amountPaid || 0;
        annualFeeDue += p.dueAmount || 0;
      } else if (p.feeCategory === "PTA Fund") {
        ptaFundCollected += p.amountPaid || 0;
        ptaFundDue += p.dueAmount || 0;
      } else if (p.feeCategory === "Lab & Computer Fee") {
        labFeeCollected += p.amountPaid || 0;
        labFeeDue += p.dueAmount || 0;
      } else {
        otherCollected += p.amountPaid || 0;
      }

      const canonClass = normalizeClassDivision(p.classDivision)?.name || p.classDivision;
      const targetWing = getAcademicWingForClass(canonClass) || p.wing || "High School";
      if (targetWing && wingStats[targetWing]) {
        wingStats[targetWing].total += p.totalAmount || 0;
        wingStats[targetWing].collected += p.amountPaid || 0;
        wingStats[targetWing].due += p.dueAmount || 0;
        wingStats[targetWing].count += 1;
      }
    });

    const collectionRate =
      totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) + "%" : "0%";

    return {
      totalBilled,
      totalCollected,
      totalDue,
      collectionRate,
      busFee: { collected: busFeeCollected, due: busFeeDue },
      annualFee: { collected: annualFeeCollected, due: annualFeeDue },
      ptaFund: { collected: ptaFundCollected, due: ptaFundDue },
      labFee: { collected: labFeeCollected, due: labFeeDue },
      otherFee: { collected: otherCollected },
      wingStats,
    };
  }

  /**
   * Fetch fee payment records with filter query, pagination & summary stats
   */
  static async getFeePayments({
    search = "",
    category = "All",
    status = "All",
    division = "All",
    wing = "All",
    page = 1,
    limit = 10,
  }) {
    // Auto-seed disabled

    const query = {};

    if (search && search.trim() !== "") {
      const s = search.trim();
      query.$or = [
        { studentName: { $regex: s, $options: "i" } },
        { admissionNumber: { $regex: s, $options: "i" } },
        { receiptNumber: { $regex: s, $options: "i" } },
        { transactionReference: { $regex: s, $options: "i" } },
      ];
    }

    if (category && category !== "All") query.feeCategory = category;
    if (status && status !== "All") query.status = status;
    if (division && division !== "All") query.classDivision = division;
    if (wing && wing !== "All") query.wing = wing;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    await PaymentService.syncPaymentsWithStudents();

    if (division && division !== "All") {
      const norm = normalizeClassDivision(division);
      const canonName = norm ? norm.name : division;
      const rawId = norm ? norm.id : division;
      query.$or = (query.$or || []).concat([
        { classDivision: canonName },
        { classDivision: rawId },
        { classDivision: division },
      ]);
      delete query.classDivision;
    }

    const [paymentsRaw, totalRecords, summary] = await Promise.all([
      FeePayment.find(query).sort({ paymentDate: -1, createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      FeePayment.countDocuments(query),
      PaymentService.calculateSummaryMetrics(),
    ]);

    const payments = paymentsRaw.map((p) => {
      const norm = normalizeClassDivision(p.classDivision);
      const canonClass = norm ? norm.name : p.classDivision;
      const canonWing = getAcademicWingForClass(canonClass) || p.wing;
      return {
        ...p,
        classDivision: canonClass,
        wing: canonWing,
      };
    });

    return {
      payments,
      summary,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum) || 1,
      },
    };
  }

  /**
   * Get single fee payment record by ID
   */
  static async getPaymentById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid payment ID format.");
    }
    const payment = await FeePayment.findById(id).lean();
    if (!payment) {
      throw ApiError.notFound("Payment record not found.");
    }
    return payment;
  }

  /**
   * Record a new fee payment
   */
  static async createFeePayment(data) {
    if (!data.studentName || !data.admissionNumber || !data.classDivision) {
      throw ApiError.badRequest("Student name, admission number, and class division are mandatory.");
    }

    const nameCheck = validateHumanName(data.studentName, "Student name");
    if (nameCheck !== true) {
      throw ApiError.badRequest(nameCheck);
    }

    const totalAmount = Number(data.totalAmount) || 0;
    const amountPaid = Number(data.amountPaid) || 0;

    if (isNaN(totalAmount) || totalAmount < 0) {
      throw ApiError.badRequest("Total fee amount must be a non-negative number.");
    }
    if (isNaN(amountPaid) || amountPaid < 0) {
      throw ApiError.badRequest("Amount paid must be a non-negative number.");
    }
    if (amountPaid > totalAmount) {
      throw ApiError.badRequest("Amount paid cannot exceed total billed fee amount.");
    }

    let receiptNumber = data.receiptNumber;
    if (!receiptNumber) {
      const count = await FeePayment.countDocuments();
      receiptNumber = `REC-2026-${1100 + count + 1}`;
    }

    const dueAmount = Math.max(0, totalAmount - amountPaid);

    let status = data.status;
    if (!status) {
      if (dueAmount === 0 && amountPaid > 0) status = "Paid";
      else if (amountPaid > 0 && dueAmount > 0) status = "Partial";
      else status = "Pending";
    }

    let normDiv = normalizeClassDivision(data.classDivision);
    let classDivision = normDiv ? normDiv.name : data.classDivision;
    let wing = getAcademicWingForClass(classDivision);

    let studentId = data.studentId && mongoose.Types.ObjectId.isValid(data.studentId) ? data.studentId : null;
    let studentName = data.studentName.trim();
    let admissionNumber = data.admissionNumber.trim();
    let rollNumber = data.rollNumber || null;

    if (!studentId || !studentName) {
      const std = await Student.findOne({
        $or: [
          studentId ? { _id: studentId } : null,
          admissionNumber ? { admissionNumber } : null,
        ].filter(Boolean),
      }).lean();
      if (std) {
        studentId = std._id;
        studentName = std.name;
        admissionNumber = std.admissionNumber || admissionNumber;
        rollNumber = std.rollNumber || rollNumber;
        const stdNorm = normalizeClassDivision(std.classDivision || std.className || std.division);
        if (stdNorm) {
          classDivision = stdNorm.name;
          wing = getAcademicWingForClass(classDivision);
        }
      }
    }

    const payment = await FeePayment.create({
      ...data,
      studentId,
      studentName,
      admissionNumber,
      rollNumber,
      classDivision,
      wing,
      receiptNumber,
      totalAmount,
      amountPaid,
      dueAmount,
      status,
      paymentDate: data.paymentDate || new Date().toISOString().split("T")[0],
    });

    return payment;
  }

  /**
   * Update fee payment record
   */
  static async updateFeePayment(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid payment ID format.");
    }

    if (data.studentName !== undefined) {
      const nameCheck = validateHumanName(data.studentName, "Student name");
      if (nameCheck !== true) {
        throw ApiError.badRequest(nameCheck);
      }
    }

    if (data.classDivision) {
      const norm = normalizeClassDivision(data.classDivision);
      data.classDivision = norm ? norm.name : data.classDivision;
      data.wing = getAcademicWingForClass(data.classDivision);
    }

    const existing = await FeePayment.findById(id);
    if (!existing) {
      throw ApiError.notFound("Fee payment record not found.");
    }

    const totalAmount = data.totalAmount !== undefined ? Number(data.totalAmount) : existing.totalAmount;
    const amountPaid = data.amountPaid !== undefined ? Number(data.amountPaid) : existing.amountPaid;

    if (isNaN(totalAmount) || totalAmount < 0) {
      throw ApiError.badRequest("Total fee amount must be a non-negative number.");
    }
    if (isNaN(amountPaid) || amountPaid < 0) {
      throw ApiError.badRequest("Amount paid must be a non-negative number.");
    }
    if (amountPaid > totalAmount) {
      throw ApiError.badRequest("Amount paid cannot exceed total billed fee amount.");
    }

    const dueAmount = Math.max(0, totalAmount - amountPaid);

    let status = data.status;
    if (!status) {
      if (dueAmount === 0 && amountPaid > 0) status = "Paid";
      else if (amountPaid > 0 && dueAmount > 0) status = "Partial";
      else status = "Pending";
    }

    const updated = await FeePayment.findByIdAndUpdate(
      id,
      {
        $set: {
          ...data,
          studentId: data.studentId && mongoose.Types.ObjectId.isValid(data.studentId) ? data.studentId : existing.studentId,
          totalAmount,
          amountPaid,
          dueAmount,
          status,
        },
      },
      { new: true, runValidators: true }
    );

    return updated;
  }

  /**
   * Delete fee payment record
   */
  static async deleteFeePayment(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid payment ID format.");
    }
    const deleted = await FeePayment.findByIdAndDelete(id);
    if (!deleted) {
      throw ApiError.notFound("Payment record not found.");
    }
    return deleted;
  }
}

export default PaymentService;
