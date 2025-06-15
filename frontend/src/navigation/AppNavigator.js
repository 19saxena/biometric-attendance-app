import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import AttendanceScreen from "../screens/AttendanceScreen";
import FaceRecognition from "../screens/FaceRecognition";
import FingerprintAuth from "../screens/FingerprintAuth";
import UnifiedAttendanceScreen from "../screens/UnifiedAttendanceScreen"; // Make sure path is correct
import RegisterScreen from "../screens/RegisterScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import LoginScreen from "../screens/LoginScreen";
import ProfAttendanceScreen from "../screens/ProfAttendanceScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Fingerprint" component={FingerprintAuth} />
        <Stack.Screen name="FaceRecognition" component={FaceRecognition} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen}/>
        <Stack.Screen name="Start-Attendance" component={ProfAttendanceScreen}/>
        <Stack.Screen
          name="UnifiedAttendance"
          component={UnifiedAttendanceScreen}
        />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
