import React, { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";

const FaceRecognition = () => {
  const devices = useCameraDevices();
  const device = devices.front;

  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      if (permission !== "authorized") {
        console.warn("Camera permission denied");
      }
    })();
  }, []);

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: "#fff" },
});

export default FaceRecognition;
