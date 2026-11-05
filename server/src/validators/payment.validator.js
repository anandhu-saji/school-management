import { validateHumanName } from "../utils/nameValidator.js";

export const createPaymentSchema = {
  body: {
    studentName: {
      required: true,
      custom: (val) => validateHumanName(val, "Student name"),
    },
    admissionNumber: {
      required: true,
      message: "Student admission number is required.",
    },
    classDivision: {
      required: true,
      message: "Class division is required.",
    },
    feeCategory: {
      required: true,
      message: "Fee category is required.",
    },
    totalAmount: {
      custom: (val) => {
        if (val !== undefined && val !== null) {
          const num = Number(val);
          if (isNaN(num) || num < 0) {
            return "Total fee amount must be a non-negative number.";
          }
        }
        return true;
      },
    },
    amountPaid: {
      custom: (val, body) => {
        if (val !== undefined && val !== null) {
          const num = Number(val);
          if (isNaN(num) || num < 0) {
            return "Amount paid must be a non-negative number.";
          }
          const total = Number(body.totalAmount);
          if (!isNaN(total) && total >= 0 && num > total) {
            return "Amount paid cannot exceed total billed fee amount.";
          }
        }
        return true;
      },
    },
  },
};

export const updatePaymentSchema = {
  params: {
    id: {
      required: true,
      message: "Payment record ID is required in URL path.",
    },
  },
  body: {
    studentName: {
      custom: (val) => (!val ? true : validateHumanName(val, "Student name")),
    },
    totalAmount: {
      custom: (val) => {
        if (val !== undefined && val !== null) {
          const num = Number(val);
          if (isNaN(num) || num < 0) {
            return "Total fee amount must be a non-negative number.";
          }
        }
        return true;
      },
    },
    amountPaid: {
      custom: (val, body) => {
        if (val !== undefined && val !== null) {
          const num = Number(val);
          if (isNaN(num) || num < 0) {
            return "Amount paid must be a non-negative number.";
          }
          if (body.totalAmount !== undefined && body.totalAmount !== null) {
            const total = Number(body.totalAmount);
            if (!isNaN(total) && total >= 0 && num > total) {
              return "Amount paid cannot exceed total billed fee amount.";
            }
          }
        }
        return true;
      },
    },
  },
};
