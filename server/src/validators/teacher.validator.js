export const createTeacherSchema = {
  body: {
    name: {
      required: true,
      minLength: 2,
      message: "Teacher name is required (min 2 characters).",
    },
    email: {
      required: true,
      email: true,
      message: "A valid teacher institutional email is required.",
    },
  },
};

export const updateTeacherSchema = {
  params: {
    id: {
      required: true,
      message: "Teacher database ID is required in URL path.",
    },
  },
};
