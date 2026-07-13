import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, Switch, ActivityIndicator } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { X, RefreshCw, Download, Loader2, CheckCircle2, HardDrive, Users, Server, Play, Plus, Trash2 } from "lucide-react-native";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { useUpdate } from "../../context/UpdateContext.jsx";
import { isNativeApp, openInstallPermissionSettings } from "../../lib/apkUpdater.js";
import { getCombinedLogs, clearAllLogs } from "../../services/logs.js";
import { getFiles, generateLink } from "../../services/torrentService.js";
import { useStreamActions } from "../../hooks/useStreamActions.js";
import TraktSyncToggle from "../trakt/TraktSyncToggle.jsx";
import { showToast } from "../common/Toast.jsx";
import { theme } from "../../styles/theme.js";

export default function SettingsModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    addonApis,
    setAddonApis,
    tempAddonApis,
    setTempAddonApis,
    settingsTab,
    setSettingsTab,
    debridService,
    setDebridService,
    realDebridApiKey,
    setRealDebridApiKey,
    torboxApiKey,
    setTorboxApiKey,
    imdbMode,
    setImdbMode,
    useJackett,
    setUseJackett,
    autoSearch,
    setAutoSearch,
    jackettHost,
    setJackettHost,
    jackettApiKey,
    setJackettApiKey,
    saveSettings,
  } = useSettingsContext();

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

  const { initAction } = useStreamActions();

  // Local state for direct links / magnet converter
  const [convertInput, setConvertInput] = useState("");
  const [copyProcessing, setCopyProcessing] = useState(false);
  const [streamProcessing, setStreamProcessing] = useState(false);
  const [externalProcessing, setExternalProcessing] = useState(false);

  // Local state for diagnostic logs
  const [logs, setLogs] = useState("Loading…");
  const [logsLoading, setLogsLoading] = useState(false);

  // Load diagnostic logs when logs tab is active
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
    if (isSettingsOpen && settingsTab === "logs") {
      refreshLogs();
    }
  }, [isSettingsOpen, settingsTab]);

  if (!isSettingsOpen) return null;

  const handleClose = () => {
    saveSettings();
    setIsSettingsOpen(false);
  };

  const handleAddAddon = () => {
    setTempAddonApis([...tempAddonApis, ""]);
  };

  const handleRemoveAddon = (index) => {
    const updated = tempAddonApis.filter((_, idx) => idx !== index);
    setTempAddonApis(updated);
  };

  const handleSaveAddons = () => {
    const cleaned = tempAddonApis.map(url => url.trim()).filter(Boolean);
    setAddonApis(cleaned);
    setTempAddonApis(cleaned);
    showToast("Addon APIs updated", "success");
  };

  const handleRestoreDefaultAddons = () => {
    const defaults = ["https://v3-cinemeta.strem.io"];
    setTempAddonApis(defaults);
    setAddonApis(defaults);
    showToast("Restored default cinemeta", "success");
  };

  // Convert Direct link handlers
  const isDirectUrl = convertInput.trim().toLowerCase().startsWith("http://") || convertInput.trim().toLowerCase().startsWith("https://");
  const debridKey = debridService === "real-debrid" ? realDebridApiKey : torboxApiKey;

  const handleCopyDownloadLink = async () => {
    if (!convertInput.trim()) {
      Alert.alert("Error", "Please paste a magnet link.");
      return;
    }
    try {
      setCopyProcessing(true);
      const fileData = await getFiles(convertInput.trim(), debridService, debridKey);
      if (!fileData?.files?.length) {
        Alert.alert("Error", "No files found for this magnet link.");
        return;
      }
      const generated = await generateLink(fileData.torrentId, fileData.files[0].id, debridService, debridKey);
      if (!generated?.downloadUrl) {
        Alert.alert("Error", "Failed to generate download link.");
        return;
      }
      Clipboard.setString(generated.downloadUrl);
      Alert.alert("Success", "Download link copied to clipboard.");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to process magnet link.");
    } finally {
      setCopyProcessing(false);
    }
  };

  const handleInternalStream = async () => {
    if (!convertInput.trim()) {
      Alert.alert("Error", "Please paste a stream URL.");
      return;
    }
    try {
      setStreamProcessing(true);
      setIsSettingsOpen(false);
      await initAction(convertInput.trim(), "stream", true);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to open stream.");
    } finally {
      setStreamProcessing(false);
    }
  };

  const handleExternalStream = async () => {
    if (!convertInput.trim()) {
      Alert.alert("Error", isDirectUrl ? "Please paste a stream URL." : "Please paste a magnet link.");
      return;
    }
    try {
      setExternalProcessing(true);
      await initAction(convertInput.trim(), "external", true);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to process link.");
    } finally {
      setExternalProcessing(false);
    }
  };

  // Logs copy & clear
  const handleCopyLogs = () => {
    Clipboard.setString(logs);
    showToast("Logs copied to clipboard", "success");
  };

  const handleClearLogs = async () => {
    await clearAllLogs();
    showToast("Logs cleared", "success");
    refreshLogs();
  };

  // Tabs layout rendering helpers
  const tabs = [
    { id: "addons", label: "Addons" },
    { id: "debrid", label: "Debrid" },
    { id: "trakt", label: "Trakt" },
    { id: "direct", label: "Direct Stream" },
    { id: "others", label: "Others" },
    { id: "logs", label: "Logs" },
    { id: "update", label: "Update" }
  ];

  return (
    <Modal
      visible={isSettingsOpen}
      onRequestClose={handleClose}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Title Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Settings</Text>
            <Pressable focusable={true} onPress={handleClose} style={styles.closeBtn}>
              <X size={20} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={styles.modalBody}>
            {/* Left Tabs Bar */}
            <View style={styles.tabsContainer}>
              <ScrollView>
                {tabs.map((tab) => {
                  const isActive = settingsTab === tab.id;
                  const isTabUpdate = tab.id === "update" && update;
                  return (
                    <Pressable
                      key={tab.id}
                      focusable={true}
                      onPress={() => setSettingsTab(tab.id)}
                      style={({ focused }) => [
                        styles.tabBtn,
                        isActive && styles.tabBtnActive,
                        focused && styles.tabBtnFocused
                      ]}
                    >
                      <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                        {tab.label}
                      </Text>
                      {isTabUpdate && <View style={styles.tabUpdateBadge} />}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Right Scrollable Content Panel */}
            <View style={styles.contentPanel}>
              <ScrollView contentContainerStyle={styles.panelScroll}>
                
                {/* 1. ADDONS TAB */}
                {settingsTab === "addons" && (
                  <View style={styles.tabContent}>
                    <Text style={styles.tabHeading}>Stremio Addon APIs</Text>
                    <Text style={styles.tabDesc}>
                      Paste catalog or streaming addon URLs (e.g. Cinemeta, Torrentio).
                    </Text>

                    {tempAddonApis.map((api, idx) => (
                      <View key={idx} style={styles.addonRow}>
                        <TextInput
                          value={api}
                          onChangeText={(text) => {
                            const updated = [...tempAddonApis];
                            updated[idx] = text;
                            setTempAddonApis(updated);
                          }}
                          placeholder="https://..."
                          placeholderTextColor={theme.colors.textMuted}
                          style={styles.addonInput}
                        />
                        <Pressable onPress={() => handleRemoveAddon(idx)} style={styles.addonRemoveBtn}>
                          <Trash2 size={16} color={theme.colors.accent} />
                        </Pressable>
                      </View>
                    ))}

                    <View style={styles.addonActionRow}>
                      <Pressable focusable={true} onPress={handleAddAddon} style={styles.actionBtnGhost}>
                        <Plus size={14} color="#ffffff" />
                        <Text style={styles.btnText}>Add Addon</Text>
                      </Pressable>
                      <Pressable focusable={true} onPress={handleSaveAddons} style={styles.actionBtnAccent}>
                        <Text style={styles.btnText}>Save</Text>
                      </Pressable>
                      <Pressable focusable={true} onPress={handleRestoreDefaultAddons} style={styles.actionBtnGhost}>
                        <Text style={styles.btnText}>Restore Defaults</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* 2. DEBRID TAB */}
                {settingsTab === "debrid" && (
                  <View style={styles.tabContent}>
                    <Text style={styles.tabHeading}>Debrid Configuration</Text>
                    <Text style={styles.tabDesc}>
                      Configure your Real-Debrid or Torbox API keys to unlock cloud torrent streaming.
                    </Text>

                    <View style={styles.selectorRow}>
                      <Pressable
                        focusable={true}
                        onPress={() => setDebridService("real-debrid")}
                        style={[
                          styles.selectorPill,
                          debridService === "real-debrid" && styles.selectorPillActive
                        ]}
                      >
                        <Text style={styles.btnText}>Real-Debrid</Text>
                      </Pressable>
                      <Pressable
                        focusable={true}
                        onPress={() => setDebridService("torbox")}
                        style={[
                          styles.selectorPill,
                          debridService === "torbox" && styles.selectorPillActive
                        ]}
                      >
                        <Text style={styles.btnText}>Torbox</Text>
                      </Pressable>
                    </View>

                    {debridService === "real-debrid" ? (
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Real-Debrid Private API Token</Text>
                        <TextInput
                          value={realDebridApiKey}
                          onChangeText={setRealDebridApiKey}
                          secureTextEntry={true}
                          placeholder="Paste Real-Debrid Token..."
                          placeholderTextColor={theme.colors.textMuted}
                          style={styles.inputField}
                        />
                      </View>
                    ) : (
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Torbox API Key</Text>
                        <TextInput
                          value={torboxApiKey}
                          onChangeText={setTorboxApiKey}
                          secureTextEntry={true}
                          placeholder="Paste Torbox Key..."
                          placeholderTextColor={theme.colors.textMuted}
                          style={styles.inputField}
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* 3. TRAKT TAB */}
                {settingsTab === "trakt" && (
                  <View style={styles.tabContent}>
                    <Text style={styles.tabHeading}>Trakt Integration</Text>
                    <Text style={styles.tabDesc}>
                      Sync watched progress and sync scrobbles to your Trakt account automatically.
                    </Text>
                    <TraktSyncToggle />
                  </View>
                )}

                {/* 4. DIRECT STREAM TAB */}
                {settingsTab === "direct" && (
                  <View style={styles.tabContent}>
                    <Text style={styles.tabHeading}>
                      {isDirectUrl ? "Direct Stream Link" : "Convert Magnet Link"}
                    </Text>
                    <Text style={styles.tabDesc}>
                      {isDirectUrl
                        ? "Stream direct media URLs instantly using the built-in player or external apps."
                        : "Convert magnet links using your selected debrid provider."}
                    </Text>

                    <TextInput
                      multiline={true}
                      value={convertInput}
                      onChangeText={setConvertInput}
                      placeholder={isDirectUrl ? "Paste direct stream URL here..." : "Paste magnet link here..."}
                      placeholderTextColor={theme.colors.textMuted}
                      style={styles.textArea}
                    />

                    <View style={styles.addonActionRow}>
                      {isDirectUrl ? (
                        <>
                          <Pressable
                            focusable={true}
                            disabled={streamProcessing}
                            onPress={handleInternalStream}
                            style={styles.actionBtnAccent}
                          >
                            <Text style={styles.btnText}>
                              {streamProcessing ? "Opening..." : "Stream"}
                            </Text>
                          </Pressable>
                          <Pressable
                            focusable={true}
                            disabled={externalProcessing}
                            onPress={handleExternalStream}
                            style={styles.actionBtnGhost}
                          >
                            <Text style={styles.btnText}>
                              {externalProcessing ? "Opening..." : "Stream Externally"}
                            </Text>
                          </Pressable>
                        </>
                      ) : (
                        <>
                          <Pressable
                            focusable={true}
                            disabled={copyProcessing}
                            onPress={handleCopyDownloadLink}
                            style={styles.actionBtnAccent}
                          >
                            <Text style={styles.btnText}>
                              {copyProcessing ? "Processing..." : "Copy Download Link"}
                            </Text>
                          </Pressable>
                          <Pressable
                            focusable={true}
                            disabled={externalProcessing}
                            onPress={handleExternalStream}
                            style={styles.actionBtnGhost}
                          >
                            <Text style={styles.btnText}>
                              {externalProcessing ? "Opening..." : "Stream Externally"}
                            </Text>
                          </Pressable>
                        </>
                      )}
                    </View>
                  </View>
                )}

                {/* 5. OTHERS TAB */}
                {settingsTab === "others" && (
                  <View style={styles.tabContent}>
                    <Text style={styles.tabHeading}>System Settings</Text>

                    <View style={styles.switchRow}>
                      <View style={styles.switchTextCol}>
                        <Text style={styles.switchLabel}>IMDb ID Mode</Text>
                        <Text style={styles.switchDesc}>Search directly using IMDB ID strings.</Text>
                      </View>
                      <Switch value={imdbMode} onValueChange={setImdbMode} />
                    </View>

                    <View style={styles.switchRow}>
                      <View style={styles.switchTextCol}>
                        <Text style={styles.switchLabel}>Use Jackett</Text>
                        <Text style={styles.switchDesc}>Directly parse Jackett trackers torrent RSS indexes.</Text>
                      </View>
                      <Switch value={useJackett} onValueChange={setUseJackett} />
                    </View>

                    {useJackett && (
                      <View style={styles.jackettForm}>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Jackett Host Address</Text>
                          <TextInput
                            value={jackettHost}
                            onChangeText={setJackettHost}
                            placeholder="http://localhost:9117"
                            placeholderTextColor={theme.colors.textMuted}
                            style={styles.inputField}
                          />
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Jackett API Key</Text>
                          <TextInput
                            value={jackettApiKey}
                            onChangeText={setJackettApiKey}
                            secureTextEntry={true}
                            placeholder="Paste API Key..."
                            placeholderTextColor={theme.colors.textMuted}
                            style={styles.inputField}
                          />
                        </View>
                      </View>
                    )}

                    <View style={styles.switchRow}>
                      <View style={styles.switchTextCol}>
                        <Text style={styles.switchLabel}>Auto Search</Text>
                        <Text style={styles.switchDesc}>Trigger instant search queries on keypress typing.</Text>
                      </View>
                      <Switch value={autoSearch} onValueChange={setAutoSearch} />
                    </View>
                  </View>
                )}

                {/* 6. LOGS TAB */}
                {settingsTab === "logs" && (
                  <View style={styles.tabContent}>
                    <Text style={styles.tabHeading}>Diagnostics Log</Text>
                    <Text style={styles.tabDesc}>
                      Records app errors and crashes, including native Go and ExoPlayer events. Copy this and share if issues occur.
                    </Text>

                    <TextInput
                      multiline={true}
                      editable={false}
                      value={logs}
                      style={styles.logTextArea}
                    />

                    <View style={styles.addonActionRow}>
                      <Pressable focusable={true} onPress={handleCopyLogs} style={styles.actionBtnGhost}>
                        <Text style={styles.btnText}>Copy to Clipboard</Text>
                      </Pressable>
                      <Pressable focusable={true} onPress={refreshLogs} disabled={logsLoading} style={styles.actionBtnGhost}>
                        {logsLoading ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text style={styles.btnText}>Refresh</Text>
                        )}
                      </Pressable>
                      <Pressable focusable={true} onPress={handleClearLogs} style={[styles.actionBtnGhost, { borderColor: theme.colors.accent }]}>
                        <Text style={[styles.btnText, { color: theme.colors.accent }]}>Clear Logs</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* 7. UPDATE TAB */}
                {settingsTab === "update" && (
                  <View style={styles.tabContent}>
                    <Text style={styles.tabHeading}>App Updates</Text>

                    <View style={styles.updateRow}>
                      <Text style={styles.updateLabel}>Installed build</Text>
                      <Text style={styles.updateValue}>{currentBuild ? `#${currentBuild}` : "dev"}</Text>
                    </View>

                    {!isNativeApp && (
                      <Text style={styles.tabDesc}>
                        In-app updates are only available in the installed Android app.
                      </Text>
                    )}

                    {isNativeApp && !update && (
                      <View style={styles.updateActionContainer}>
                        <Text style={styles.updateStatusText}>
                          {checkError
                            ? "Couldn't check (offline or rate-limited)."
                            : checking
                              ? "Checking…"
                              : "You're up to date."}
                        </Text>
                        <Pressable focusable={true} onPress={checkForUpdate} disabled={checking} style={styles.actionBtnGhost}>
                          {checking ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                          ) : (
                            <View style={styles.iconTextRow}>
                              <RefreshCw size={14} color="#ffffff" />
                              <Text style={styles.btnText}>Check</Text>
                            </View>
                          )}
                        </Pressable>
                      </View>
                    )}

                    {isNativeApp && update && (
                      <View style={styles.updateActionContainer}>
                        <Text style={styles.updateStatusText}>Update available — build #{update.build}</Text>

                        {phase === "idle" && (
                          <Pressable focusable={true} onPress={startDownload} style={styles.actionBtnAccent}>
                            <View style={styles.iconTextRow}>
                              <Download size={14} color="#ffffff" />
                              <Text style={styles.btnText}>Download & install</Text>
                            </View>
                          </Pressable>
                        )}

                        {phase === "downloading" && (
                          <View style={styles.progressContainer}>
                            <View style={styles.progressHeader}>
                              <Text style={styles.progressText}>Downloading… {percent}%</Text>
                              <Pressable focusable={true} onPress={cancelDownload} style={styles.actionBtnGhost}>
                                <Text style={styles.btnText}>Cancel</Text>
                              </Pressable>
                            </View>
                            <View style={styles.progressBarBg}>
                              <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
                            </View>
                          </View>
                        )}

                        {phase === "downloaded" && (
                          <Pressable focusable={true} onPress={attemptInstall} style={styles.actionBtnAccent}>
                            <View style={styles.iconTextRow}>
                              <Download size={14} color="#ffffff" />
                              <Text style={styles.btnText}>Install now</Text>
                            </View>
                          </Pressable>
                        )}

                        {phase === "needs-permission" && (
                          <View style={styles.permissionContainer}>
                            <Text style={styles.tabDesc}>
                              Allow Torrent Debrid to install apps, then tap Install again.
                            </Text>
                            <View style={styles.addonActionRow}>
                              <Pressable focusable={true} onPress={openInstallPermissionSettings} style={styles.actionBtnAccent}>
                                <Text style={styles.btnText}>Open settings</Text>
                              </Pressable>
                              <Pressable focusable={true} onPress={attemptInstall} style={styles.actionBtnGhost}>
                                <Text style={styles.btnText}>Try again</Text>
                              </Pressable>
                            </View>
                          </View>
                        )}

                        {phase === "error" && (
                          <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{errorMessage}</Text>
                            <Pressable focusable={true} onPress={startDownload} style={styles.actionBtnGhost}>
                              <Text style={styles.btnText}>Retry</Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}

              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    height: "85%",
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  closeBtn: {
    padding: 6,
  },
  modalBody: {
    flex: 1,
    flexDirection: "row",
  },
  tabsContainer: {
    width: "30%",
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
  },
  tabBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: theme.colors.surface,
  },
  tabBtnFocused: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
    backgroundColor: theme.colors.surface,
  },
  tabBtnText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  tabBtnTextActive: {
    color: theme.colors.accent,
  },
  tabUpdateBadge: {
    position: "absolute",
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
  },
  contentPanel: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  panelScroll: {
    padding: theme.spacing.lg,
  },
  tabContent: {
    flex: 1,
  },
  tabHeading: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  tabDesc: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  addonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  addonInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 12,
    height: 40,
  },
  addonRemoveBtn: {
    padding: 8,
  },
  addonActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionBtnGhost: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 8,
  },
  actionBtnAccent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 8,
  },
  btnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  selectorRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  selectorPill: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectorPillActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },
  inputField: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 12,
    height: 40,
  },
  textArea: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 12,
    height: 100,
    textAlignVertical: "top",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  switchTextCol: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  switchLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "bold",
  },
  switchDesc: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  jackettForm: {
    paddingLeft: theme.spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  logTextArea: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.md,
    color: theme.colors.textMuted,
    fontFamily: "monospace",
    fontSize: 10,
    height: 200,
    textAlignVertical: "top",
  },
  updateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  updateLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  updateValue: {
    color: theme.colors.text,
    fontWeight: "bold",
    fontSize: 13,
  },
  updateActionContainer: {
    marginTop: theme.spacing.lg,
  },
  updateStatusText: {
    color: theme.colors.text,
    fontSize: 13,
    marginBottom: theme.spacing.md,
  },
  iconTextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  progressContainer: {
    width: "100%",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  progressText: {
    color: theme.colors.text,
    fontSize: 12,
  },
  progressBarBg: {
    height: 6,
    width: "100%",
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.accent,
  },
  permissionContainer: {
    gap: theme.spacing.sm,
  },
  errorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: theme.colors.accent,
    fontSize: 12,
  },
});
