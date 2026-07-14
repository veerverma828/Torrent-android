import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";
import { theme } from "../../styles/theme.js";
import { settingsStyles as styles } from "./settingsStyles.js";

export default function SectionHeader({ title, showBack }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.header, { paddingTop: insets.top + theme.spacing.lg }, localStyles.row]}>
      {showBack && (
        <Pressable focusable={true} onPress={() => navigation.goBack()} style={localStyles.backBtn}>
          <ChevronLeft size={22} color={theme.colors.text} />
        </Pressable>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
});
