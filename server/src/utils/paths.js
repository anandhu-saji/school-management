import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server root: server/src/utils -> server
export const SERVER_ROOT = path.resolve(__dirname, "../..");
export const PROJECT_ROOT = path.resolve(SERVER_ROOT, "..");

// Canonical uploads directories (always inside server/uploads)
export const UPLOADS_DIR = path.resolve(SERVER_ROOT, "uploads");
export const AVATARS_DIR = path.resolve(UPLOADS_DIR, "avatars");
export const DOCUMENTS_DIR = path.resolve(UPLOADS_DIR, "documents");

// Project root uploads directory (fallback)
export const ROOT_UPLOADS_DIR = path.resolve(PROJECT_ROOT, "uploads");

/**
 * Ensures required storage directories exist on disk at server startup
 */
export const ensureUploadDirs = () => {
  for (const dir of [UPLOADS_DIR, AVATARS_DIR, DOCUMENTS_DIR]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
};
