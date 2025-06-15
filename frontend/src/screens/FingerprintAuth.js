import React from "react";
import { View, Button, Alert } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

const handleFingerprintAuth = async () => {
  try {
    const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();
    const savedBiometrics = await LocalAuthentication.isEnrolledAsync();

    if (!isBiometricAvailable || !savedBiometrics) {
      Alert.alert(
        "Biometric Auth Not Available",
        "Fingerprint authentication is not set up on this device."
      );
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Scan your fingerprint",
      fallbackLabel: "Use Passcode",
      cancelLabel: "Cancel",
    });

    if (result.success) {
      Alert.alert("Authentication Successful ✅");
      return true;
    } else {
      Alert.alert("Authentication Failed", result.error || "Try again.");
      return false;
    }
  } catch (error) {
    Alert.alert("Error", "Something went wrong with fingerprint auth.");
    console.error(error);
    return false;
  }
};

const FingerprintAuthScreen = () => (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
    <Button title="Authenticate with Fingerprint" onPress={handleFingerprintAuth} />
  </View>
);

export default FingerprintAuthScreen;
