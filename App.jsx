import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet, View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

import Providers from "./src/app/providers.jsx";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator.jsx";
import { navigationRef } from "./src/navigation/navigationRef.js";
import FileSelectorModal from "./src/components/modals/FileSelectorModal.jsx";
import Toast from "./src/components/common/Toast.jsx";
import { theme } from "./src/styles/theme.js";
import { hydrateStorage } from "./src/services/storageService.js";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrateStorage()
      .catch((e) => console.error("hydrateStorage failed:", e))
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color={theme.colors.primary ?? "#fff"} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <Providers>
        <NavigationContainer ref={navigationRef}>
          <View style={styles.container}>
            <BottomTabNavigator />

            {/* Global UI Overlays */}
            <FileSelectorModal />
            <Toast />
          </View>
        </NavigationContainer>
      </Providers>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loading: {
    justifyContent: "center",
    alignItems: "center",
  },
});
