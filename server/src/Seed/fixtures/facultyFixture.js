import { getSecondaryFaculty } from "./facultySecondary.js";
import { primaryFaculty } from "./facultyPrimary.js";

export const getFacultyCadre = (teacherUserId) => {
  return [...getSecondaryFaculty(teacherUserId), ...primaryFaculty];
};
