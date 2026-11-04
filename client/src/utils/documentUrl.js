export const getDocumentUrl = (url) => {
  if (!url) return "";
  const backendBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
    : "http://localhost:5000";

  let fullUrl = url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`;

  // Attach token for secure document viewing if accessing private documents
  const token = localStorage.getItem("token");
  if (token && fullUrl.includes("/uploads/documents/")) {
    const separator = fullUrl.includes("?") ? "&" : "?";
    fullUrl = `${fullUrl}${separator}token=${encodeURIComponent(token)}`;
  }

  return fullUrl;
};
