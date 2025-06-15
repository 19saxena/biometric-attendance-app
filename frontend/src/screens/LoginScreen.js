import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from "react-native";
import axios from "axios";

const BACKEND_URL = "http://192.168.73.236:5000"; // Change to your backend IP

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/login`, { username, password });
      const { role, username: loggedInUsername } = res.data;
      if (role === "admin") {
      navigation.replace("AdminDashboard");
    } else if (role === "professor") {
      navigation.replace("Start-Attendance", { username: loggedInUsername });
    } else if (role === "student") {
      navigation.replace("UnifiedAttendance", { username: loggedInUsername });
    } else {
      navigation.replace("Register");

      }
    } catch (err) {
      Alert.alert("Login Failed", err.response?.data?.error || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>
      <TextInput
        placeholder="Username"
        value={username}
        style={styles.input}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        style={styles.input}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loading} />
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerLink}>New user? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  heading: { fontSize: 28, fontWeight: "bold", marginBottom: 24, color: "#3366FF", textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 12, marginBottom: 16 },
  registerLink: { color: "#3366FF", marginTop: 16, textAlign: "center", textDecorationLine: "underline" },
});

export default LoginScreen;
