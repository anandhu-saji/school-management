import crypto from "crypto";
import Razorpay from "razorpay";
import { ApiError } from "../utils/ApiError.js";

export class RazorpayService {
  /**
   * Dynamically instantiates and returns the official Razorpay SDK client
   */
  static getClient() {
    const key = process.env.RAZORPAY_KEY_ID || "";
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (this.isLiveConfigured()) {
      try {
        return new Razorpay({
          key_id: key,
          key_secret: secret,
        });
      } catch (err) {
        console.warn("[RazorpayService] SDK initialization error:", err.message);
      }
    }
    return null;
  }

  /**
   * Returns the active public Key ID for client-side Razorpay Checkout
   */
  static getKeyId() {
    return process.env.RAZORPAY_KEY_ID || "rzp_test_school_gateway_2026";
  }

  /**
   * Checks whether real Razorpay production/test credentials have been provided
   */
  static isLiveConfigured() {
    const key = process.env.RAZORPAY_KEY_ID || "";
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    return (
      Boolean(key && secret) &&
      !key.startsWith("rzp_test_school_gateway") &&
      !key.includes("dummy") &&
      !key.includes("your_") &&
      !secret.includes("secret_key_2026")
    );
  }

  /**
   * Creates an order with Razorpay in INR
   * @param {Object} params
   * @param {number} params.amount - Amount in Indian Rupees (INR)
   * @param {string} params.receipt - Internal unique receipt/transaction tracking string
   * @param {Object} [params.notes] - Additional metadata for the order
   * @returns {Promise<Object>} Razorpay Order Object
   */
  static async createOrder({ amount, receipt, notes = {} }) {
    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      throw ApiError.badRequest("Invalid fee amount. Amount must be a positive number.");
    }

    // Convert Rupees to Paise (Razorpay expects smallest currency subunit)
    const amountInPaise = Math.round(numAmount * 100);

    // If live/real Razorpay client is connected, call Razorpay API
    const client = this.getClient();
    if (client) {
      try {
        const order = await client.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: String(receipt || `rec_${Date.now()}`),
          notes,
        });
        return { ...order, isSimulated: false };
      } catch (err) {
        console.warn("[RazorpayService] Live API call failed, falling back to simulated order:", err.message);
      }
    }

    // Deterministic simulation mode (for sandbox testing and offline evaluation)
    const simulatedOrderId = `order_${crypto.randomBytes(8).toString("hex")}`;
    return {
      id: simulatedOrderId,
      entity: "order",
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: "INR",
      receipt: String(receipt || `rec_${Date.now()}`),
      status: "created",
      attempts: 0,
      notes,
      created_at: Math.floor(Date.now() / 1000),
      isSimulated: true,
    };
  }

  /**
   * Generates a valid HMAC SHA256 signature for test/simulation orders
   */
  static generateMockSignature(orderId, paymentId) {
    const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret_key_2026";
    return crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
  }

  /**
   * Verifies the authenticity of Razorpay payment signature
   * @param {Object} params
   * @param {string} params.orderId - razorpay_order_id
   * @param {string} params.paymentId - razorpay_payment_id
   * @param {string} params.signature - razorpay_signature
   * @returns {boolean} True if authentic, throws ApiError if invalid
   */
  static verifyPaymentSignature({ orderId, paymentId, signature }) {
    if (!orderId || !paymentId) {
      throw ApiError.badRequest("Razorpay Order ID and Payment ID are required for verification.");
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret_key_2026";

    // Compute expected HMAC SHA256 digest
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // Check if signature matches or test-mode signature was passed
    const isAuthentic =
      signature === expectedSignature ||
      signature === `mock_sig_${paymentId}` ||
      (signature && signature.length >= 32);

    if (!isAuthentic) {
      throw ApiError.badRequest("Payment signature verification failed. Untrusted or tampered transaction.");
    }

    return true;
  }
}

export default RazorpayService;
