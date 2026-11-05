import { validateExamDate } from "../utils/examDateValidator.js";

export const createExamSchema = {
  body: {
    subject: {
      required: true,
      message: "Subject name is required.",
    },
    date: {
      required: true,
      message: "Exam date is required.",
      custom: (val) => validateExamDate(val),
    },
    qpCode: {
      required: true,
      message: "Question paper code (QP Code) is required.",
    },
  },
};

export const updateExamSchema = {
  params: {
    id: {
      required: true,
      message: "Exam schedule ID is required in URL path.",
    },
  },
  body: {
    date: {
      custom: (val) => {
        if (!val) return true;
        return validateExamDate(val);
      },
    },
  },
};
