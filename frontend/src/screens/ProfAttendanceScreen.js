import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";

const BACKEND_URL = "http://192.168.73.236:5000"; // Update as needed

const ProfAttendanceScreen = ({ route }) => {
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(false);

  // Get professor username from route params or context
  const professor = route.params?.username || "professor1";

  const handleStart = async () => {
    if (!course) {
      Alert.alert("Select a course first.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/prof/start_attendance`, { course, professor });
      Alert.alert("Success", res.data.message);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Failed to start attendance.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
  if (!course) {
    Alert.alert("Select a course first.");
    return;
  }
  setLoading(true);
  try {
    const res = await axios.post(`${BACKEND_URL}/prof/end_attendance`, { course, professor });
    // After ending, fetch session summary
    const summaryRes = await axios.post(`${BACKEND_URL}/prof/session_summary`, { course, professor });
    const summary = summaryRes.data;
    Alert.alert(
      "Session Summary",
      `Course: ${summary.course}\nProfessor: ${summary.professor}\nStart: ${summary.start_time}\nEnd: ${summary.end_time}\n\nAttendees (${summary.count}):\n${summary.attendees.join(", ") || "None"}`
    );
  } catch (err) {
    Alert.alert("Error", err.response?.data?.error || "Failed to end attendance or fetch summary.");
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Professor Attendance</Text>
      <Text style={styles.label}>Select Course:</Text>
      <Picker
        selectedValue={course}
        onValueChange={setCourse}
        style={styles.input}
      >
        <Picker.Item label="--Select--" value="" />
        <Picker.Item label="Math" value="Math" />
        <Picker.Item label="Physics" value="Physics" />
        <Picker.Item label="Chemistry" value="Chemistry" />
        {/* Add more courses as needed */}
      </Picker>
      <Button title="Start Attendance" onPress={handleStart} disabled={loading} />
      <Button title="End Attendance" onPress={handleEnd} disabled={loading} color="#f44" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  heading: { fontSize: 28, fontWeight: "bold", marginBottom: 24, color: "#3366FF", textAlign: "center" },
  label: { fontSize: 18, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 24, padding: 10 },
});

export default ProfAttendanceScreen;
