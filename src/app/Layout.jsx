import { lazy, Suspense, useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext.jsx";
import { usePlayerContext } from "../context/PlayerContext.jsx";
import { useSettingsContext } from "../context/SettingsContext.jsx";
import { useKeyboardNavigation, getDefaultFocusTarget } from "../hooks/useKeyboardNavigation.js";
import { useHardwareBack } from "../hooks/useHardwareBack.js";
import { useDebrid } from "../hooks/useDebrid.js";
import SettingsButton from "../components/layout/SettingsButton.jsx";
import Header from "../components/layout/Header.jsx";
import SearchBar from "../components/layout/SearchBar.jsx";
import UpdateChecker from "../components/UpdateChecker.jsx";
import Toast from "../components/common/Toast.jsx";
import { theme } from "../styles/theme.js";

const VideoPlayer = lazy(() => import("../components/player/VideoPlayer.jsx"));
const SettingsModal = lazy(() => import("../components/modals/SettingsModal.jsx"));

export default function Layout({ children }) {
  const route = useRoute();
  const routeParams = route.params || {};

  const { results, seasons, episodes, selectedSeason } = useAppContext();
  const { streamUrl, fileModalData, setFileModalData, setStreamUrl } = usePlayerContext();
  const { isSettingsOpen } = useSettingsContext();

  const { debridService, handleDebridChange } = useDebrid();

  useKeyboardNavigation();
  useHardwareBack();

  // Keep the lazy modal/player mounted once first triggered so their internal
  // AnimatePresence can play an exit animation instead of being hard-unmounted.
  const [playerEverOpened, setPlayerEverOpened] = useState(false);
  const [settingsEverOpened, setSettingsEverOpened] = useState(false);

  useEffect(() => {
    if (streamUrl) setPlayerEverOpened(true);
  }, [streamUrl]);

  useEffect(() => {
    if (isSettingsOpen) setSettingsEverOpened(true);
  }, [isSettingsOpen]);

  // Auto-focus newly loaded content for seamless keyboard/d-pad navigation.
  // On RN-TV there's no document.querySelector/activeElement — screens
  // register their default-focusable item (first result card, first
  // episode card, etc.) via registerFocusable() in useKeyboardNavigation.js,
  // and we imperatively .focus() that ref once the relevant data arrives.
  useEffect(() => {
    let attempts = 0;
    let timeoutId;

    const isEpisodeRoute = route.name === "Series" && routeParams.season != null && routeParams.episode != null;

    const tryFocus = () => {
      let groups = [];

      if (fileModalData) {
        groups = ["file-item"];
      } else if (results.length > 0) {
        groups = ["result-btn"];
      } else if (selectedSeason && episodes.length > 0) {
        groups = ["episode-card"];
      }

      const target = groups.length ? getDefaultFocusTarget(groups) : null;

      if (target && target.focus) {
        target.focus();
      } else if (attempts < 5) {
        attempts++;
        timeoutId = setTimeout(tryFocus, 100);
      }
    };

    timeoutId = setTimeout(tryFocus, 50);

    return () => clearTimeout(timeoutId);
  }, [results, seasons, episodes, selectedSeason, fileModalData, route.name, routeParams.season, routeParams.episode]);

  // Modal state (file picker / stream player) now lives purely in
  // PlayerContext rather than being mirrored into the URL — the Android
  // hardware back button closes them via useHardwareBack instead.

  return (
    <View style={styles.appContainer}>
      <SettingsButton />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header />

        {/* Debrid Service Selector — plain sliding pill (no framer-motion). */}
        <View style={styles.optionsContainer}>
          <View style={styles.pillGroup}>
            <View
              style={[
                styles.pillIndicator,
                { transform: [{ translateX: debridService === "torbox" ? PILL_WIDTH : 0 }] },
              ]}
            />
            {[
              { value: "real-debrid", label: "Real-Debrid" },
              { value: "torbox", label: "Torbox" },
            ].map((opt) => {
              const isActive = debridService === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => handleDebridChange(opt.value)}
                  style={styles.pillOption}
                >
                  <Text style={[styles.pillLabel, isActive && styles.pillLabelActive]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <SearchBar />

        {children}
      </ScrollView>

      {playerEverOpened && (
        <Suspense fallback={null}>
          <VideoPlayer />
        </Suspense>
      )}

      {settingsEverOpened && (
        <Suspense fallback={null}>
          <SettingsModal />
        </Suspense>
      )}

      <UpdateChecker />
      <Toast />
    </View>
  );
}

const PILL_WIDTH = 90;

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  optionsContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  pillGroup: {
    flexDirection: "row",
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    padding: 4,
  },
  pillIndicator: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    width: PILL_WIDTH,
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
  },
  pillOption: {
    width: PILL_WIDTH,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.textMuted,
  },
  pillLabelActive: {
    color: "#fff",
  },
});
