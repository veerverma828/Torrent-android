import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Activity, Link2, Download, SlidersHorizontal, FileText, ChevronRight } from "lucide-react-native";
import { useUpdate } from "../../context/UpdateContext.jsx";
import { theme } from "../../styles/theme.js";

export default function MoreDirectoryScreen({ navigation }) {
  const { update } = useUpdate();
  const insets = useSafeAreaInsets();

  const menuItems = [
    {
      icon: Activity,
      label: "Trakt Integration",
      description: "Sync watched progress with your Trakt account",
      route: "Trakt",
    },
    {
      icon: Link2,
      label: "Direct Stream & Converter",
      description: "Stream URLs or convert magnet links",
      route: "DirectStream",
    },
    {
      icon: Download,
      label: "Updates",
      description: "Check for and install app updates",
      route: "Update",
      badge: update,
    },
    {
      icon: SlidersHorizontal,
      label: "Preferences",
      description: "Jackett, IMDb mode, auto search",
      route: "Preferences",
    },
    {
      icon: FileText,
      label: "Diagnostics & Logs",
      description: "View app logs for troubleshooting",
      route: "Logs",
    },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.container, { paddingTop: insets.top + theme.spacing.lg }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>More</Text>
        <Text style={styles.sectionSubtitle}>Sync, tools, and app preferences</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Pressable
              key={item.route}
              focusable={true}
              onPress={() => navigation.navigate(item.route)}
              style={({ focused }) => [styles.menuItem, focused && styles.menuItemFocused]}
            >
              <View style={styles.menuIconContainer}>
                <IconComponent size={22} color={item.badge ? theme.colors.accent : theme.colors.textMuted} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              {item.badge && <View style={styles.badgeDot} />}
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  menuContainer: {
    gap: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  menuItemFocused: {
    borderColor: theme.colors.accent,
    backgroundColor: "rgba(229, 9, 20, 0.08)",
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuDescription: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  badgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
    borderWidth: 1,
    borderColor: theme.colors.background,
  },
});
