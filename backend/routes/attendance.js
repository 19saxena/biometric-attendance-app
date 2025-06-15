const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post(
  '/mark-attendance',
  upload.fields([
    { name: 'faceImage', maxCount: 1 },
    { name: 'fingerprintImage', maxCount: 1 }
  ]),
  attendanceController.markAttendance
);

router.get('/history/:username', attendanceController.getAttendanceHistory);

module.exports = router;
