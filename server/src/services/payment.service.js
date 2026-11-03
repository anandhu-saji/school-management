import FeePayment from "../models/FeePayment.js";
import Student from "../models/Student.js";
import { ApiError } from "../utils/ApiError.js";

export class PaymentService {
  /**
   * Auto-seed initial fee payments if ledger is empty
   */
  static async autoSeedInitialPayments() {
    try {
      const existing = await FeePayment.countDocuments();
      if (existing > 0) return;

      let students = await Student.find().limit(35).lean();
      if (!students || students.length === 0) {
        students = [
          { name: "Anandhu Saji", admissionNumber: "ADM-14920", classDivision: "Class 10-A", rollNumber: 1 },
          { name: "Aparna M. Nair", admissionNumber: "ADM-14921", classDivision: "Class 10-A", rollNumber: 2 },
          { name: "Gokul Krishna", admissionNumber: "ADM-14922", classDivision: "Class 10-A", rollNumber: 3 },
          { name: "Fathima Nizar", admissionNumber: "ADM-14923", classDivision: "Class 10-B", rollNumber: 4 },
          { name: "Alan Varghese", admissionNumber: "ADM-14924", classDivision: "Class 9-A", rollNumber: 5 },
          { name: "Devika S. Kumar", admissionNumber: "ADM-14925", classDivision: "Class 8-A", rollNumber: 6 },
          { name: "Muhammed Razi", admissionNumber: "ADM-14926", classDivision: "Class 7-A", rollNumber: 7 },
          { name: "Aiswarya Raj", admissionNumber: "ADM-14927", classDivision: "Class 6-A", rollNumber: 8 },
          { name: "Niranjan P.", admissionNumber: "ADM-14928", classDivision: "Class 5-A", rollNumber: 9 },
          { name: "Diya Mariam", admissionNumber: "ADM-14929", classDivision: "Class 4-A", rollNumber: 10 },
          { name: "Kiran Joy", admissionNumber: "ADM-14930", classDivision: "Class 1-A", rollNumber: 11 },
          { name: "Lakshmi Priya", admissionNumber: "ADM-14931", classDivision: "Class 12-Science-A", rollNumber: 12 },
          { name: "Midhun Mohan", admissionNumber: "ADM-14932", classDivision: "Class 12-Commerce", rollNumber: 13 },
          { name: "Sneha Babu", admissionNumber: "ADM-14933", classDivision: "Class 11-Science-B", rollNumber: 14 },
        ];
      }

      const feeTemplates = [
        { feeCategory: "Bus Fee", totalAmount: 4500, term: "Monthly Bus Pass", remarks: "School Bus Route 03 - Rajakkad Town to Kallar" },
        { feeCategory: "Annual Fee", totalAmount: 6800, term: "Annual", remarks: "Composite Academic & Amenities Fee 2026-27" },
        { feeCategory: "PTA Fund", totalAmount: 1500, term: "Annual", remarks: "Parent-Teacher Association Development Fund" },
        { feeCategory: "Bus Fee", totalAmount: 4800, term: "Monthly Bus Pass", remarks: "School Bus Route 01 - Ponmudi & Bisonvalley" },
        { feeCategory: "Lab & Computer Fee", totalAmount: 2200, term: "Term 1", remarks: "High-Tech Computer Lab & Smart Classroom Charge" },
        { feeCategory: "Special / Exam Fee", totalAmount: 1200, term: "Term 1", remarks: "SCERT Model & Onam Examination Fee" },
        { feeCategory: "Sports & Library", totalAmount: 850, term: "Annual", remarks: "Sports Equipment & Library Lending Card" },
        { feeCategory: "PTA Fund", totalAmount: 1500, term: "Annual", remarks: "General Education Protection Mission Support" },
      ];

      const paymentModes = [
        "UPI / Online (Google Pay / PhonePe)",
        "Net Banking",
        "Cash at School Counter",
        "Bank Challan (SBT/SBI)",
      ];

      const samplePayments = [];
      let receiptCounter = 1042;

      students.forEach((s, idx) => {
        const template1 = feeTemplates[idx % feeTemplates.length];
        const template2 = feeTemplates[(idx + 2) % feeTemplates.length];
        const items = [template1, template2];

        items.forEach((tmpl, subIdx) => {
          receiptCounter++;
          const recNum = `REC-2026-${receiptCounter}`;
          const isPaidFull = (idx + subIdx) % 3 !== 0;
          const isPartial = (idx + subIdx) % 3 === 0 && idx % 2 === 0;

          let amountPaid = tmpl.totalAmount;
          let status = "Paid";
          if (isPartial) {
            amountPaid = Math.round(tmpl.totalAmount * 0.5);
            status = "Partial";
          } else if (!isPaidFull) {
            amountPaid = 0;
            status = "Pending";
          }

          const dueAmount = tmpl.totalAmount - amountPaid;
          const mode = paymentModes[(idx + subIdx) % paymentModes.length];
          const day = 5 + ((idx * 3 + subIdx * 7) % 24);
          const dateStr = `2026-10-${day < 10 ? "0" + day : day}`;

          let wing = "High School";
          const c = s.classDivision || "";
          if (c.includes("11") || c.includes("12") || c.includes("+1") || c.includes("+2")) wing = "Higher Secondary";
          else if (c.includes("8") || c.includes("9") || c.includes("10")) wing = "High School";
          else if (c.includes("5") || c.includes("6") || c.includes("7")) wing = "UP School";
          else wing = "LP School";

          samplePayments.push({
            receiptNumber: recNum,
            studentId: s._id || null,
            studentName: s.name,
            admissionNumber: s.admissionNumber || `ADM-2026-${1000 + idx}`,
            rollNumber: s.rollNumber || idx + 1,
            classDivision: s.classDivision || "Class 10-A",
            wing,
            feeCategory: tmpl.feeCategory,
            academicYear: "2026-2027",
            term: tmpl.term,
            totalAmount: tmpl.totalAmount,
            amountPaid,
            dueAmount,
            status,
            paymentDate: dateStr,
            paymentMode: mode,
            transactionReference:
              status !== "Pending"
                ? mode.includes("UPI")
                  ? `UPI/62904${receiptCounter}`
                  : `CHALLAN-${receiptCounter}`
                : "",
            dueDate: "2026-11-20",
            remarks: tmpl.remarks,
            collectedBy: "Accounts Desk / Sri. R. Krishnan",
          });
        });
      });

      await FeePayment.insertMany(samplePayments);
    } catch (err) {
      console.error("Auto-seed payments error:", err);
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
    const existingCount = await FeePayment.countDocuments();
    if (existingCount === 0) {
      await PaymentService.autoSeedInitialPayments();
    }

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

    let receiptNumber = data.receiptNumber;
    if (!receiptNumber) {
      const count = await FeePayment.countDocuments();
      receiptNumber = `REC-2026-${1100 + count + 1}`;
    }

    const totalAmount = Number(data.totalAmount) || 0;
    const amountPaid = Number(data.amountPaid) || 0;
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
    const existing = await FeePayment.findById(id);
    if (!existing) {
      throw ApiError.notFound("Fee payment record not found.");
    }

    const totalAmount = data.totalAmount !== undefined ? Number(data.totalAmount) : existing.totalAmount;
    const amountPaid = data.amountPaid !== undefined ? Number(data.amountPaid) : existing.amountPaid;
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
    const deleted = await FeePayment.findByIdAndDelete(id);
    if (!deleted) {
      throw ApiError.notFound("Payment record not found.");
    }
    return deleted;
  }
}

export default PaymentService;
