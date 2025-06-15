const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs'); // or use multer if you're handling from frontend upload

exports.matchFace = async (req, res) => {
  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(req.file.path)); // req.file from multer

    const response = await axios.post('http://127.0.0.1:5000/match-face', form, {
      headers: form.getHeaders(),
    });

    const user = response.data.user;
    if (!user) return res.status(401).json({ success: false, message: "Face not recognized" });

    // Example: mark attendance
    await prisma.attendance.create({
      data: {
        userId: user,  // user from Flask
        timestamp: new Date(),
      },
    });

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error matching face" });
  }
};
