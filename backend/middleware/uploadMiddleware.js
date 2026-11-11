const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const createStorage = (subfolder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '..', 'uploads', subfolder);
      ensureDirectoryExists(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Clean filename
      const ext = path.extname(file.originalname);
      const baseName = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    },
  });
};

const fileFilter = (req, file, cb) => {
  // Allowed extensions for design projects and deliverables
  const allowedExtensions = /jpeg|jpg|png|gif|webp|svg|pdf|zip|rar|psd|ai|eps|fig|xd|sketch|txt|doc|docx/;
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (extname) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File upload error: file type not supported. Allowed extensions: ${allowedExtensions}`
      ),
      false
    );
  }
};

// Max 50MB per file
const limits = {
  fileSize: 50 * 1024 * 1024,
};

const uploadReferences = multer({
  storage: createStorage('references'),
  fileFilter,
  limits,
});

const uploadSubmissions = multer({
  storage: createStorage('submissions'),
  fileFilter,
  limits,
});

module.exports = {
  uploadReferences,
  uploadSubmissions,
};
