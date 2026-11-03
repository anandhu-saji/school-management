export const saveAttendanceSchema = {
  body: {
    date: {
      required: true,
      message: "Attendance register date is required.",
    },
    records: {
      required: true,
      type: "array",
      message: "Student attendance records array is required.",
    },
  },
};
