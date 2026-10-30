import multer from "multer";

// Configure in-memory storage so buffers can be processed or passed directly to S3 / local disk
const storage = multer.memoryStorage();

// Validate image file formats (JPEG, PNG, WEBP) for avatars
const avatarFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and WEBP images are allowed."), false);
  }
};

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: avatarFileFilter,
});

// Validate document and ID proof file formats (Images and PDF)
const documentFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only Image (JPG, PNG, WEBP) and PDF files are allowed for ID proofs."
      ),
      false
    );
  }
};

export const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: documentFileFilter,
});
