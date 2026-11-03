// Helper to extract initials: "Mrs. Priya Nair" -> "PN", "Sri. George K." -> "GK"
export const getInitials = (fullName) => {
  if (!fullName) return "TR";
  const parts = fullName
    .replace(/^(Sri\.|Smt\.|Mrs\.|Mr\.|Dr\.)\s*/i, "")
    .trim()
    .split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
