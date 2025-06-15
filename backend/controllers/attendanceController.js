const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.markAttendance = async (req, res) => {
  try {
    const faceImage = req.files['faceImage']?.[0];
    const fingerprintImage = req.files['fingerprintImage']?.[0];

    if (!faceImage || !fingerprintImage) {
      return res.status(400).json({ message: 'Both face and fingerprint images are required' });
    }

    const faceImagePath = faceImage.path;
    const fingerprintImagePath = fingerprintImage.path;

    // STEP 1: Face Recognition
    const faceFormData = new FormData();
    faceFormData.append('image', fs.createReadStream(faceImagePath));

    const faceResponse = await axios.post('http://127.0.0.1:5000/match-face', faceFormData, {
      headers: faceFormData.getHeaders()
    });

    const matchedUser = faceResponse.data.user;
    console.log('[Face Recognition] Matched user:', matchedUser);

    if (!matchedUser) {
      fs.unlinkSync(faceImagePath);
      fs.unlinkSync(fingerprintImagePath);
      return res.status(401).json({ message: 'Face not recognized' });
    }

    // STEP 2: Fingerprint Recognition
    const fingerprintFormData = new FormData();
    fingerprintFormData.append('image', fs.createReadStream(fingerprintImagePath));

    const fpResponse = await axios.post('http://127.0.0.1:5000/match-fingerprint', fingerprintFormData, {
      headers: fingerprintFormData.getHeaders()
    });

    const fpUser = fpResponse.data.user;
    console.log('[Fingerprint Recognition] Matched user:', fpUser);

    if (fpUser !== matchedUser) {
      fs.unlinkSync(faceImagePath);
      fs.unlinkSync(fingerprintImagePath);
      return res.status(401).json({ message: 'Fingerprint mismatch' });
    }

    // STEP 3: Find user in DB
    const user = await prisma.user.findUnique({ where: { username: matchedUser } });
    if (!user) {
      console.log('[Error] User not found in database:', matchedUser);
      fs.unlinkSync(faceImagePath);
      fs.unlinkSync(fingerprintImagePath);
      return res.status(401).json({ message: 'User not found in database' });
    }

    // STEP 4: Mark Attendance
    const attendance = await prisma.attendance.create({
      data: {
        userId: user.id,
      },
    });

    fs.unlinkSync(faceImagePath);
    fs.unlinkSync(fingerprintImagePath);

    console.log("[POST] /api/attendance/mark-attendance");
    console.log("Files received:", req.files);

    return res.status(200).json({
      message: 'Attendance marked',
      user: matchedUser,
      attendance,
    });

  } catch (error) {
    console.error('Error in markAttendance:', error.message);
    return res.status(500).json({ message: 'Internal server error during attendance marking' });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  const { username } = req.params;

   try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        attendances: {
          orderBy: {
            timestamp: 'desc', // Sort newest first
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      username: user.username,
      history: user.attendances.map((a) => ({
        id: a.id,
        timestamp: a.timestamp,
      })),
    });
  } catch (error) {
    console.error('Error fetching attendance history:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};