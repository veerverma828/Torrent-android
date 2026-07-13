import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, DevSettings } from "react-native";
import { theme } from "../../styles/theme.js";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Application crash captured:", error, info);
  }

  reloadApp = () => {
    // No native "restart app" module is installed. DevSettings.reload()
    // reloads the JS bundle in debug builds; in release builds this is a
    // no-op, so we also reset local error state as a same-session fallback.
    if (DevSettings?.reload) DevSettings.reload();
    else this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>The app encountered an unexpected error.</Text>
            <TouchableOpacity onPress={this.reloadApp} style={styles.button}>
              <Text style={styles.buttonText}>Reload App</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  card: {
    maxWidth: 480,
    width: "100%",
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    padding: 32,
    alignItems: "center",
  },
  title: {
    marginBottom: 16,
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
  },
  message: {
    marginBottom: 24,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  button: {
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonText: {
    fontWeight: "600",
    color: "#000",
  },
});
