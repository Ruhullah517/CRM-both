const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/freelancers');
const complianceDir = path.join(uploadDir, 'compliance');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(complianceDir)) {
  fs.mkdirSync(complianceDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // If it's a compliance file, save to compliance subdirectory
    if (file.fieldname === 'complianceFile') {
      cb(null, complianceDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Expect fields: dbsCertificateFile, cvFile, complianceFile
const freelancerUploads = upload.fields([
  { name: 'dbsCertificateFile', maxCount: 1 },
  { name: 'cvFile', maxCount: 1 },
  { name: 'complianceFile', maxCount: 1 }
]);

module.exports = freelancerUploads; 