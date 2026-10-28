export const errorHandler = (err, req, res, next) => {
  console.error("🔥 Global Error Handler Caught:", err.stack || err.message);

  // Multer payload size exceeded
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Uploaded image exceeds the 5MB size limit.",
    });
  }

  // MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A duplicate record already exists in the database.",
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error occurred.",
  });
};