import React from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Trash2, Plus } from "lucide-react-native";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { showToast } from "../../components/common/Toast.jsx";
import { theme } from "../../styles/theme.js";
import { settingsStyles as styles } from "./settingsStyles.js";
import SectionHeader from "./SectionHeader.jsx";

export default function SourcesScreen() {
  const { addonApis, setAddonApis, tempAddonApis, setTempAddonApis, saveSettings } = useSettingsContext();

  // Persist any pending addon edits when the user navigates away from this tab.
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        saveSettings();
      };
    }, [saveSettings])
  );

  const handleAddAddon = () => {
    setTempAddonApis([...tempAddonApis, ""]);
  };

  const handleRemoveAddon = (index) => {
    const updated = tempAddonApis.filter((_, idx) => idx !== index);
    setTempAddonApis(updated);
  };

  const handleSaveAddons = () => {
    const cleaned = tempAddonApis.map((url) => url.trim()).filter(Boolean);
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

  return (
    <View style={styles.screen}>
      <SectionHeader title="Sources" />
      <ScrollView style={styles.contentPanel} contentContainerStyle={styles.panelScroll}>
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
      </ScrollView>
    </View>
  );
}
