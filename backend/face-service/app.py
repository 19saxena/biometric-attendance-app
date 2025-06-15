from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import numpy as np
import os
import cv2
import json
from datetime import datetime


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

#@app.route("/", methods=["GET"])
#def home():
 #   return "Flask server is running!"

USERS_FILE = "uploads/users.json"
ATTENDANCE_FILE = "attendance_uploads/attendance.json"
ENCODINGS_DIR = "encodings"
ATTENDANCE_UPLOADS_DIR = "attendance_uploads"
ATTENDANCE_FILE = os.path.join(ATTENDANCE_UPLOADS_DIR, "attendance.json")

def save_user(user):
    os.makedirs("uploads", exist_ok=True)
    users = []
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            users = json.load(f)
    users.append(user)
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)

def save_attendance(record):
    os.makedirs("attendance_uploads", exist_ok=True)
    attendance = []
    if os.path.exists(ATTENDANCE_FILE):
        with open(ATTENDANCE_FILE, "r") as f:
            attendance = json.load(f)
    attendance.append(record)
    with open(ATTENDANCE_FILE, "w") as f:
        json.dump(attendance, f, indent=2)

SESSIONS_FILE = "attendance_uploads/attendance_sessions.json"

def save_session(session):
    sessions = []
    if os.path.exists(SESSIONS_FILE):
        with open(SESSIONS_FILE, "r") as f:
            sessions = json.load(f)
    sessions.append(session)
    with open(SESSIONS_FILE, "w") as f:
        json.dump(sessions, f, indent=2)

@app.route('/prof/start_attendance', methods=['POST'])
def start_attendance():
    data = request.get_json()
    course = data.get("course")
    professor = data.get("professor")
    if not course or not professor:
        return jsonify({"error": "Course and professor required."}), 400

    session = {
        "course": course,
        "professor": professor,
        "start_time":datetime.now().isoformat(),
        "end_time": None
    }
    save_session(session)
    return jsonify({"message": "Attendance started.", "session": session}), 200

@app.route('/prof/end_attendance', methods=['POST'])
def end_attendance():
    data = request.get_json()
    course = data.get("course")
    professor = data.get("professor")
    if not course or not professor:
        return jsonify({"error": "Course and professor required."}), 400

    # Find latest session for this course/professor with no end_time
    sessions = []
    if os.path.exists(SESSIONS_FILE):
        with open(SESSIONS_FILE, "r") as f:
            sessions = json.load(f)
    for session in reversed(sessions):
        if session["course"] == course and session["professor"] == professor and session["end_time"] is None:
            session["end_time"] = datetime.now().isoformat()
            with open(SESSIONS_FILE, "w") as f:
                json.dump(sessions, f, indent=2)
            return jsonify({"message": "Attendance ended.", "sessions": sessions}), 200
    # If no open session found
    return jsonify({"error": "No attendance session to end. Please start attendance first."}), 400

# === FACE MATCHING ===

known_faces = {
    "user1": np.load("encodings/user1.npy")
}
known_fingerprints = {
    "user1": cv2.imread("fingerprints/user1_fingerprint.jpg", 0)
}
@app.route('/admin/users')
def admin_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            users = json.load(f)
    else:
        users = []
    return jsonify(users)

@app.route('/admin/attendance')
def admin_attendance():
    if os.path.exists(ATTENDANCE_FILE):
        with open(ATTENDANCE_FILE, "r") as f:
            attendance = json.load(f)
    else:
        attendance = []
    return jsonify(attendance)

@app.route('/admin/dashboard')
def admin_dashboard():
    # Minimal HTML dashboard
    return """
    <html>
    <head>
    <title>Admin Dashboard</title>
    <style>
    body { font-family: sans-serif; margin: 40px; }
    h1 { color: #3366FF; }
    table { border-collapse: collapse; margin-bottom: 40px; }
    th, td { border: 1px solid #ccc; padding: 8px; }
    th { background: #f2f2f2; }
    </style>
    <script>
    async function loadUsers() {
      const res = await fetch('/admin/users');
      const users = await res.json();
      let html = '<h2>Registered Users</h2><table><tr><th>Username</th><th>Role</th><th>Course</th></tr>';
      users.forEach(u => {
        html += `<tr><td>${u.username}</td><td>${u.role}</td><td>${u.course}</td></tr>`;
      });
      html += '</table>';
      document.getElementById('users').innerHTML = html;
    }
    async function loadAttendance() {
      const res = await fetch('/admin/attendance');
      const logs = await res.json();
      let html = '<h2>Attendance Logs</h2><table><tr><th>Timestamp</th></tr>';
      logs.forEach(a => {
        html += `<tr><td>${a.timestamp}</td></tr>`;
      });
      html += '</table>';
      document.getElementById('attendance').innerHTML = html;
    }
    window.onload = function() {
      loadUsers();
      loadAttendance();
    }
    </script>
    </head>
    <body>
    <h1>Admin Dashboard</h1>
    <div id="users"></div>
    <div id="attendance"></div>
    </body>
    </html>
    """
