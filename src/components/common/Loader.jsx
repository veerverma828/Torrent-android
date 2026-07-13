import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { theme } from "../../styles/theme.js";

export default function Loader({ small = false, title = "Loading..." }) {
  if (small) {
    return <ActivityIndicator size="small" color={theme.colors.text} title={title} />;
  }

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={theme.colors.accent} />
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10, 10, 10, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  text: {
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    fontSize: 14,
    fontWeight: "600",
  },
});
