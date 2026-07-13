import React, { useEffect, useState, useRef } from 'react';
import { View, Pressable, Animated, StyleSheet, Easing } from 'react-native';
import { RefreshCw } from "lucide-react-native";
import { traktReconciliation } from "../../services/trakt/traktReconciliation.js";
import { showToast } from "../common/Toast.jsx";
import { theme } from "../../styles/theme.js";

function formatRelativeTime(timestamp) {
  if (!timestamp) return "Not synced yet";

  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return "Synced just now";
  if (seconds < 60) return `Synced ${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Synced ${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  return `Synced ${hours}h ago`;
}

export default function CrossDeviceSyncIndicator() {
  const [lastSyncedAt, setLastSyncedAt] = useState(() => traktReconciliation.getLastSyncedAt());
  const [isSyncing, setIsSyncing] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSyncedAt(traktReconciliation.getLastSyncedAt());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let animation;
    if (isSyncing) {
      spinAnim.setValue(0);
      animation = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
    } else {
      spinAnim.setValue(0);
      animation?.stop();
    }
    return () => animation?.stop();
  }, [isSyncing, spinAnim]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await traktReconciliation.reconcileNow({ trigger: "manual" });
      setLastSyncedAt(traktReconciliation.getLastSyncedAt());
      showToast(formatRelativeTime(traktReconciliation.getLastSyncedAt()), "success");
    } catch {
      showToast("Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Pressable
      focusable={true}
      onPress={handleManualSync}
      style={({ focused }) => [
        styles.container,
        focused && styles.focused
      ]}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <RefreshCw size={18} color="#ffffff" />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  focused: {
    backgroundColor: theme.colors.accent,
  },
});
