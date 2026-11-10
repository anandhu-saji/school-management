import mongoose from "mongoose";
import FeePayment from "../models/FeePayment.js";
import Student from "../models/Student.js";
import { ApiError } from "../utils/ApiError.js";
import { validateHumanName } from "../utils/nameValidator.js";

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

      if (p.wing && wingStats[p.wing]) {
        wingStats[p.wing].total += p.totalAmount || 0;
        wingStats[p.wing].collected += p.amountPaid || 0;
        wingStats[p.wing].due += p.dueAmount || 0;
        wingStats[p.wing].count += 1;
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

    const [payments, totalRecords, summary] = await Promise.all([
      FeePayment.find(query).sort({ paymentDate: -1, createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      FeePayment.countDocuments(query),
      PaymentService.calculateSummaryMetrics(),
    ]);

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

    let wing = data.wing;
    if (!wing) {
      const c = data.classDivision || "";
      if (c.includes("11") || c.includes("12") || c.includes("+1") || c.includes("+2")) wing = "Higher Secondary";
      else if (c.includes("8") || c.includes("9") || c.includes("10")) wing = "High School";
      else if (c.includes("5") || c.includes("6") || c.includes("7")) wing = "UP School";
      else wing = "LP School";
    }

    const payment = await FeePayment.create({
      ...data,
      studentId: data.studentId && mongoose.Types.ObjectId.isValid(data.studentId) ? data.studentId : null,
      receiptNumber,
      totalAmount,
      amountPaid,
      dueAmount,
      status,
      wing,
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
