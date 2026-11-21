const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '.png').toLowerCase() || '.png';
    const randomPart = Math.random().toString(16).slice(2, 10);
    cb(null, `photo_${Date.now()}_${randomPart}${ext}`);
  }
});

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

const fileFilter = (req, file, cb) => {
  if (file.mimetype && allowedTypes.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, GIF, or WEBP image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
