import { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { useStreamActions } from "../../hooks/useStreamActions.js";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { getFiles, generateLink } from "../../services/torrentService.js";
import { theme } from "../../styles/theme.js";

export default function ConvertLinkSection() {
  const { initAction } = useStreamActions();
  const {
    debridService,
    realDebridApiKey,
    torboxApiKey,
    setIsSettingsOpen,
  } = useSettingsContext();
  const debridKey = debridService === "real-debrid" ? realDebridApiKey : torboxApiKey;

  const [inputValue, setInputValue] = useState("");
  const [copyProcessing, setCopyProcessing] = useState(false);
  const [streamProcessing, setStreamProcessing] = useState(false);
  const [externalProcessing, setExternalProcessing] = useState(false);

  const isDirectUrl = useMemo(() => {
    const value = inputValue.trim().toLowerCase();
    return value.startsWith("http://") || value.startsWith("https://");
  }, [inputValue]);

  const handleCopyDownloadLink = async () => {
    if (!inputValue.trim()) {
      Alert.alert("Please paste a magnet link.");
      return;
    }

    try {
      setCopyProcessing(true);

      const fileData = await getFiles(
        inputValue.trim(),
        debridService,
        debridKey,
      );

      if (!fileData?.files?.length) {
        Alert.alert("No files found for this magnet link.");
        return;
      }

      const generated = await generateLink(
        fileData.torrentId,
        fileData.files[0].id,
        debridService,
        debridKey,
      );

      if (!generated?.downloadUrl) {
        Alert.alert("Failed to generate download link.");
        return;
      }

      Clipboard.setString(generated.downloadUrl);
      Alert.alert("Download link copied successfully.");
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to process magnet link.");
    } finally {
      setCopyProcessing(false);
    }
  };

  const handleInternalStream = async () => {
    if (!inputValue.trim()) {
      Alert.alert("Please paste a stream URL.");
      return;
    }

    try {
      setStreamProcessing(true);
      setIsSettingsOpen(false);
      await initAction(inputValue.trim(), "stream", true);
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to open stream.");
    } finally {
      setStreamProcessing(false);
    }
  };

  const handleExternalStream = async () => {
    if (!inputValue.trim()) {
      Alert.alert(isDirectUrl ? "Please paste a stream URL." : "Please paste a magnet link.");
      return;
    }

    try {
      setExternalProcessing(true);
      await initAction(inputValue.trim(), "external", true);
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to process link.");
    } finally {
      setExternalProcessing(false);
    }
  };

  return (
    <View style={styles.section}>
      <View>
        <Text style={styles.heading}>
          {isDirectUrl ? "Direct Stream Link" : "Convert Magnet Link"}
        </Text>

        <Text style={styles.subtext}>
          {isDirectUrl
            ? "Stream direct media URLs instantly using the built-in player or external apps."
            : "Convert magnet links using your selected debrid provider."}
        </Text>
      </View>

      <TextInput
        value={inputValue}
        onChangeText={setInputValue}
        placeholder={
          isDirectUrl
            ? "Paste direct stream URL here..."
            : "Paste magnet link here..."
        }
        placeholderTextColor={theme.colors.textMuted}
        multiline
        style={styles.textarea}
      />

      <View style={styles.buttonRow}>
        {isDirectUrl ? (
          <>
            <TouchableOpacity
              disabled={streamProcessing}
              onPress={handleInternalStream}
              style={[styles.actionButton, styles.primaryButton]}
            >
              <Text style={styles.primaryButtonText}>
                {streamProcessing ? "Opening Stream..." : "Stream"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={externalProcessing}
              onPress={handleExternalStream}
              style={[styles.actionButton, styles.secondaryButton]}
            >
              <Text style={styles.secondaryButtonText}>
                {externalProcessing ? "Opening External..." : "Stream Externally"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              disabled={copyProcessing}
              onPress={handleCopyDownloadLink}
              style={[styles.actionButton, styles.primaryButton]}
            >
              <Text style={styles.primaryButtonText}>
                {copyProcessing ? "Processing Link..." : "Copy Download Link"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={externalProcessing}
              onPress={handleExternalStream}
              style={[styles.actionButton, styles.secondaryButton]}
            >
              <Text style={styles.secondaryButtonText}>
                {externalProcessing ? "Opening Stream..." : "Stream Externally"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    flexDirection: "column",
    gap: 16,
  },
  heading: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  subtext: {
    opacity: 0.7,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text,
  },
  textarea: {
    width: "100%",
    minHeight: 120,
    maxHeight: 260,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
    color: "#fff",
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  actionButton: {
    minWidth: 190,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    flex: 1,
    paddingHorizontal: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
});
