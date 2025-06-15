import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useFacesInPhoto } from "@infinitered/react-native-mlkit-face-detection";
import { Picker } from "@react-native-picker/picker";
import Constants from 'expo-constants';
const BACKEND_URL = Constants.expoConfig.extra.EXPO_PUBLIC_BACKEND_URL;


const UnifiedAttendanceScreen = ({ route }) => {
  const [authSuccess, setAuthSuccess] = useState(false);
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [course, setCourse] = useState("");
  const [professor, setProfessor] = useState(""); // Optional: set automatically based on course
  const [username, setUsername] = useState(route.params?.username || ""); // Pass username via navigation

  const { faces, error, status } = useFacesInPhoto(image?.uri);

  useEffect(() => {
    authenticate();
    requestCameraPermission();
  }, []);

  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate with fingerprint",
    });
    if (result.success) {
      setAuthSuccess(true);
    } else {
      Alert.alert(
        "Authentication Failed",
        "Fingerprint authentication failed.",
      );
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Camera access is required to take a photo.",
      );
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const submitAttendance = async () => {
    if (!authSuccess || !image?.uri) {
      Alert.alert("Error", "Both fingerprint and face image are required.");
      return;
    }
    if (!course) {
      Alert.alert("Error", "Please select a course.");
      return;
    }
    // Optionally, set professor based on course selection
    // For demo, you can hardcode or map course to professor here:
    let prof = professor;
    if (!prof) {
      if (course === "Math") prof = "prof_math";
      else if (course === "Physics") prof = "prof_physics";
      else if (course === "Chemistry") prof = "prof_chem";
      else prof = "professor";
    }

    // Face validation: must be exactly one face
    if (status === "success") {
      if (faces.length === 0) {
        Alert.alert("No face detected", "Please capture a clear photo with your face visible.");
        return;
      } else if (faces.length > 1) {
        Alert.alert("Multiple faces", "Please capture a photo with only one person visible.");
        return;
      }
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("username", username);
    formData.append("course", course);
    formData.append("professor", prof);
    formData.append("faceImage", {
      uri: image.uri,
      name: "face.jpg",
      type: "image/jpeg",
    });
    formData.append("fingerprintImage", {
      uri: image.uri, // since we’re faking fingerprint in this screen
      name: "fingerprint.jpg",
      type: "image/jpeg",
    });

    try {
      const res = await axios.post(
        `${BACKEND_URL}/mark-attendance`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          transformRequest: (data, headers) => {
            return data;
          },
        },
      );
      Alert.alert("Attendance", res.data.message);
    } catch (err) {
      console.error(err);
      Alert.alert(
        "Attendance Failed",
        err.response?.data?.error || "Submission failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unified Attendance</Text>
      <Text style={styles.label}>Select Course:</Text>
      <Picker
        selectedValue={course}
        onValueChange={setCourse}
        style={styles.input}
      >
        <Picker.Item label="--Select Course--" value="" />
        <Picker.Item label="Math" value="Math" />
        <Picker.Item label="Physics" value="Physics" />
        <Picker.Item label="Chemistry" value="Chemistry" />
      </Picker>

      {!authSuccess ? (
        <Text style={styles.text}>
          Waiting for fingerprint authentication...
        </Text>
      ) : image ? (
        <Image source={{ uri: image.uri }} style={styles.preview} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Capture Face</Text>
        </TouchableOpacity>
      )}

      {image && (
        <>
          <TouchableOpacity style={styles.button} onPress={submitAttendance}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Mark Attendance</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonOutline}
            onPress={() => setImage(null)}
          >
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 10, alignSelf: "flex-start" },
  input: {
    width: 300,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    padding: 8,
    backgroundColor: "#fff",
  },
  text: { fontSize: 16, marginBottom: 10 },
  preview: { width: 300, height: 300, borderRadius: 10, marginBottom: 10 },
  button: {
    backgroundColor: "#3366FF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    width: 200,
    alignItems: "center",
  },
  buttonOutline: {
    backgroundColor: "#aaa",
    padding: 12,
    borderRadius: 10,
    width: 200,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});

export default UnifiedAttendanceScreen;
