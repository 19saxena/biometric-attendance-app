const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });
router.get('/register',(req,res) => {
    res.send('suhkdu');
})
router.post('/register', upload.fields([{ name: 'faceImage' }, { name: 'fingerprintImage' }]), async (req, res) => {
  try {
    const { username, role } = req.body;
    const faceImage = req.files['faceImage']?.[0];
    const fingerprintImage = req.files['fingerprintImage']?.[0];
    console.log('📩 Register route hit');
console.log('BODY:', req.body);
console.log('FILES:', req.files);

    if (!username || !faceImage || !fingerprintImage) {
      return res.status(400).json({ message: 'Username, face image, and fingerprint image are required.' });
    }

    // Save user in DB
    const user = await prisma.user.create({
      data: {
        username,
        role: role || 'student', // default role
        faceImagePath: faceImage.path,
        fingerprintImagePath: fingerprintImage.path
      }
    });

    return res.status(201).json({ message: 'User registered successfully', user });

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
});

module.exports = router;