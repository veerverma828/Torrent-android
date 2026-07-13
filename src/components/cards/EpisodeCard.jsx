import React, { memo, useState } from "react";
import { Pressable, View, Text, Image, StyleSheet } from "react-native";
import { Play, Star } from "lucide-react-native";
import { getEpisodeProgress } from "../../trackers/progressTracker.js";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { useNavigate } from "../../hooks/useNavigate.js";
import { theme } from "../../styles/theme.js";

function EpisodeCard({ episode, seriesId, selectedItem, rating: ratingProp }) {
  const navigate = useNavigate();
  const { syncMode } = useSettingsContext();
  const [isFocused, setIsFocused] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isUnreleased = episode.released
    ? new Date(episode.released) > new Date()
    : false;
  const progress = getEpisodeProgress(seriesId, episode.season, episode.episode);
  
  const parsedRating = parseFloat(ratingProp ?? episode.rating ?? episode.imdbRating);
  const rating = Number.isFinite(parsedRating) && parsedRating > 0 ? parsedRating : null;

  const getProgressColor = (percentage) => {
    if (percentage > 90) return theme.colors.success;
    return syncMode === "trakt" ? theme.colors.accent : theme.colors.info;
  };

  const handlePress = () => {
    navigate(
      `/series/${selectedItem.id}/season/${episode.season}/episode/${episode.episode}`,
      { state: { item: selectedItem } }
    );
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
      <View style={styles.thumbnailContainer}>
        {(!episode.thumbnail && !selectedItem.poster) || imageError ? (
          <View style={styles.imagePlaceholder}>
            <Play size={24} color={theme.colors.textMuted} fill="none" />
          </View>
        ) : (
          <Image
            source={{ uri: episode.thumbnail || selectedItem.poster }}
            style={styles.image}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.episodeNumberBadge}>
          <Text style={styles.episodeNumberText}>Ep {episode.episode}</Text>
        </View>

        {rating ? (
          <View style={styles.ratingBadge}>
            <Star size={8} color={theme.colors.warning} fill={theme.colors.warning} />
            <Text style={styles.ratingText}>{Number(rating).toFixed(1)}</Text>
          </View>
        ) : null}

        <View style={styles.playOverlay}>
          <Play size={18} color="#ffffff" fill="#ffffff" />
        </View>

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

      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isFocused && styles.titleFocused]} numberOfLines={1}>
            {episode.name || episode.title || `Episode ${episode.episode}`}
          </Text>
          {isUnreleased && (
            <View style={styles.unreleasedBadge}>
              <Text style={styles.unreleasedText}>Unreleased</Text>
            </View>
          )}
        </View>

        {episode.released ? (
          <Text style={styles.airdate}>
            {isUnreleased ? "Airs: " : "Aired: "}{" "}
            {new Date(episode.released).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
        ) : null}

        {progress && progress.percentage > 0 ? (
          <Text
            style={[
              styles.progressText,
              { color: getProgressColor(progress.percentage || 0) }
            ]}
          >
            {progress.percentage > 90
              ? "Watched"
              : `Watched: ${Math.round(progress.percentage)}%`}
          </Text>
        ) : null}

        {episode.overview ? (
          <Text style={styles.overview} numberOfLines={3}>
            {episode.overview}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 8,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    alignItems: "center",
    gap: theme.spacing.md,
  },
  cardFocused: {
    borderColor: theme.colors.accent,
    backgroundColor: "rgba(229, 9, 20, 0.08)",
  },
  thumbnailContainer: {
    width: 120,
    height: 75,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  episodeNumberBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  episodeNumberText: {
    color: theme.colors.text,
    fontSize: 9,
    fontWeight: "bold",
  },
  ratingBadge: {
    position: "absolute",
    top: 4,
    left: 4,
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
    fontSize: 8,
    fontWeight: "bold",
  },
  playOverlay: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  progressBar: {
    height: "100%",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
  },
  titleFocused: {
    color: theme.colors.accent,
  },
  unreleasedBadge: {
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  unreleasedText: {
    color: theme.colors.textMuted,
    fontSize: 8,
    fontWeight: "600",
  },
  airdate: {
    color: theme.colors.textMuted,
    fontSize: 10,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
  },
  overview: {
    color: theme.colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
});

export default memo(EpisodeCard);
