import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { getCombinedLogs, clearAllLogs } from "../../services/logs.js";
import { showToast } from "../common/Toast.jsx";

/**
 * Core diagnostic feature: shows the persistent crash/error log (native
 * AppLogger.java on Android, plus any JS-side errors) so a bug that's
 * otherwise invisible — the app silently closing, a P2P stream failing with
 * no visible reason — can be captured and handed over for debugging without
 * needing adb/logcat access.
 */
export default function LogsSection() {
  const [logs, setLogs] = useState("Loading…");
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      setLogs(await getCombinedLogs());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCopy = async () => {
    try {
      Clipboard.setString(logs);
      showToast("Logs copied to clipboard", "success");
    } catch {
      showToast("Could not copy — try selecting the text manually");
    }
  };

  const handleClear = async () => {
    await clearAllLogs();
    showToast("Logs cleared", "success");
    refresh();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.helperText}>
        Records app errors and crashes, including ones that close the app before you can see
        what happened. Copy this and share it if something goes wrong.
      </Text>

      <TextInput
        editable={false}
        multiline
        value={logs}
        style={styles.logBox}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleCopy}>
          <Text style={styles.buttonText}>Copy to Clipboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={refresh} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Refreshing…" : "Refresh"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleClear}>
          <Text style={[styles.buttonText, { color: "#ff6b6b" }]}>Clear Logs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 12,
  },
  helperText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  logBox: {
    width: "100%",
    minHeight: 260,
    maxHeight: 320,
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 15,
    backgroundColor: "#0d0d0d",
    color: "#ddd",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 10,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  button: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
});
