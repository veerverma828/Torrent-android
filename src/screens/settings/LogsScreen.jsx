import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { getCombinedLogs, clearAllLogs } from "../../services/logs.js";
import { showToast } from "../../components/common/Toast.jsx";
import { theme } from "../../styles/theme.js";
import { settingsStyles as styles } from "./settingsStyles.js";
import SectionHeader from "./SectionHeader.jsx";

export default function LogsScreen() {
  const [logs, setLogs] = useState("Loading…");
  const [logsLoading, setLogsLoading] = useState(false);

  const refreshLogs = async () => {
    setLogsLoading(true);
    try {
      const combined = await getCombinedLogs();
      setLogs(combined);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  const handleCopyLogs = () => {
    Clipboard.setString(logs);
    showToast("Logs copied to clipboard", "success");
  };

  const handleClearLogs = async () => {
    await clearAllLogs();
    showToast("Logs cleared", "success");
    refreshLogs();
  };

  return (
    <View style={styles.screen}>
      <SectionHeader title="Diagnostics & Logs" showBack={true} />
      <ScrollView style={styles.contentPanel} contentContainerStyle={styles.panelScroll}>
        <View style={styles.tabContent}>
          <Text style={styles.tabDesc}>
            Records app errors and crashes, including native Go and ExoPlayer events. Copy this and share if issues occur.
          </Text>

          <TextInput multiline={true} editable={false} value={logs} style={styles.logTextArea} />

          <View style={styles.addonActionRow}>
            <Pressable focusable={true} onPress={handleCopyLogs} style={styles.actionBtnGhost}>
              <Text style={styles.btnText}>Copy to Clipboard</Text>
            </Pressable>
            <Pressable focusable={true} onPress={refreshLogs} disabled={logsLoading} style={styles.actionBtnGhost}>
              {logsLoading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.btnText}>Refresh</Text>}
            </Pressable>
            <Pressable focusable={true} onPress={handleClearLogs} style={[styles.actionBtnGhost, { borderColor: theme.colors.accent }]}>
              <Text style={[styles.btnText, { color: theme.colors.accent }]}>Clear Logs</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
