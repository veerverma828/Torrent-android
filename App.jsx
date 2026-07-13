import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Providers from "./src/app/providers.jsx";
import HomeScreen from "./src/screens/HomeScreen.jsx";
import MovieDetailScreen from "./src/screens/MovieDetailScreen.jsx";
import SeriesDetailScreen from "./src/screens/SeriesDetailScreen.jsx";
import SettingsModal from "./src/components/modals/SettingsModal.jsx";
import FileSelectorModal from "./src/components/modals/FileSelectorModal.jsx";
import Toast from "./src/components/common/Toast.jsx";
import { theme } from "./src/styles/theme.js";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <Providers>
        <NavigationContainer>
          <View style={styles.container}>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background },
                animation: "fade_from_bottom"
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Movie" component={MovieDetailScreen} />
              <Stack.Screen name="Series" component={SeriesDetailScreen} />
            </Stack.Navigator>

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
