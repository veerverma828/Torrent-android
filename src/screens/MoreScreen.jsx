import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Settings, RefreshCw, HardDrive, Star, Info, Shield, ChevronRight } from "lucide-react-native";
import { useSettingsContext } from "../context/SettingsContext.jsx";
import { useUpdate } from "../context/UpdateContext.jsx";
import { theme } from "../styles/theme.js";

export default function MoreScreen() {
  const { setIsSettingsOpen, setTempAddonApis, addonApis, setSettingsTab } = useSettingsContext();
  const { update } = useUpdate();

  const handleOpenSettings = (tab) => {
    setTempAddonApis([...addonApis]);
    if (tab) setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const menuItems = [
    {
      icon: Settings,
      label: "Customization",
      description: "Addons, Debrid, Trakt, and app preferences",
      tab: "addons",
      badge: update,
    },
    {
      icon: HardDrive,
      label: "Debrid Services",
      description: "Real-Debrid & Torbox API configuration",
      tab: "debrid",
    },
    {
      icon: Star,
      label: "Trakt Integration",
      description: "Sync watched progress with your Trakt account",
      tab: "trakt",
    },
    {
      icon: RefreshCw,
      label: "Updates",
      description: "Check for and install app updates",
      tab: "update",
      badge: update,
    },
    {
      icon: Shield,
      label: "Direct Stream & Converter",
      description: "Stream URLs or convert magnet links",
      tab: "direct",
    },
    {
      icon: Info,
      label: "Diagnostics & Logs",
      description: "View app logs for troubleshooting",
      tab: "logs",
    },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>More</Text>
        <Text style={styles.sectionSubtitle}>Settings, customization, and tools</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Pressable
              key={item.tab}
              focusable={true}
              onPress={() => handleOpenSettings(item.tab)}
              style={({ focused }) => [
                styles.menuItem,
                focused && styles.menuItemFocused,
              ]}
            >
              <View style={styles.menuIconContainer}>
                <IconComponent
                  size={22}
                  color={
                    item.badge
                      ? theme.colors.accent
                      : theme.colors.textMuted
                  }
                />
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