@app.route('/admin/export/attendance')
def export_attendance():
    import csv
    if not os.path.exists(ATTENDANCE_FILE):
        return "No attendance records.", 404
    with open(ATTENDANCE_FILE, "r") as f:
        records = json.load(f)
    csv_path = "attendance_uploads/attendance.csv"
    with open(csv_path, "w", newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["timestamp", "face_image", "fingerprint_image"])
        for r in records:
            writer.writerow([r["timestamp"], r["face_image"], r["fingerprint_image"]])
    from flask import send_file
    return send_file(csv_path, as_attachment=True)


def save_attendance(record):
    os.makedirs(ATTENDANCE_UPLOADS_DIR, exist_ok=True)
    attendance = []
    if os.path.exists(ATTENDANCE_FILE):
        with open(ATTENDANCE_FILE, "r") as f:
            attendance = json.load(f)
    attendance.append(record)
    with open(ATTENDANCE_FILE, "w") as f:
        json.dump(attendance, f, indent=2)

@app.route('/mark-attendance', methods=['POST'])
def mark_attendance():
    username = request.form.get("username")
    course = request.form.get("course")
    professor = request.form.get("professor")
    face_image = request.files.get("faceImage")

    if not username or not course or not professor or not face_image:
        return jsonify({"error": "All fields are required."}), 400

    # Load known face encoding
    encoding_path = os.path.join(ENCODINGS_DIR, f"{username}.npy")
    if not os.path.exists(encoding_path):
        return jsonify({"error": "No face encoding found for user."}), 400
    known_face_encoding = np.load(encoding_path)

    # Validate face image
    try:
        img = face_recognition.load_image_file(face_image)
        face_locations = face_recognition.face_locations(img)
        if len(face_locations) == 0:
            return jsonify({"error": "No face detected in attendance photo."}), 400
        if len(face_locations) > 1:
            return jsonify({"error": "Multiple faces detected in attendance photo."}), 400
        encodings = face_recognition.face_encodings(img)
        if len(encodings) == 0:
            return jsonify({"error": "Face encoding failed."}), 400
        uploaded_encoding = encodings[0]
        match = face_recognition.compare_faces([known_face_encoding], uploaded_encoding)[0]
        if not match:
            return jsonify({"error": "Face does not match registered user."}), 400
    except Exception as e:
        return jsonify({"error": f"Face validation failed: {str(e)}"}), 400

    # Save image with safe filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    os.makedirs(ATTENDANCE_UPLOADS_DIR, exist_ok=True)
    face_path = os.path.join(ATTENDANCE_UPLOADS_DIR, f"{username}_{timestamp}_face.jpg")
    face_image.seek(0)
    face_image.save(face_path)

    # Save attendance record
    record = {
        "timestamp": datetime.now().isoformat(),
        "username": username,
        "course": course,
        "professor": professor,
        "face_image": face_path
    }
    save_attendance(record)

    return jsonify({"message": "Attendance marked successfully!"}), 200


@app.route('/prof/session_summary', methods=['POST'])
def session_summary():
    data = request.get_json()
    course = data.get("course")
    professor = data.get("professor")
    if not course or not professor:
        return jsonify({"error": "Course and professor required."}), 400

    # Find latest session for this course/professor
    sessions = []
    if os.path.exists(SESSIONS_FILE):
        with open(SESSIONS_FILE, "r") as f:
            sessions = json.load(f)
    latest_session = None
    for session in reversed(sessions):
        if session["course"] == course and session["professor"] == professor and session["end_time"] is not None:
            latest_session = session
            break
    if not latest_session:
        return jsonify({"error": "No completed session found."}), 404

    # Get attendance records within session start/end
    attendance = []
    if os.path.exists(ATTENDANCE_FILE):
        with open(ATTENDANCE_FILE, "r") as f:
            attendance = json.load(f)
    attendees = [
    rec.get("username")
    for rec in attendance
    if rec.get("course") == course
    and rec.get("professor") == professor
    and latest_session["start_time"] <= rec.get("timestamp", "") <= latest_session["end_time"]
    ]

    return jsonify({
        "course": course,
        "professor": professor,
        "start_time": latest_session["start_time"],
        "end_time": latest_session["end_time"],
        "attendees": attendees,
        "count": len(attendees)
    }), 200

