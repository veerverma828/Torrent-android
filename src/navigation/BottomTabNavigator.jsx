import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Home, Search, MoreHorizontal } from "lucide-react-native";

import HomeScreen from "../screens/HomeScreen.jsx";
import MovieDetailScreen from "../screens/MovieDetailScreen.jsx";
import SeriesDetailScreen from "../screens/SeriesDetailScreen.jsx";
import MoreScreen from "../screens/MoreScreen.jsx";
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
 * The Search tab re-uses HomeScreen (which includes the search bar
 * at the top). The user can search directly from here.
 */
function SearchStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen name="SearchMain" component={HomeScreen} />
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
  // If we're on a detail screen inside the nested stack, hide the tab bar
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
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          tabBarStyle: (route => {
            const base = styles.tabBar;
            const display = getTabBarVisibility(route);
            return { ...base, display };
          })(route),
        })}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchStackNavigator}
        options={({ route }) => ({
          tabBarLabel: "Search",
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          tabBarStyle: (route => {
            const base = styles.tabBar;
            const display = getTabBarVisibility(route);
            return { ...base, display };
          })(route),
        })}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreScreen}
        options={{
          tabBarLabel: "More",
          tabBarIcon: ({ color, size }) => (
            <MoreHorizontal size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    height: Platform.OS === "android" ? 60 : 85,
    paddingBottom: Platform.OS === "android" ? 8 : 20,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  tabItem: {
    paddingVertical: 4,
  },
});
