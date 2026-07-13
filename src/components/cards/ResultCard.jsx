import React, { memo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { HardDrive, Users, Server, Play, ChevronDown } from "lucide-react-native";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { usePlayerContext } from "../../context/PlayerContext.jsx";
import { useStreamActions } from "../../hooks/useStreamActions.js";
import { theme } from "../../styles/theme.js";

function ResultCard({ item, index }) {
  const { useJackett, debridService } = useSettingsContext();
  const { processingMagnet } = usePlayerContext();
  const { initAction, copyMagnet } = useStreamActions();
  const [isFocused, setIsFocused] = useState(false);

  const isDirect = item.magnet && item.magnet.startsWith("http");
  const isProcessing = processingMagnet === item.magnet;

  return (
    <View style={styles.card}>
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaBadge}>
          <Server size={11} color={theme.colors.textMuted} />
          <Text style={styles.metaText}>{item.provider}</Text>
        </View>
        
        {useJackett && (
          <>
            <View style={styles.metaBadge}>
              <HardDrive size={11} color={theme.colors.textMuted} />
              <Text style={styles.metaText}>{Math.round(item.size / 1000000)} MB</Text>
            </View>
            <View style={styles.metaBadge}>
              <Users size={11} color={theme.colors.textMuted} />
              <Text style={styles.metaText}>{item.seeders}</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {/* Download Button */}
        <Pressable
          focusable={true}
          disabled={isProcessing}
          onPress={() => initAction(item.magnet, "download")}
          style={({ pressed, focused }) => [
            styles.actionButton,
            { backgroundColor: isProcessing ? "#3f3f46" : "#007BFF" },
            focused && styles.btnFocused,
            pressed && styles.btnPressed
          ]}
        >
          {isProcessing ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#ffffff" style={styles.spinner} />
              <Text style={styles.btnText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.btnText}>
              {isDirect ? "⬇ Download" : `Download (${debridService === "torbox" ? "Torbox" : "RD"})`}
            </Text>
          )}
        </Pressable>

        {/* Copy Button */}
        <Pressable
          focusable={true}
          onPress={() => copyMagnet(item.magnet)}
          style={({ pressed, focused }) => [
            styles.actionButton,
            { backgroundColor: "#3f3f46" },
            focused && styles.btnFocused,
            pressed && styles.btnPressed
          ]}
        >
          <Text style={styles.btnText}>Copy {isDirect ? "Link" : "Magnet"}</Text>
        </Pressable>

        {/* Stream Buttons Row */}
        <View style={styles.splitGroup}>
          <Pressable
            focusable={true}
            disabled={isProcessing}
            onPress={() => initAction(item.magnet, "stream", true)}
            style={({ pressed, focused }) => [
              styles.actionButton,
              !isDirect && styles.splitMain,
              { backgroundColor: isProcessing ? "#3f3f46" : theme.colors.success },
              focused && styles.btnFocused,
              pressed && styles.btnPressed
            ]}
          >
            {isProcessing ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#ffffff" style={styles.spinner} />
                <Text style={styles.btnText}>Loading...</Text>
              </View>
            ) : (
              <View style={styles.iconTextRow}>
                <Play size={10} color="#ffffff" fill="#ffffff" />
                <Text style={styles.btnText}>Stream</Text>
              </View>
            )}
          </Pressable>
          
          {!isDirect && (
            <Pressable
              focusable={true}
              disabled={isProcessing}
              onPress={() => initAction(item.magnet, "stream", false)}
              style={({ pressed, focused }) => [
                styles.splitArrow,
                { backgroundColor: isProcessing ? "#3f3f46" : theme.colors.success },
                focused && styles.btnFocused,
                pressed && styles.btnPressed
              ]}
            >
              <ChevronDown size={14} color="#ffffff" />
            </Pressable>
          )}
        </View>

        {/* External Buttons Row */}
        <View style={styles.splitGroup}>
          <Pressable
            focusable={true}
            disabled={isProcessing}
            onPress={() => initAction(item.magnet, "external", true)}
            style={({ pressed, focused }) => [
              styles.actionButton,
              !isDirect && styles.splitMain,
              { backgroundColor: isProcessing ? "#3f3f46" : "#8b5cf6" },
              focused && styles.btnFocused,
              pressed && styles.btnPressed
            ]}
          >
            {isProcessing ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#ffffff" style={styles.spinner} />
                <Text style={styles.btnText}>Loading...</Text>
              </View>
            ) : (
              <View style={styles.iconTextRow}>
                <Play size={10} color="#ffffff" fill="#ffffff" />
                <Text style={styles.btnText}>External</Text>
              </View>
            )}
          </Pressable>
          
          {!isDirect && (
            <Pressable
              focusable={true}
              disabled={isProcessing}
              onPress={() => initAction(item.magnet, "external", false)}
              style={({ pressed, focused }) => [
                styles.splitArrow,
                { backgroundColor: isProcessing ? "#3f3f46" : "#8b5cf6" },
                focused && styles.btnFocused,
                pressed && styles.btnPressed
              ]}
            >
              <ChevronDown size={14} color="#ffffff" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    width: "100%",
  },
  title: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  actionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 6,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  btnFocused: {
    borderWidth: 2,
    borderColor: theme.colors.text,
    transform: [{ scale: 1.02 }],
  },
  btnPressed: {
    opacity: 0.8,
  },
  btnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  iconTextRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  spinner: {
    marginRight: 4,
  },
  splitGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  splitMain: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0.25)",
  },
  splitArrow: {
    width: 30,
    paddingVertical: theme.spacing.sm,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default memo(ResultCard);
