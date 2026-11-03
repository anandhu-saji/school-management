import { PaymentService } from "../../services/payment.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

/**
 * Controller: Get fee payments with filters, pagination & live summary metrics
 * Route: GET /api/admin/payments
 */
export const getFeePayments = asyncHandler(async (req, res) => {
  const result = await PaymentService.getFeePayments(req.query);
  return ApiResponse.ok(res, result);
});

/**
 * Controller: Get live summary aggregation for fee payments
 * Route: GET /api/admin/payments/summary
 */
export const getPaymentSummary = asyncHandler(async (req, res) => {
  const summary = await PaymentService.calculateSummaryMetrics();
  return ApiResponse.ok(res, { summary });
});

/**
 * Controller: Record new student fee payment
 * Route: POST /api/admin/payments
 */
export const createFeePayment = asyncHandler(async (req, res) => {
  const payment = await PaymentService.createFeePayment(req.body);
  return ApiResponse.created(res, {
    message: "New fee payment recorded into ledger!",
    payment,
  });
});

/**
 * Controller: Update fee payment record
 * Route: PUT /api/admin/payments/:id
 */
export const updateFeePayment = asyncHandler(async (req, res) => {
  const payment = await PaymentService.updateFeePayment(req.params.id, req.body);
  return ApiResponse.ok(res, {
    message: "Fee payment record updated successfully!",
    payment,
  });
});

/**
 * Controller: Delete fee payment record
 * Route: DELETE /api/admin/payments/:id
 */
export const deleteFeePayment = asyncHandler(async (req, res) => {
  await PaymentService.deleteFeePayment(req.params.id);
  return ApiResponse.ok(res, {
    message: "Receipt deleted from ledger.",
  });
});

/**
 * Helper: Auto-seed initial payments
 */
export const autoSeedInitialPayments = async () => {
  await PaymentService.autoSeedInitialPayments();
};
