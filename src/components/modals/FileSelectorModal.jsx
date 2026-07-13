import React from "react";
import { Modal, View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { X } from "lucide-react-native";
import { usePlayerContext } from "../../context/PlayerContext.jsx";
import { useStreamActions } from "../../hooks/useStreamActions.js";
import { formatBytes } from "../../utils/formatBytes.js";
import { theme } from "../../styles/theme.js";

export default function FileSelectorModal() {
  const { fileModalData, setFileModalData, processingFile } = usePlayerContext();
  const { selectFileAndExecute } = useStreamActions();

  if (!fileModalData) return null;

  const { files, actionType } = fileModalData;

  const handleClose = () => {
    setFileModalData(null);
  };

  return (
    <Modal
      visible={!!fileModalData}
      onRequestClose={handleClose}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Select a file to {" "}
              <Text style={{ color: theme.colors.accent, fontWeight: "bold" }}>
                {actionType?.toUpperCase()}
              </Text>
            </Text>
            <Pressable focusable={true} onPress={handleClose} style={styles.closeBtn}>
              <X size={18} color="#ffffff" />
            </Pressable>
          </View>

          <ScrollView style={styles.fileListScroll}>
            {files?.map((f) => {
              const isProcessing = processingFile === f.id;
              return (
                <Pressable
                  key={f.id}
                  focusable={true}
                  disabled={!!processingFile}
                  onPress={() => selectFileAndExecute(f.id)}
                  style={({ pressed, focused }) => [
                    styles.fileItem,
                    focused && styles.fileItemFocused,
                    pressed && styles.fileItemPressed,
                    processingFile && processingFile !== f.id && { opacity: 0.5 }
                  ]}
                >
                  <View style={styles.fileNameContainer}>
                    {isProcessing && (
                      <ActivityIndicator size="small" color={theme.colors.accent} style={styles.spinner} />
                    )}
                    <Text style={styles.fileNameText} numberOfLines={2}>
                      {f.name.replace(/^\//, "")}
                    </Text>
                  </View>
                  <Text style={styles.fileSizeText}>{formatBytes(f.size)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    maxHeight: "80%",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    color: theme.colors.text,
    fontSize: 15,
  },
  closeBtn: {
    padding: 4,
  },
  fileListScroll: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  fileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 6,
    marginVertical: 2,
    gap: theme.spacing.md,
  },
  fileItemFocused: {
    backgroundColor: "rgba(229, 9, 20, 0.1)",
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  fileItemPressed: {
    opacity: 0.8,
  },
  fileNameContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  fileNameText: {
    color: theme.colors.text,
    fontSize: 12,
    flex: 1,
  },
  spinner: {
    marginRight: theme.spacing.sm,
  },
  fileSizeText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
});
