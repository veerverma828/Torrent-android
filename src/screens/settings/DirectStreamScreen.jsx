import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { useStreamActions } from "../../hooks/useStreamActions.js";
import { useHardwareBack } from "../../hooks/useHardwareBack.js";
import { getFiles, generateLink } from "../../services/torrentService.js";
import VideoPlayer from "../../components/player/VideoPlayer.jsx";
import { theme } from "../../styles/theme.js";
import { settingsStyles as styles } from "./settingsStyles.js";
import SectionHeader from "./SectionHeader.jsx";

export default function DirectStreamScreen() {
  const { debridService, realDebridApiKey, torboxApiKey } = useSettingsContext();
  const { initAction } = useStreamActions();
  useHardwareBack();

  const [convertInput, setConvertInput] = useState("");
  const [copyProcessing, setCopyProcessing] = useState(false);
  const [streamProcessing, setStreamProcessing] = useState(false);
  const [externalProcessing, setExternalProcessing] = useState(false);

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

  return (
    <View style={styles.screen}>
      <SectionHeader title={isDirectUrl ? "Direct Stream Link" : "Convert Magnet Link"} showBack={true} />
      <ScrollView style={styles.contentPanel} contentContainerStyle={styles.panelScroll}>
        <View style={styles.tabContent}>
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
                <Pressable focusable={true} disabled={streamProcessing} onPress={handleInternalStream} style={styles.actionBtnAccent}>
                  <Text style={styles.btnText}>{streamProcessing ? "Opening..." : "Stream"}</Text>
                </Pressable>
                <Pressable focusable={true} disabled={externalProcessing} onPress={handleExternalStream} style={styles.actionBtnGhost}>
                  <Text style={styles.btnText}>{externalProcessing ? "Opening..." : "Stream Externally"}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable focusable={true} disabled={copyProcessing} onPress={handleCopyDownloadLink} style={styles.actionBtnAccent}>
                  <Text style={styles.btnText}>{copyProcessing ? "Processing..." : "Copy Download Link"}</Text>
                </Pressable>
                <Pressable focusable={true} disabled={externalProcessing} onPress={handleExternalStream} style={styles.actionBtnGhost}>
                  <Text style={styles.btnText}>{externalProcessing ? "Opening..." : "Stream Externally"}</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </ScrollView>
      <VideoPlayer />
    </View>
  );
}
