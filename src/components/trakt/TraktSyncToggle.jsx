import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, Linking } from "react-native";
import QRCode from "qrcode.react"; // Fallback placeholder if not importing SVG directly
import QRCodeSVG from "react-native-qrcode-svg";
import { WifiOff, RefreshCw, CheckCircle2, Copy, Check } from "lucide-react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { traktAuth } from "../../services/trakt/traktAuth.js";
import { traktReconciliation } from "../../services/trakt/traktReconciliation.js";
import { traktSyncQueue } from "../../services/trakt/traktSyncQueue.js";
import { getStorage } from "../../trackers/progressTracker.js";
import { useSyncStatus } from "../../hooks/useSyncStatus.js";
import CrossDeviceSyncIndicator from "../sync/CrossDeviceSyncIndicator.jsx";
import { showToast } from "../common/Toast.jsx";
import { theme } from "../../styles/theme.js";

async function performInitialTraktSync() {
  await traktReconciliation.reconcileNow({ trigger: "connect" });

  const { movies, series } = getStorage();
  const historyMovies = [];
  const historyEpisodes = [];

  for (const [id, movie] of Object.entries(movies)) {
    if (!movie.percentage || movie.percentage <= 0) continue;

    if (movie.completed) {
      historyMovies.push({ imdbId: id });
    } else {
      traktSyncQueue.enqueue({
        action: "syncProgress",
        metadata: { type: "movie", id, imdbId: id, title: movie.title },
        percentage: movie.percentage,
      });
    }
  }

  for (const [seriesId, seriesData] of Object.entries(series)) {
    for (const [season, seasonData] of Object.entries(seriesData.seasons || {})) {
      for (const [episode, ep] of Object.entries(seasonData.episodes || {})) {
        if (!ep.percentage || ep.percentage <= 0) continue;

        if (ep.completed) {
          historyEpisodes.push({ imdbId: seriesId, season, episode });
        } else {
          traktSyncQueue.enqueue({
            action: "syncProgress",
            metadata: {
              type: "series",
              id: seriesId,
              imdbId: seriesId,
              season,
              episode,
              title: seriesData.title,
            },
            percentage: ep.percentage,
          });
        }
      }
    }
  }

  if (historyMovies.length > 0 || historyEpisodes.length > 0) {
    traktSyncQueue.enqueue({
      action: "addToHistory",
      movies: historyMovies,
      episodes: historyEpisodes,
    });
  }

  traktReconciliation.startAutoReconcile();
}

