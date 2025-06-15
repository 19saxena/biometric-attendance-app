const express = require("express");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data"); // Use the Node.js form-data package
const upload = multer();
const app = express();
const port = 8000;

// Root route for health check
app.get("/", (req, res) => {
  res.send("Node server is running!");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route to forward registration request to Flask
app.post("/api/register", upload.single("faceImage"), async (req, res) => {
  try {
    const form = new FormData();
    form.append("username", req.body.username);
    form.append("role", req.body.role);
    form.append("course", req.body.course);
    form.append("image", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(
      "http://192.168.73.236:5000/register", // Use your current laptop IP here
      form,
      { headers: form.getHeaders() }
    );

    res.status(200).send(response.data);
  } catch (error) {
    console.error("Error forwarding to Flask:", error.message);
    res.status(500).json({ error: "Registration forwarding failed." });
  }
});

// (Optional) Example attendance route if you need to forward attendance as well
app.post("/api/attendance/mark-attendance", upload.fields([
  { name: "faceImage", maxCount: 1 },
  { name: "fingerprintImage", maxCount: 1 }
]), async (req, res) => {
  try {
    const form = new FormData();
    form.append("faceImage", req.files["faceImage"][0].buffer, {
      filename: req.files["faceImage"][0].originalname,
      contentType: req.files["faceImage"][0].mimetype,
    });
    form.append("fingerprintImage", req.files["fingerprintImage"][0].buffer, {
      filename: req.files["fingerprintImage"][0].originalname,
      contentType: req.files["fingerprintImage"][0].mimetype,
    });

    const response = await axios.post(
      "http://192.168.73.236:5000/mark-attendance",
      form,
      { headers: form.getHeaders() }
    );

    res.status(200).send(response.data);
  } catch (error) {
    console.error("Error forwarding attendance to Flask:", error.message);
    res.status(500).json({ error: "Attendance forwarding failed." });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Node server running on port ${port}`);
});
