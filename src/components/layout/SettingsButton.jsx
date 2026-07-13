import { useRef } from "react";
import { View, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { Settings } from "lucide-react-native";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { useUpdate } from "../../context/UpdateContext.jsx";
import { theme } from "../../styles/theme.js";

export default function SettingsButton() {
  const { setIsSettingsOpen, setTempAddonApis, addonApis, setSettingsTab } = useSettingsContext();
  const { update } = useUpdate();

  const rotation = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(rotation, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.timing(rotation, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  };

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "45deg"] });

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        setTempAddonApis([...addonApis]);
        if (update) setSettingsTab?.("update");
        setIsSettingsOpen(true);
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel={update ? "Update available" : "Settings"}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Settings size={24} color={theme.colors.textMuted} />
      </Animated.View>

      {update && (
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 50,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badge: {
    position: "absolute",
    top: -1,
    right: -1,
    width: 12,
    height: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.accent,
    borderWidth: 1,
    borderColor: theme.colors.background,
  },
});
