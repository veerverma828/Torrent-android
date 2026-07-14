import React from "react";
import { StyleSheet, Platform, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Home, Globe, Cloud, MoreHorizontal } from "lucide-react-native";

import HomeScreen from "../screens/HomeScreen.jsx";
import MovieDetailScreen from "../screens/MovieDetailScreen.jsx";
import SeriesDetailScreen from "../screens/SeriesDetailScreen.jsx";
import SourcesScreen from "../screens/settings/SourcesScreen.jsx";
import DebridScreen from "../screens/settings/DebridScreen.jsx";
import MoreStackNavigator from "./MoreStackNavigator.jsx";
import { theme } from "../styles/theme.js";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Stack navigator for the Home tab — allows pushing detail screens
 * (Movie, Series) on top while keeping the bottom tab bar visible
 * on the main Home screen.
 */
function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Movie" component={MovieDetailScreen} />
      <Stack.Screen name="Series" component={SeriesDetailScreen} />
    </Stack.Navigator>
  );
}

/**
 * Hide the tab bar when a nested stack screen is a detail screen
 * (Movie or Series), so the user gets a full-screen experience.
 */
function getTabBarVisibility(route) {
  const routeName = getFocusedRouteNameFromRoute(route);
  if (routeName === "Movie" || routeName === "Series") {
    return "none";
  }
  return "flex";
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={({ route }) => ({
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Home size={20} color={focused ? theme.colors.accent : theme.colors.textMuted} />
            </View>
          ),
          tabBarStyle: (route => {
            const base = styles.tabBar;
            const display = getTabBarVisibility(route);
            return { ...base, display };
          })(route),
        })}
      />
      <Tab.Screen
        name="SourcesTab"
        component={SourcesScreen}
        options={{
          tabBarLabel: "Sources",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Globe size={20} color={focused ? theme.colors.accent : theme.colors.textMuted} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="DebridTab"
        component={DebridScreen}
        options={{
          tabBarLabel: "Debrid",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Cloud size={20} color={focused ? theme.colors.accent : theme.colors.textMuted} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStackNavigator}
        options={({ route }) => ({
          tabBarLabel: "More",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <MoreHorizontal size={20} color={focused ? theme.colors.accent : theme.colors.textMuted} />
            </View>
          ),
          tabBarStyle: (route => {
            const base = styles.tabBar;
            const routeName = getFocusedRouteNameFromRoute(route) ?? "MoreDirectory";
            return { ...base, display: routeName === "MoreDirectory" ? "flex" : "none" };
          })(route),
        })}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    height: Platform.OS === "android" ? 70 : 90,
    paddingBottom: Platform.OS === "android" ? 10 : 25,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  },
  tabItem: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  iconWrapperActive: {
    backgroundColor: "rgba(229, 9, 20, 0.12)",
  },
});
