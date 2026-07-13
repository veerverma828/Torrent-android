import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Download, RefreshCw, CheckCircle2 } from "lucide-react-native";
import { isNativeApp, openInstallPermissionSettings } from "../../lib/apkUpdater.js";
import { useUpdate } from "../../context/UpdateContext.jsx";
import { theme } from "../../styles/theme.js";

export default function UpdateSection() {
  const {
    currentBuild,
    update,
    checking,
    checkError,
    phase,
    percent,
    errorMessage,
    checkForUpdate,
    startDownload,
    attemptInstall,
    cancelDownload,
  } = useUpdate();

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>App Updates</Text>

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Installed build</Text>
          <Text style={styles.rowValue}>{currentBuild ? `#${currentBuild}` : "dev"}</Text>
        </View>

        {!isNativeApp && (
          <Text style={styles.mutedText}>
            In-app updates are only available in the installed Android app.
          </Text>
        )}

        {isNativeApp && !update && (
          <View style={styles.row}>
            <View style={styles.inlineRow}>
              {checkError ? (
                <Text style={styles.rowLabel}>Couldn't check (offline or rate-limited).</Text>
              ) : checking ? (
                <>
                  <ActivityIndicator size="small" color={theme.colors.textMuted} />
                  <Text style={styles.rowLabel}>Checking…</Text>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} color="#22c55e" />
                  <Text style={styles.rowLabel}>You're up to date.</Text>
                </>
              )}
            </View>
            <TouchableOpacity style={styles.btnGhost} onPress={checkForUpdate} disabled={checking}>
              <RefreshCw size={16} color={theme.colors.text} />
              <Text style={styles.btnGhostText}>Check</Text>
            </TouchableOpacity>
          </View>
        )}

        {isNativeApp && update && (
          <View style={{ gap: 12 }}>
            <Text style={styles.rowValue}>Update available — build #{update.build}</Text>

            {phase === "idle" && (
              <TouchableOpacity style={styles.btn} onPress={startDownload}>
                <Download size={16} color="#fff" />
                <Text style={styles.btnText}>Download & install</Text>
              </TouchableOpacity>
            )}

            {phase === "downloading" && (
              <View style={{ gap: 8 }}>
                <View style={styles.row}>
                  <View style={styles.inlineRow}>
                    <ActivityIndicator size="small" color={theme.colors.text} />
                    <Text style={styles.rowValue}>Downloading… {percent}%</Text>
                  </View>
                  <TouchableOpacity style={styles.btnGhost} onPress={cancelDownload}>
                    <Text style={styles.btnGhostText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${percent}%` }]} />
                </View>
              </View>
            )}

            {phase === "downloaded" && (
              <TouchableOpacity style={styles.btn} onPress={attemptInstall}>
                <Download size={16} color="#fff" />
                <Text style={styles.btnText}>Install now</Text>
              </TouchableOpacity>
            )}

            {phase === "needs-permission" && (
              <View style={{ gap: 8 }}>
                <Text style={styles.rowLabel}>
                  Allow Torrent Debrid to install apps, then tap Install again.
                </Text>
                <View style={styles.inlineRow}>
                  <TouchableOpacity style={styles.btn} onPress={openInstallPermissionSettings}>
                    <Text style={styles.btnText}>Open settings</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnGhost} onPress={attemptInstall}>
                    <Text style={styles.btnGhostText}>Try again</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {phase === "error" && (
              <View style={styles.row}>
                <Text style={{ color: theme.colors.accent }}>{errorMessage}</Text>
                <TouchableOpacity style={styles.btnGhost} onPress={startDownload}>
                  <Text style={styles.btnGhostText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 18,
  },
  heading: {
    marginBottom: 16,
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  body: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  rowValue: {
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: "monospace",
  },
  mutedText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  btnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  btnGhost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  btnGhostText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  progressTrack: {
    height: 6,
    width: "100%",
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceLight,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
  },
});