@app.route('/match-face', methods=['POST'])
def match_face():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    img = face_recognition.load_image_file(file)
    encodings = face_recognition.face_encodings(img)

    if len(encodings) == 0:
        return jsonify({"error": "No face found"}), 400

    uploaded_encoding = encodings[0]
    for username, known_encoding in known_faces.items():
        match = face_recognition.compare_faces([known_encoding], uploaded_encoding)[0]
        if match:
            return jsonify({"user": username}), 200

    return jsonify({"user": None}), 200

# === FINGERPRINT MATCHING ===

fingerprint_path = "fingerprints/user1_fingerprint.jpg"
fingerprint_template = cv2.imread(fingerprint_path, cv2.IMREAD_GRAYSCALE)
orb = cv2.ORB_create()
kp1, des1 = orb.detectAndCompute(fingerprint_template, None)

known_fingerprints = {
    "user1": cv2.imread("fingerprints/user1_fingerprint.jpg", 0)
}

@app.route('/match-fingerprint', methods=['POST'])
def match_fingerprint():
    if 'image' not in request.files:
        return jsonify({"error": "No fingerprint image uploaded"}), 400

    file = request.files['image']
    uploaded_fp = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_GRAYSCALE)

    if uploaded_fp is None:
        return jsonify({"error": "Invalid fingerprint image"}), 400

    sift = cv2.SIFT_create()
    kp1, des1 = sift.detectAndCompute(uploaded_fp, None)

    for username, known_fp in known_fingerprints.items():
        kp2, des2 = sift.detectAndCompute(known_fp, None)
        bf = cv2.BFMatcher()
        matches = bf.knnMatch(des1, des2, k=2)

        good = []
        for m, n in matches:
            if m.distance < 0.75 * n.distance:
                good.append(m)

        if len(good) > 20:
            return jsonify({"user": username}), 200

    return jsonify({"user": None}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Username and password required."}), 400

    # Load users
    users = []
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            users = json.load(f)
    user = next((u for u in users if u["username"] == username and u["password"] == password), None)
    if not user:
        return jsonify({"error": "Invalid username or password."}), 401

    return jsonify({"message": "Login successful.", "role": user["role"], "username": user["username"]}), 200


@app.route('/register', methods=['POST'])
def register():
    username = request.form.get("username")
    password = request.form.get("password")
    role = request.form.get("role")
    course = request.form.get("course")
    image = request.files.get("image")

    if not username or not password or not role or not course or not image:
        return jsonify({"error": "All fields and a single face photo are required for registration."}), 400

    # Check if user already exists
    users = []
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            users = json.load(f)
    if any(u["username"] == username for u in users):
        return jsonify({"error": "Username already exists."}), 400

    try:
        # Face validation
        image.seek(0)
        img = face_recognition.load_image_file(image)
        face_locations = face_recognition.face_locations(img)
        if len(face_locations) == 0:
            return jsonify({"error": "No face detected. Please upload a clear photo with your face visible and try again."}), 400
        if len(face_locations) > 1:
            return jsonify({"error": "Multiple faces detected. Please ensure only your face is visible and try again."}), 400
        
        # Generate and save face encoding
        face_encoding = face_recognition.face_encodings(img)[0]
        os.makedirs(ENCODINGS_DIR, exist_ok=True)
        np.save(os.path.join(ENCODINGS_DIR, f"{username}.npy"), face_encoding)

        # Save face image
        image.seek(0)
        save_path = os.path.join("uploads", f"{username}_face.jpg")
        image.save(save_path)

    except Exception as e:
        return jsonify({"error": f"Face validation failed: {str(e)}"}), 400

    # Save user data
    user = {
        "username": username,
        "password": password,
        "role": role,
        "course": course,
        "image_path": save_path  # This is already set above
    }
    save_user(user)

    return jsonify({"message": f"User {username} registered successfully!"}), 200



if __name__ == '__main__':
    host = os.getenv('FLASK_HOST', '0.0.0.0')  # Default: allow network access
    port = int(os.getenv('FLASK_PORT', '5000'))
    app.run(host=host, port=port)
