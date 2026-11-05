/**
 * Kerala General Education / Pareeksha Bhavan Grading System
 * @param {number} marks - Marks obtained
 * @param {number} [maxMarks=80] - Maximum score possible
 * @param {boolean} [isAbsent=false] - Whether student was absent
 * @returns {{ grade: string, percentage: number, label: string, passed: boolean }}
 */
export const calculateKeralaGrade = (marks, maxMarks = 80, isAbsent = false) => {
  if (isAbsent) {
    return {
      grade: "AB",
      percentage: 0,
      label: "Absent",
      passed: false,
    };
  }

  const score = Number(marks) || 0;
  const max = Number(maxMarks) || 80;
  if (max <= 0) {
    return { grade: "E", percentage: 0, label: "Needs Improvement", passed: false };
  }

  const percentage = Math.min(100, Math.max(0, Math.round((score / max) * 100)));

  if (percentage >= 90) return { grade: "A+", percentage, label: "Outstanding (90-100%)", passed: true };
  if (percentage >= 80) return { grade: "A", percentage, label: "Excellent (80-89%)", passed: true };
  if (percentage >= 70) return { grade: "B+", percentage, label: "Very Good (70-79%)", passed: true };
  if (percentage >= 60) return { grade: "B", percentage, label: "Good (60-69%)", passed: true };
  if (percentage >= 50) return { grade: "C+", percentage, label: "Above Average (50-59%)", passed: true };
  if (percentage >= 40) return { grade: "C", percentage, label: "Average (40-49%)", passed: true };
  if (percentage >= 30) return { grade: "D+", percentage, label: "Marginal (30-39%)", passed: true };
  return { grade: "E", percentage, label: "Failed / Needs Retest (<30%)", passed: false };
};

export default calculateKeralaGrade;
