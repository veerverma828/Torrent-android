import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

import Providers from "./src/app/providers.jsx";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator.jsx";
import SettingsModal from "./src/components/modals/SettingsModal.jsx";
import FileSelectorModal from "./src/components/modals/FileSelectorModal.jsx";
import Toast from "./src/components/common/Toast.jsx";
import { theme } from "./src/styles/theme.js";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <Providers>
        <NavigationContainer>
          <View style={styles.container}>
            <BottomTabNavigator />

            {/* Global UI Overlays */}
            <SettingsModal />
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
});
