import React from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { theme } from "../../styles/theme.js";
import { settingsStyles as styles } from "./settingsStyles.js";
import SectionHeader from "./SectionHeader.jsx";

const PLAYBACK_OPTIONS = [
  { value: "auto", label: "Auto", desc: "Use debrid if a key is saved, otherwise P2P." },
  { value: "debrid", label: "Debrid", desc: "Always use debrid — requires an API key below." },
  { value: "p2p", label: "P2P", desc: "Always stream directly via torrent, no debrid." },
];

export default function DebridScreen() {
  const {
    debridService,
    setDebridService,
    realDebridApiKey,
    setRealDebridApiKey,
    torboxApiKey,
    setTorboxApiKey,
    playbackSource,
    setPlaybackSource,
  } = useSettingsContext();

  return (
    <View style={styles.screen}>
      <SectionHeader title="Debrid" />
      <ScrollView style={styles.contentPanel} contentContainerStyle={styles.panelScroll}>
        <View style={styles.tabContent}>
          <Text style={styles.tabHeading}>Playback Source</Text>
          <Text style={styles.tabDesc}>
            Choose how streams are played: automatically pick debrid when available, always require it, or always use peer-to-peer.
          </Text>

          <View style={styles.selectorRow}>
            {PLAYBACK_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                focusable={true}
                onPress={() => setPlaybackSource(opt.value)}
                style={[styles.selectorPill, playbackSource === opt.value && styles.selectorPillActive]}
              >
                <Text style={styles.btnText}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.tabDesc, { marginTop: -theme.spacing.sm }]}>
            {PLAYBACK_OPTIONS.find((o) => o.value === playbackSource)?.desc}
          </Text>

          <Text style={[styles.tabHeading, { marginTop: theme.spacing.lg }]}>Debrid Configuration</Text>
          <Text style={styles.tabDesc}>
            Configure your Real-Debrid or Torbox API keys to unlock cloud torrent streaming.
          </Text>

          <View style={styles.selectorRow}>
            <Pressable
              focusable={true}
              onPress={() => setDebridService("real-debrid")}
              style={[styles.selectorPill, debridService === "real-debrid" && styles.selectorPillActive]}
            >
              <Text style={styles.btnText}>Real-Debrid</Text>
            </Pressable>
            <Pressable
              focusable={true}
              onPress={() => setDebridService("torbox")}
              style={[styles.selectorPill, debridService === "torbox" && styles.selectorPillActive]}
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
      </ScrollView>
    </View>
  );
}