export default function TraktSyncToggle() {
  const {
    syncMode,
    setSyncMode,
    traktAuthenticated,
    setTraktAuthenticated,
    traktUser,
    setTraktUser,
  } = useSettingsContext();
  
  const { isOnline, isSyncing, queueLength, hasIssues, retrySync } = useSyncStatus();

  const [deviceData, setDeviceData] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);

      const data = await traktAuth.startDeviceFlow();
      setDeviceData(data);

      await traktAuth.pollForAccessToken(data.device_code, data.interval);

      setTraktAuthenticated(true);
      setTraktUser(traktAuth.getUser());
      setSyncMode("trakt");

      await performInitialTraktSync();
      showToast("Trakt synced successfully", "success");
    } catch (error) {
      console.error("Trakt connection failed", error);
      Alert.alert("Error", error?.message || "Failed to connect Trakt account");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogout = () => {
    traktReconciliation.stopAutoReconcile();
    traktAuth.logout();
    setTraktAuthenticated(false);
    setTraktUser(null);
    setSyncMode("local");
    setDeviceData(null);
    showToast("Logged out from Trakt", "success");
  };

  const copyUserCode = () => {
    if (deviceData?.user_code) {
      Clipboard.setString(deviceData.user_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      showToast("Code copied to clipboard", "success");
    }
  };

  const handleLinkPress = () => {
    if (deviceData?.verification_url) {
      Linking.openURL(deviceData.verification_url).catch(() => {
        Alert.alert("Error", "Could not open activation URL.");
      });
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View
            style={[
              styles.indicatorDot,
              {
                backgroundColor: syncMode === "trakt" ? theme.colors.accent : "#007BFF",
                shadowColor: syncMode === "trakt" ? theme.colors.accent : "#007BFF",
              }
            ]}
          />
          <Text style={styles.title}>Trakt Sync Mode</Text>
        </View>

        {syncMode === "trakt" && <CrossDeviceSyncIndicator />}
      </View>

      <Text style={styles.desc}>
        {syncMode === "local"
          ? "Your watch progress is currently stored securely on this device."
          : `Cloud sync enabled with Trakt${traktUser ? ` • @${traktUser.username}` : ""}`}
      </Text>

      {syncMode === "trakt" && (
        <View
          style={[
            styles.syncStatusBadge,
            {
              backgroundColor: hasIssues
                ? "rgba(229, 9, 20, 0.1)"
                : isSyncing
                  ? "rgba(0, 123, 255, 0.1)"
                  : "rgba(29, 185, 84, 0.1)",
              borderColor: hasIssues
                ? "rgba(229, 9, 20, 0.3)"
                : isSyncing
                  ? "rgba(0, 123, 255, 0.3)"
                  : "rgba(29, 185, 84, 0.3)",
            }
          ]}
        >
          <View style={styles.statusRow}>
            {!isOnline ? (
              <View style={styles.iconText}>
                <WifiOff size={13} color={theme.colors.accent} />
                <Text style={[styles.statusText, { color: theme.colors.accent }]}>Offline</Text>
              </View>
            ) : isSyncing ? (
              <View style={styles.iconText}>
                <ActivityIndicator size="small" color="#007BFF" style={{ marginRight: 4 }} />
                <Text style={[styles.statusText, { color: "#007BFF" }]}>Syncing ({queueLength} items)</Text>
              </View>
            ) : (
              <View style={styles.iconText}>
                <CheckCircle2 size={13} color="#1db954" />
                <Text style={[styles.statusText, { color: "#1db954" }]}>Synced</Text>
              </View>
            )}
          </View>

          {hasIssues && (
            <Pressable onPress={retrySync}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.actionsContainer}>
        <Pressable
          focusable={true}
          onPress={() => setSyncMode("local")}
          style={({ focused }) => [
            styles.actionBtn,
            { backgroundColor: syncMode === "local" ? "#007BFF" : "#3f3f46" },
            focused && styles.btnFocused
          ]}
        >
          <Text style={styles.btnText}>Local Storage</Text>
        </Pressable>

        <Pressable
          focusable={true}
          disabled={isConnecting}
          onPress={() => {
            if (traktAuthenticated) {
              if (syncMode !== "trakt") {
                setSyncMode("trakt");
                performInitialTraktSync();
              }
            } else {
              handleConnect();
            }
          }}
          style={({ focused }) => [
            styles.actionBtn,
            { backgroundColor: syncMode === "trakt" ? theme.colors.accent : "#3f3f46" },
            focused && styles.btnFocused
          ]}
        >
          {isConnecting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.btnText}>
              {traktAuthenticated ? "Trakt Synced" : "Connect Trakt"}
            </Text>
          )}
        </Pressable>

        {traktAuthenticated && (
          <Pressable
            focusable={true}
            onPress={handleLogout}
            style={({ focused }) => [
              styles.actionBtn,
              { backgroundColor: "#5a5a5a" },
              focused && styles.btnFocused
            ]}
          >
            <Text style={styles.btnText}>Logout</Text>
          </Pressable>
        )}
      </View>

      {deviceData && !traktAuthenticated && (
        <View style={styles.qrContainer}>
          <Text style={styles.qrDesc}>
            Scan the QR code or open the activation link manually.
          </Text>

          <View style={styles.qrCodeWrapper}>
            <QRCodeSVG
              value={deviceData.verification_url}
              size={140}
            />
          </View>

          <Pressable onPress={handleLinkPress}>
            <Text style={styles.qrLinkText}>Open Trakt Activation Page</Text>
          </Pressable>

          <Text style={styles.codePrompt}>Enter this code:</Text>

          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{deviceData.user_code}</Text>
            <Pressable onPress={copyUserCode} style={styles.copyBtn}>
              {copiedCode ? <Check size={14} color="#1db954" /> : <Copy size={14} color="#ffffff" />}
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    elevation: 3,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  desc: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  syncStatusBadge: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  retryText: {
    color: theme.colors.accent,
    fontSize: 11,
    textDecorationLine: "underline",
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  actionBtn: {
    flex: 1,
    minWidth: 110,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 38,
  },
  btnFocused: {
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  btnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  qrContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    alignItems: "center",
    gap: theme.spacing.md,
  },
  qrDesc: {
    color: theme.colors.textMuted,
    fontSize: 11,
    textAlign: "center",
  },
  qrCodeWrapper: {
    backgroundColor: "#ffffff",
    padding: 8,
    borderRadius: 8,
  },
  qrLinkText: {
    color: "#ffffff",
    fontSize: 12,
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  codePrompt: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  codeText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  copyBtn: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});
