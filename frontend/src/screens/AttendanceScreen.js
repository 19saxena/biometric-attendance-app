import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";

const AttendanceScreen = () => {
  const [marked, setMarked] = useState(false);

  const handleMarkAttendance = () => {
    // Replace with actual API call
    setMarked(true);
    Alert.alert("Success", "Attendance marked successfully!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance</Text>
      <Button
        title="Mark Attendance"
        onPress={handleMarkAttendance}
        disabled={marked}
      />
    </View>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
