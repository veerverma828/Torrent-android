import React, { memo, useState, useEffect, useRef } from "react";
import { Pressable, View, Text, Image, StyleSheet, Alert } from "react-native";
import { Film, X } from "lucide-react-native";
import { fetchMeta } from "../../services/cinemeta.js";
import { updateTrackingMetadata } from "../../trackers/progressTracker.js";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { useNavigate } from "../../hooks/useNavigate.js";
import { theme } from "../../styles/theme.js";

function ContinueWatchingCard({ item, onRemove }) {
  const navigate = useNavigate();
  const { syncMode } = useSettingsContext();
  const [meta, setMeta] = useState({
    title: item.type === "movie" ? item.title : item.seriesTitle,
    poster: item.type === "movie" ? item.poster : item.seriesPoster,
  });
  const [imageError, setImageError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const hasHydrated = useRef(false);

  const getProgressColor = () => {
    if (item.percentage > 90) return theme.colors.success;
    return syncMode === "trakt" ? theme.colors.accent : theme.colors.info;
  };

  useEffect(() => {
    if (
      !hasHydrated.current &&
      (!meta.poster || !meta.title || meta.title.includes("Unknown"))
    ) {
      const fetchMetaData = async () => {
        hasHydrated.current = true;
        try {
          const type = item.type === "movie" ? "movie" : "series";
          const id = item.type === "movie" ? item.id : item.seriesId;
          const data = await fetchMeta(type, id);
          if (data) {
            setMeta({ title: data.name, poster: data.poster });
            updateTrackingMetadata(type, id, data.name, data.poster);
          }
        } catch (e) {
          console.error("Failed to hydrate meta", e);
        }
      };
      fetchMetaData();
    }
  }, [item, meta]);

  const handlePress = () => {
    if (item.type === "movie") {
      navigate(`/movie/${item.id}`, {
        state: {
          item: { id: item.id, name: meta.title, poster: meta.poster, type: "movie" },
          autoPlayMagnet: item.magnet || null,
        },
      });
    } else {
      navigate(
        `/series/${item.seriesId}/season/${item.season}/episode/${item.episode}`,
        {
          state: {
            item: {
              id: item.seriesId,
              name: meta.title,
              poster: meta.poster,
              type: "series",
            },
            autoPlayMagnet: item.magnet || null,
          },
        }
      );
    }
  };

  const handleRemove = () => {
    onRemove(item);
  };

  const handleLongPress = () => {
    Alert.alert(
      "Remove",
      `Remove "${meta.title || 'this item'}" from Continue Watching?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: handleRemove, style: "destructive" }
      ]
    );
  };

  return (
    <Pressable
      focusable={true}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={[
        styles.card,
        isFocused && styles.cardFocused
      ]}
    >
      <View style={styles.imgContainer}>
        {/* Remove Button Overlay (visible on card) */}
        <Pressable 
          onPress={(e) => {
            handleRemove();
          }}
          style={styles.removeBtn}
        >
          <X size={10} color="#ffffff" strokeWidth={3} />
        </Pressable>

        {(meta.poster && !imageError) ? (
          <Image
            source={{ uri: meta.poster }}
            style={styles.image}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Film size={32} color={theme.colors.textMuted} />
            <Text style={styles.placeholderText} numberOfLines={3}>
              {meta.title || "Loading..."}
            </Text>
          </View>
        )}

        {item.isNext && (
          <View style={styles.nextEpBadge}>
            <Text style={styles.nextEpText}>Next Episode ▶</Text>
          </View>
        )}

        {!item.isNext && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.max(item.percentage || 0, 3)}%`,
                  backgroundColor: getProgressColor(),
                }
              ]}
            />
          </View>
        )}
      </View>

      <Text style={[styles.title, isFocused && styles.titleFocused]} numberOfLines={2}>
        {meta.title || "Loading..."}
      </Text>
      <Text style={styles.subtitle}>
        {item.type === "movie" ? "Movie" : `S${item.season} E${item.episode}`}
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
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  nextEpBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.accent,
    paddingVertical: 3,
    alignItems: "center",
  },
  nextEpText: {
    color: theme.colors.text,
    fontSize: 8,
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

export default memo(ContinueWatchingCard);
