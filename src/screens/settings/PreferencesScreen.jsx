import React from "react";
import { View, Text, ScrollView, TextInput, Switch } from "react-native";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { theme } from "../../styles/theme.js";
import { settingsStyles as styles } from "./settingsStyles.js";
import SectionHeader from "./SectionHeader.jsx";

export default function PreferencesScreen() {
  const {
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
  } = useSettingsContext();

  return (
    <View style={styles.screen}>
      <SectionHeader title="Preferences" showBack={true} />
      <ScrollView style={styles.contentPanel} contentContainerStyle={styles.panelScroll}>
        <View style={styles.tabContent}>
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
      </ScrollView>
    </View>
  );
}
