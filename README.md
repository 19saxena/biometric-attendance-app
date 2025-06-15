# Biometric Attendance System

A secure, cross-platform attendance system using **React Native (Expo)** for the frontend and **Flask (Python)** for the backend.

---

## Features

- **User Registration** with selfie (face image), username, password, and course/role selection
- **Biometric Authentication:**  
  - Fingerprint scan (via device’s secure hardware) for proof of presence
  - Face recognition (server-side) for user identity
- **Role-Based Dashboards:**  
  - Students, professors, and admins have different views and permissions
- **Attendance Marking:**  
  - Professors can start/end sessions
  - Students mark attendance with fingerprint and selfie
  - Attendance records are stored and viewable
- **Secure Data Handling:**  
  - Face encodings stored server-side (not reconstructable to original image)
  - Fingerprints never leave the device

---

## Tech Stack

- **Frontend:** React Native (Expo)
- **Backend:** Flask (Python)
- **Face Recognition:** face_recognition (Python library)
- **Biometrics:** Expo LocalAuthentication (uses device’s secure fingerprint/biometric hardware)
- **State Management:** React Hooks
- **Other:** Axios, react-native-picker, expo-image-picker, etc.

---

## Setup Instructions

### 1. Clone the Repository

git clone https://github.com/19saxena/biometric-attendance-app.git
cd biometric-attendance-app


---

### 2. Backend Setup (Flask)

cd backend
python -m venv venv
venv\Scripts\activate.bat # On Windows
pip install -r requirements.txt
python app.py

- By default, runs on `http://0.0.0.0:5000` (also accessible by your local IP).

---

### 3. Frontend Setup (Expo/React Native)

cd ../frontend
npm install


#### **Configure Backend URL**

- Open `app.json` in the `frontend` folder.
- Set your backend IP in the `extra` section (replace with your computer’s IP if needed):

#Look for this part:
"extra": {
"EXPO_PUBLIC_BACKEND_URL": "http://192.168.x.x:5000"
}


- Save the file.

#### **Start the App**

npx expo start --clear

- Scan the QR code with Expo Go on your phone.

---

## Usage

- **Register:**  
  Fill in username, password, course, and upload a selfie. Scan your fingerprint when prompted.
- **Login:**  
  Enter your credentials. Role-based navigation will take you to the appropriate dashboard.
- **Mark Attendance:**  
  Students mark attendance with a selfie and fingerprint scan during an active session.
- **Professors/Admins:**  
  Can start/end sessions and view attendance summaries.

---

## Security & Privacy

- **Fingerprints never leave the device.**  
  The app only checks if the fingerprint scan is successful using the device’s secure hardware.
- **Face images are used to generate encodings, which cannot be reversed to reconstruct the original image.**
- **Passwords are stored as plain text for demo purposes only.**  


---

## Troubleshooting

- **Network Issues:**  
  - Ensure your phone and computer are on the same Wi-Fi network.
  - Use your computer’s local IP (not `localhost`) in `app.json` if testing on a physical device.
- **Environment Variables:**  
  - Expo uses the `EXPO_PUBLIC_` prefix in `app.json` for environment variables.
- **CORS:**  
  - Flask backend includes CORS support for cross-origin requests.

---
