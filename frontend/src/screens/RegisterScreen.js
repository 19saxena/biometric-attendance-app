import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as LocalAuthentication from "expo-local-authentication";
import {
  FaceDetectionProvider,
  useFacesInPhoto,
} from "@infinitered/react-native-mlkit-face-detection";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import Constants from 'expo-constants';
const BACKEND_URL = Constants.expoConfig.extra.EXPO_PUBLIC_BACKEND_URL;

const FaceImagePicker = ({ onFaceImageSelected }) => {
  const [imageUri, setImageUri] = useState(null);
  const { faces, error, status } = useFacesInPhoto(imageUri);

  const pickFaceImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      if (selectedImage?.uri) {
        setImageUri(selectedImage.uri);
        onFaceImageSelected(selectedImage, selectedImage.uri);
      }
    }
  };

  useEffect(() => {
    if (imageUri !== null) {
      if (status === "success") {
        if (faces.length === 0) {
          Alert.alert("No face detected", "Please upload a clear selfie with your face visible.");
          setImageUri(null);
          onFaceImageSelected(null, null);
        } else if (faces.length > 1) {
          Alert.alert("Multiple faces", "Please upload a photo with only one person visible.");
          setImageUri(null);
          onFaceImageSelected(null, null);
        }
      } else if (status === "error") {
        Alert.alert("Error", error || "Face detection failed. Please try another image.");
        setImageUri(null);
        onFaceImageSelected(null, null);
      }
    }
  }, [status, faces, error, imageUri]);

  return (
    <View>
      <Button title="Upload Face Image (Selfie)" onPress={pickFaceImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
    </View>
  );
};

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("student");
  const [course, setCourse] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [faceImage, setFaceImage] = useState(null);
  const [faceImageUri, setFaceImageUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fingerprintVerified, setFingerprintVerified] = useState(false);

  const handleFingerprintAuth = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !enrolled) {
      Alert.alert(
        "Fingerprint unavailable",
        "Your device does not support fingerprint authentication.",
      );
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Scan your fingerprint to continue",
    });

    if (result.success) {
      Alert.alert("Fingerprint verified");
      setFingerprintVerified(true);
      return true;
    } else {
      Alert.alert(
        "Fingerprint scan failed",
        result.error || "Please try again.",
      );
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!username || !course || !faceImage || !password || !confirmPwd) {
      Alert.alert(
        "All fields are required (including a selfie, password, and fingerprint scan)",
      );
      return;
    }

    if (password !== confirmPwd) {
      Alert.alert("Passwords do not match.");
      return;
    }

    if (!fingerprintVerified) {
      const fingerprintSuccess = await handleFingerprintAuth();
      if (!fingerprintSuccess) return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("role", role);
    formData.append("course", course);
    formData.append("password", password);
    formData.append("image", {
      uri: faceImage.uri,
      type: "image/jpeg",
      name: "face.jpg",
    });

    setIsSubmitting(true);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/register`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      Alert.alert("Success", res.data.message, [
        { text: "OK", onPress: () => navigation.replace("Login") }
      ]);
      setUsername("");
      setCourse("");
      setPassword("");
      setConfirmPwd("");
      setFaceImage(null);
      setFaceImageUri(null);
      setFingerprintVerified(false);
    } catch (err) {
      Alert.alert("Registration Failed", err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFaceImageSelected = (image, uri) => {
    setFaceImage(image);
    setFaceImageUri(uri);
  };

  return (
    <FaceDetectionProvider>
      <View style={styles.container}>
        <Text style={styles.heading}>Register</Text>
        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          placeholder="Course"
          style={styles.input}
          value={course}
          onChangeText={setCourse}
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          placeholder="Confirm Password"
          style={styles.input}
          value={confirmPwd}
          onChangeText={setConfirmPwd}
          secureTextEntry
        />
        <Picker
          selectedValue={role}
          onValueChange={setRole}
          style={styles.input}
        >
          <Picker.Item label="Student" value="student" />
          <Picker.Item label="Professor" value="professor" />
          <Picker.Item label="Admin" value="admin" />
        </Picker>

        <FaceImagePicker onFaceImageSelected={handleFaceImageSelected} />

        <Button
          title={fingerprintVerified ? "Fingerprint Verified ✅" : "Scan Fingerprint"}
          onPress={async () => {
            const success = await handleFingerprintAuth();
            if (success) setFingerprintVerified(true);
          }}
          color={fingerprintVerified ? "green" : undefined}
        />

        {isSubmitting ? (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        ) : (
          <Button title="Register" onPress={handleSubmit} />
        )}
      </View>
    </FaceDetectionProvider>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: "#fff" },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  preview: {
    width: 100,
    height: 100,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
});

export default RegisterScreen;
