import { View, ActivityIndicator, StyleSheet } from "react-native";
import { theme } from "../../styles/theme.js";

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.accent} accessibilityLabel="Loading..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
