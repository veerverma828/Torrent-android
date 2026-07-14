import React from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { RefreshCw, Download } from "lucide-react-native";
import { useUpdate } from "../../context/UpdateContext.jsx";
import { isNativeApp, openInstallPermissionSettings } from "../../lib/apkUpdater.js";
import { settingsStyles as styles } from "./settingsStyles.js";
import SectionHeader from "./SectionHeader.jsx";

export default function UpdateScreen() {
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
    <View style={styles.screen}>
      <SectionHeader title="App Updates" showBack={true} />
      <ScrollView style={styles.contentPanel} contentContainerStyle={styles.panelScroll}>
        <View style={styles.tabContent}>
          <View style={styles.updateRow}>
            <Text style={styles.updateLabel}>Installed build</Text>
            <Text style={styles.updateValue}>{currentBuild ? `#${currentBuild}` : "dev"}</Text>
          </View>

          {!isNativeApp && (
            <Text style={styles.tabDesc}>In-app updates are only available in the installed Android app.</Text>
          )}

          {isNativeApp && !update && (
            <View style={styles.updateActionContainer}>
              <Text style={styles.updateStatusText}>
                {checkError ? "Couldn't check (offline or rate-limited)." : checking ? "Checking…" : "You're up to date."}
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
                  <Text style={styles.tabDesc}>Allow Torrent Debrid to install apps, then tap Install again.</Text>
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
      </ScrollView>
    </View>
  );
}
