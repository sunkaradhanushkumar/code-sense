const multer = require('multer');
const path = require('path');

// Store uploaded files in memory buffer for security and fast processing
const storage = multer.memoryStorage();

// Allowed source code extensions
const ALLOWED_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.py',
  '.java',
  '.cpp',
  '.cc',
  '.cxx',
  '.c',
  '.h',
  '.hpp',
  '.txt',
]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${ext}. Please upload a valid JavaScript (.js, .jsx, .ts), Python (.py), Java (.java), C (.c), or C++ (.cpp) source file.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit to prevent memory abuse
    files: 1,
  },
  fileFilter,
});

module.exports = upload;
