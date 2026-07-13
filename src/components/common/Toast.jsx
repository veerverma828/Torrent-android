import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, DeviceEventEmitter } from "react-native";
import { theme } from "../../styles/theme.js";

const TOAST_EVENT = "app-toast";

export function showToast(message, kind = "error") {
  DeviceEventEmitter.emit(TOAST_EVENT, { message, kind });
}

export default function Toast() {
  const [toast, setToast] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    let timer;
    const sub = DeviceEventEmitter.addListener(TOAST_EVENT, (data) => {
      setToast({ ...data, id: Date.now() });
      
      // Animate In
      fadeAnim.setValue(0);
      slideAnim.setValue(24);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true })
      ]).start();

      clearTimeout(timer);
      timer = setTimeout(() => {
        // Animate Out
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 24, duration: 200, useNativeDriver: true })
        ]).start(() => setToast(null));
      }, 3500);
    });

    return () => {
      sub.remove();
      clearTimeout(timer);
    };
  }, [fadeAnim, slideAnim]);

  if (!toast) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: toast.kind === "success" ? "rgba(29,185,84,0.95)" : "rgba(30,30,30,0.97)",
          borderColor: toast.kind === "error" ? "rgba(229,9,20,0.6)" : "rgba(255,255,255,0.12)",
        }
      ]}
    >
      <Text style={styles.toastText}>{toast.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    zIndex: 9999,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  toastText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
