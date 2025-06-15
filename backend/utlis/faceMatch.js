const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

exports.matchFace = async (filename) => {
  try {
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    const form = new FormData();
    form.append('image', fs.createReadStream(filePath));

    const response = await axios.post('http://127.0.0.1:5000/match-face', form, {
      headers: form.getHeaders(),
    });

    const user = response.data.user;
    return user ? { name: user } : null;
  } catch (err) {
    console.error('Error contacting Python face service:', err.message);
    return null;
  }
};
