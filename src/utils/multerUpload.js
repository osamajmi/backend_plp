const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');

const uploadsFolder = path.join(process.cwd(), 'uploads');

(async () => {
  try {
    await fs.mkdir(uploadsFolder, { recursive: true });
  } catch (err) {}
})();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsFolder),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${file.fieldname}-${Date.now()}-${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

async function deleteFileIfExists(filePath) {
  if (!filePath || /^https?:\/\//i.test(filePath)) return;

  try {
    const resolved = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);
    await fs.unlink(resolved);
  } catch (err) {
    if (err && err.code !== 'ENOENT') console.error('File delete error:', err);
  }
}

module.exports = {
  upload,
  deleteFileIfExists,
};
