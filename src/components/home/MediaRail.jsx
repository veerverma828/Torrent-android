import React, { memo } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import PosterCard from "../cards/PosterCard.jsx";
import { theme } from "../../styles/theme.js";

const MediaRail = memo(function MediaRail({ title, items, type, keyPrefix, renderItem }) {
  if (!items?.length) return null;

  const renderSingleItem = ({ item, index }) => {
    if (renderItem) return renderItem(item);
    return <PosterCard item={item} type={type} />;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={items}
        keyExtractor={(item, index) => 
          `${keyPrefix || title}-${item.type || type}-${item.id || item.seriesId || index}`
        }
        renderItem={renderSingleItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
});

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
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: theme.spacing.sm,
  },
});

export default MediaRail;
