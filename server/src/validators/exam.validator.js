export const createExamSchema = {
  body: {
    subject: {
      required: true,
      message: "Subject name is required.",
    },
    date: {
      required: true,
      message: "Exam date is required.",
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
};
