// src/utils/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Ensure uploads directory exists
const uploadsFolder = path.join(process.cwd(), 'uploads');
(async () => {
  try {
    await fs.mkdir(uploadsFolder, { recursive: true });
  } catch (err) {
    // ignore
  }
})();

// Multer storage (leave as-is; we will save relative path in controller)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    const filename = `${file.fieldname}-${Date.now()}-${base}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

/**
 * Delete a file. Accepts stored relative path like "uploads\\file.webp" or absolute path.
 */
async function deleteFileIfExists(filePath) {
  if (!filePath) return;
  // Don't attempt to delete remote URLs
  if (typeof filePath === 'string' && /^https?:\/\//i.test(filePath)) return;

  try {
    // filePath might use backslashes or forward slashes; resolve relative to project root
    const resolved = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    await fs.unlink(resolved);
  } catch (err) {
    // ignore ENOENT; log others
    if (err && err.code !== 'ENOENT') {
      console.error('File delete error:', err);
    }
  }
}

module.exports = { upload, deleteFileIfExists };
