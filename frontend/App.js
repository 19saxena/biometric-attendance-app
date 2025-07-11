import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { enableScreens } from "react-native-screens";
enableScreens(); // optimization

export default function App() {
  return <AppNavigator />;
}
