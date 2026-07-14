import React, { memo, useCallback } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import PosterCard from "../cards/PosterCard.jsx";
import { theme } from "../../styles/theme.js";

// Card width (120) + horizontal margin (theme.spacing.sm * 2) from PosterCard's
// styles — lets FlatList skip its own measurement pass per item.
const CARD_WIDTH = 120 + theme.spacing.sm * 2;

const MediaRail = memo(function MediaRail({ title, items, type, keyPrefix, renderItem }) {
  const renderSingleItem = useCallback(
    ({ item }) => {
      if (renderItem) return renderItem(item);
      return <PosterCard item={item} type={type} />;
    },
    [renderItem, type]
  );

  const keyExtractor = useCallback(
    (item, index) => `${keyPrefix || title}-${item.type || type}-${item.id || item.seriesId || index}`,
    [keyPrefix, title, type]
  );

  const getItemLayout = useCallback(
    (_data, index) => ({ length: CARD_WIDTH, offset: CARD_WIDTH * index, index }),
    []
  );

  if (!items?.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderSingleItem}
        getItemLayout={getItemLayout}
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
