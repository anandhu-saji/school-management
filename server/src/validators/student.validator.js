export const createStudentSchema = {
  body: {
    name: {
      required: true,
      minLength: 2,
      message: "Student full name is required (min 2 characters).",
    },
  },
};

export const updateStudentSchema = {
  params: {
    id: {
      required: true,
      message: "Student database ID is required in URL path.",
    },
  },
};
