import mongoose from "mongoose";
import FeePayment from "../../models/FeePayment.js";
import Student from "../../models/Student.js";
import { RazorpayService } from "../razorpay.service.js";
import { ApiError } from "../../utils/ApiError.js";

export class StudentFeesService {
  /**
   * Fetches fee payments ledger and summary for the student
   */
  static async getStudentFees({ studentId, admissionNumber, studentName, studentMongoId }) {
    const query = { $or: [] };

    // studentId on FeePayment is an ObjectId. Ensure we only query studentId with valid ObjectIds.
    const validMongoId = studentMongoId || (studentId && mongoose.Types.ObjectId.isValid(studentId) ? studentId : null);
    if (validMongoId) {
      query.$or.push({ studentId: validMongoId });
    }
    if (admissionNumber) {
      query.$or.push({ admissionNumber });
    }
    if (studentId && typeof studentId === "string" && !mongoose.Types.ObjectId.isValid(studentId)) {
      query.$or.push({ admissionNumber: studentId });
    }
    if (studentName) {
      query.$or.push({ studentName: { $regex: new RegExp(`^${studentName.trim()}$`, "i") } });
    }

    let payments = [];
    if (query.$or.length > 0) {
      payments = await FeePayment.find(query).sort({ paymentDate: -1, createdAt: -1 }).lean();
    }

    if (!payments || payments.length === 0) {
      payments = [];
    }

    let totalBilled = 0;
    let totalPaid = 0;
    let totalDue = 0;

    payments.forEach((p) => {
      totalBilled += p.totalAmount || 0;
      totalPaid += p.amountPaid || 0;
      totalDue += p.dueAmount || 0;
    });

    return {
      payments,
      summary: {
        totalBilled,
        totalPaid,
        totalDue,
        status: totalDue === 0 ? "All Dues Cleared ✓" : `₹${totalDue} Pending Due`,
      },
    };
  }

  /**
   * Creates a Razorpay Order for online fee payment
   */
  static async createOnlineFeeOrder({ studentId, admissionNumber, studentName, feePaymentId, amount, feeCategory }) {
    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      throw ApiError.badRequest("Please enter a valid positive payment amount.");
    }

    // Lookup fee payment if ID provided
    let feeRecord = null;
    if (feePaymentId && mongoose.Types.ObjectId.isValid(feePaymentId)) {
      feeRecord = await FeePayment.findById(feePaymentId);
      if (feeRecord && numAmount > feeRecord.dueAmount && feeRecord.dueAmount > 0) {
        throw ApiError.badRequest(`Amount cannot exceed the pending due balance of ₹${feeRecord.dueAmount}.`);
      }
    }

    const receiptTag = `rec_${Date.now().toString().slice(-8)}`;

    const order = await RazorpayService.createOrder({
      amount: numAmount,
      receipt: receiptTag,
      notes: {
        admissionNumber: admissionNumber || "ADM-14920",
        studentName: studentName || "Student Scholar",
        feeCategory: feeCategory || feeRecord?.feeCategory || "Annual Fee",
        feePaymentId: feePaymentId || "general",
      },
    });

    return {
      order,
      keyId: RazorpayService.getKeyId(),
      isSimulated: Boolean(order.isSimulated || !RazorpayService.isLiveConfigured()),
      amount: numAmount,
      currency: "INR",
      receiptTag,
    };
  }

  /**
   * Verifies Razorpay payment signature and updates or creates fee payment record
   */
  static async verifyAndProcessPayment({
    studentId,
    admissionNumber,
    studentName,
    classDivision,
    orderId,
    paymentId,
    signature,
    feePaymentId,
    amountPaid,
    feeCategory,
    term,
    remarks,
  }) {
    // 1. Authenticate signature with Razorpay HMAC SHA256
    RazorpayService.verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
    });

    const parsedAmount = Number(amountPaid);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      throw ApiError.badRequest("Invalid payment amount received.");
    }

    let paymentRecord = null;
    const today = new Date().toISOString().split("T")[0];

    // Case A: Updating an existing partial or pending fee payment
    if (feePaymentId && mongoose.Types.ObjectId.isValid(feePaymentId)) {
      paymentRecord = await FeePayment.findById(feePaymentId);
    }

    if (paymentRecord) {
      const newAmountPaid = (paymentRecord.amountPaid || 0) + parsedAmount;
      const newDue = Math.max(0, (paymentRecord.totalAmount || 0) - newAmountPaid);

      paymentRecord.amountPaid = newAmountPaid;
      paymentRecord.dueAmount = newDue;
      paymentRecord.status = newDue === 0 ? "Paid" : "Partial";
      paymentRecord.paymentDate = today;
      paymentRecord.paymentMode = "Razorpay / Online";
      paymentRecord.transactionReference = paymentId;
      paymentRecord.razorpayOrderId = orderId;
      paymentRecord.razorpayPaymentId = paymentId;
      paymentRecord.razorpaySignature = signature;
      paymentRecord.remarks = remarks || `Cleared ₹${parsedAmount} via Razorpay Online Payment. Txn: ${paymentId}`;
      paymentRecord.collectedBy = "Razorpay Online Payment Gateway";

      await paymentRecord.save();
    } else {
      // Case B: Create new fee payment receipt
      const recNumber = `REC-2026-${Date.now().toString().slice(-6)}`;

      paymentRecord = await FeePayment.create({
        receiptNumber: recNumber,
        studentId: studentId || undefined,
        studentName: studentName || "Student Scholar",
        admissionNumber: admissionNumber || "ADM-14920",
        classDivision: classDivision || "Class 10-A",
        wing: "High School",
        feeCategory: feeCategory || "Annual Fee",
        term: term || "Term 1",
        totalAmount: parsedAmount,
        amountPaid: parsedAmount,
        dueAmount: 0,
        paymentDate: today,
        paymentMode: "Razorpay / Online",
        transactionReference: paymentId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        status: "Paid",
        collectedBy: "Razorpay Online Payment Gateway",
        remarks: remarks || `Full payment of ₹${parsedAmount} via Razorpay Online Payment. Txn: ${paymentId}`,
      });
    }

    return {
      success: true,
      message: `Payment of ₹${parsedAmount} verified and recorded successfully via Razorpay.`,
      payment: paymentRecord,
    };
  }
}

export default StudentFeesService;
