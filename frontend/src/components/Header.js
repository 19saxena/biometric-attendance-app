import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Header = ({ title }) => (
  <View style={styles.header}>
    <Text style={styles.text}>{title}</Text>
  </View>
);

export default Header;

const styles = StyleSheet.create({
  header: {
    height: 60,
    padding: 15,
    backgroundColor: "#6200EE",
  },
  text: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
  },
});
