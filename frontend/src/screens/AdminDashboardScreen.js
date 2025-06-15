import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import Constants from 'expo-constants';
const BACKEND_URL = Constants.expoConfig.extra.EXPO_PUBLIC_BACKEND_URL;


const AdminDashboardScreen = () => {
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch users and attendance logs
    const fetchData = async () => {
      try {
        const usersRes = await axios.get(`${BACKEND_URL}/admin/users`);
        setUsers(usersRes.data);

        const attRes = await axios.get(`${BACKEND_URL}/admin/attendance`);
        setAttendance(attRes.data);
      } catch (error) {
        Alert.alert("Error", "Failed to load admin data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Admin Dashboard</Text>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <>
          <Text style={styles.subheading}>Registered Users</Text>
          <FlatList
            data={users}
            keyExtractor={(item, idx) => item.username + idx}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.cell}>{item.username}</Text>
                <Text style={styles.cell}>{item.role}</Text>
                <Text style={styles.cell}>{item.course}</Text>
              </View>
            )}
            ListHeaderComponent={() => (
              <View style={styles.headerRow}>
                <Text style={styles.headerCell}>Username</Text>
                <Text style={styles.headerCell}>Role</Text>
                <Text style={styles.headerCell}>Course</Text>
              </View>
            )}
            style={{ marginBottom: 32, maxHeight: 300 }}
          />

          <Text style={styles.subheading}>Attendance Logs</Text>
          <FlatList
            data={attendance}
            keyExtractor={(item, idx) => item.timestamp + idx}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.cell}>{item.timestamp}</Text>
              </View>
            )}
            ListHeaderComponent={() => (
              <View style={styles.headerRow}>
                <Text style={styles.headerCell}>Timestamp</Text>
              </View>
            )}
            style={{ maxHeight: 300 }}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  heading: { fontSize: 28, fontWeight: "bold", marginBottom: 24, color: "#3366FF" },
  subheading: { fontSize: 20, fontWeight: "bold", marginTop: 24, marginBottom: 12 },
  headerRow: { flexDirection: "row", backgroundColor: "#f2f2f2" },
  headerCell: { flex: 1, fontWeight: "bold", padding: 8 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#eee" },
  cell: { flex: 1, padding: 8 },
});

export default AdminDashboardScreen;
