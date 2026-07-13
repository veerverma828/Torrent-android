import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { theme } from "../../styles/theme.js";

export default function SkeletonRail({ title, count = 8 }) {
  return (
    <View style={styles.container}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={styles.skeletonCard} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
    width: "100%",
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  listContent: {
    paddingHorizontal: theme.spacing.sm,
  },
  skeletonCard: {
    width: 110,
    height: 165,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceLight,
    marginHorizontal: theme.spacing.sm,
  },
});
