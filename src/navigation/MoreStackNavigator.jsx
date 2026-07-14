import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MoreDirectoryScreen from "../screens/settings/MoreDirectoryScreen.jsx";
import TraktScreen from "../screens/settings/TraktScreen.jsx";
import DirectStreamScreen from "../screens/settings/DirectStreamScreen.jsx";
import PreferencesScreen from "../screens/settings/PreferencesScreen.jsx";
import LogsScreen from "../screens/settings/LogsScreen.jsx";
import UpdateScreen from "../screens/settings/UpdateScreen.jsx";
import { theme } from "../styles/theme.js";

const Stack = createNativeStackNavigator();

/**
 * "More" tab: a directory list (MoreDirectoryScreen) that drills into one of
 * five sections. Each section has its own header (with a back button, via
 * headerShown) since these are pushed screens, not tabs.
 */
export default function MoreStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="MoreDirectory" component={MoreDirectoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Trakt" component={TraktScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DirectStream" component={DirectStreamScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Logs" component={LogsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Update" component={UpdateScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
