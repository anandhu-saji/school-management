export const createPaymentSchema = {
  body: {
    studentName: {
      required: true,
      message: "Student name is required.",
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
  },
};

export const updatePaymentSchema = {
  params: {
    id: {
      required: true,
      message: "Payment record ID is required in URL path.",
    },
  },
};
