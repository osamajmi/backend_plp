const multer = require('multer');
const cloudinary = require('./cloudinary'); // adjust path if needed

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

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

// Delete function is now a no-op since files are never saved locally
async function deleteFileIfExists(filePath) {
  return;
}

// Helper function to upload a buffer directly to Cloudinary
async function uploadToCloudinary(fileBuffer, folder = 'products') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, fetch_format: 'auto', quality: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
}

module.exports = {
  upload,
  deleteFileIfExists,
  uploadToCloudinary
};
