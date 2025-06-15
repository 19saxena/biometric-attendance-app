import face_recognition
import numpy as np
import cv2

# Load the image
image = face_recognition.load_image_file("images/user1.jpg")

# Find face encodings
encodings = face_recognition.face_encodings(image)

if len(encodings) == 0:
    print("❌ No face found in the image.")
else:
    np.save("encodings/user1.npy", encodings[0])
    print("✅ Encoding saved to encodings/user1.npy")
