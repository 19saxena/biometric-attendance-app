import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Attendance Auth</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("UnifiedAttendance")}
      >
        <Text style={styles.buttonText}>Mark Attendance</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonOutline}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.buttonText}>Register New Student</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonOutline}
        onPress={() => navigation.navigate("AdminDashboard")}
      >
        <Text style={styles.buttonText}>Admin Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#3366FF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: "80%",
    alignItems: "center",
  },
  buttonOutline: {
    backgroundColor: "#aaa",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
