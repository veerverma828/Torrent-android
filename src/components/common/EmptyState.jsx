import { View, Text, StyleSheet } from "react-native";

export default function EmptyState({ message = "Nothing to show" }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    alignItems: "center",
  },
  text: {
    color: "#888",
  },
});
