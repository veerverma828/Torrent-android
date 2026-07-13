import React, { memo, useState } from "react";
import { Pressable, View, Text, Image, StyleSheet } from "react-native";
import { Film, Star } from "lucide-react-native";
import { getMovieProgress } from "../../trackers/progressTracker.js";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { useNavigate } from "../../hooks/useNavigate.js";
import { theme } from "../../styles/theme.js";

function PosterCard({ item, type }) {
  const navigate = useNavigate();
  const { syncMode } = useSettingsContext();
  const [imageError, setImageError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const mediaType = type || item.type || "movie";
  const progress = mediaType === "movie" ? getMovieProgress(item.id) : null;
  const year = item.releaseInfo || item.year;

  const getProgressColor = (percentage) => {
    if (percentage > 90) return theme.colors.success;
    return syncMode === "trakt" ? theme.colors.accent : theme.colors.info;
  };

  const handlePress = () => {
    if (mediaType === "movie") {
      navigate(`/movie/${item.id}`, { state: { item } });
    } else {
      navigate(`/series/${item.id}`, { state: { item } });
    }
  };

  return (
    <Pressable
      focusable={true}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onPress={handlePress}
      style={[
        styles.card,
        isFocused && styles.cardFocused
      ]}
    >
      <View style={styles.imgContainer}>
        {(!item.poster || imageError) ? (
          <View style={styles.placeholder}>
            <Film size={32} color={theme.colors.textMuted} />
            <Text style={styles.placeholderText} numberOfLines={3}>{item.name}</Text>
          </View>
        ) : (
          <Image
            source={{ uri: item.poster }}
            style={styles.image}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
        )}
        
        {item.imdbRating ? (
          <View style={styles.ratingBadge}>
            <Star size={10} color={theme.colors.warning} fill={theme.colors.warning} />
            <Text style={styles.ratingText}>{item.imdbRating}</Text>
          </View>
        ) : null}

        {progress && progress.percentage > 0 ? (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.max(progress.percentage || 0, 3)}%`,
                  backgroundColor: getProgressColor(progress.percentage || 0),
                }
              ]}
            />
          </View>
        ) : null}
      </View>

      <Text style={[styles.title, isFocused && styles.titleFocused]} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.subtitle}>
        {[item.type, year].filter(Boolean).join(" · ")}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    marginHorizontal: theme.spacing.sm,
    padding: theme.spacing.xs,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
  },
  cardFocused: {
    borderColor: theme.colors.accent,
    transform: [{ scale: 1.05 }],
    backgroundColor: theme.colors.surface,
  },
  imgContainer: {
    width: 110,
    height: 165,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  placeholderText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: theme.spacing.xs,
  },
  ratingBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: "bold",
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  progressBar: {
    height: "100%",
  },
  title: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: theme.spacing.xs,
    width: "100%",
  },
  titleFocused: {
    color: theme.colors.accent,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
});

export default memo(PosterCard);
