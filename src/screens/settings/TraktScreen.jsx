import React from "react";
import { View, Text, ScrollView } from "react-native";
import TraktSyncToggle from "../../components/trakt/TraktSyncToggle.jsx";
import { settingsStyles as styles } from "./settingsStyles.js";
import SectionHeader from "./SectionHeader.jsx";

export default function TraktScreen() {
  return (
    <View style={styles.screen}>
      <SectionHeader title="Trakt Integration" showBack={true} />
      <ScrollView style={styles.contentPanel} contentContainerStyle={styles.panelScroll}>
        <View style={styles.tabContent}>
          <Text style={styles.tabDesc}>
            Sync watched progress and sync scrobbles to your Trakt account automatically.
          </Text>
          <TraktSyncToggle />
        </View>
      </ScrollView>
    </View>
  );
}
