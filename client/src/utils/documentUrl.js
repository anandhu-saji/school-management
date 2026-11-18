export const getDocumentUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Ensure leading slash
  let cleanUrl = url.startsWith("/") ? url : `/${url}`;

  // Ensure uploads are routed through /api/uploads so that reverse proxies
  // (like Nginx on AWS EC2) forward the request to the Node/Express backend
  if (cleanUrl.startsWith("/uploads/")) {
    cleanUrl = `/api${cleanUrl}`;
  }

  // In production (or when not running on localhost), always use relative URL
  // so browser uses the current protocol & domain (e.g. https://schoolportal.anandhusaji.in/api/uploads/...)
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  let backendBase = "";
  if (isLocalhost) {
    backendBase = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
      : "http://localhost:5000";
  }

  let fullUrl = backendBase ? `${backendBase}${cleanUrl}` : cleanUrl;

  // Attach token for secure document viewing if accessing private documents
  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  if (token && fullUrl.includes("/documents/")) {
    const separator = fullUrl.includes("?") ? "&" : "?";
    fullUrl = `${fullUrl}${separator}token=${encodeURIComponent(token)}`;
  }

  return fullUrl;
};
