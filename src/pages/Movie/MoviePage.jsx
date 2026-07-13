import { useEffect, useRef, useState } from "react";
import { View, Text, Image, Animated, ImageBackground, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Star, Film, Cable } from "lucide-react-native";
import { useAppContext } from "../../context/AppContext.jsx";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { useStreamActions } from "../../hooks/useStreamActions.js";
import { fetchMovieStreams, fetchMeta } from "../../services/cinemeta.js";
import Loader from "../../components/common/Loader.jsx";
import ResultCard from "../../components/cards/ResultCard.jsx";
import { theme } from "../../styles/theme.js";

export default function MoviePage() {
  const route = useRoute();
  const { id } = route.params || {};
  const navigation = useNavigation();

  const { setSelectedItem, setResults, setLoading, loading, results } = useAppContext();
  const { addonApis } = useSettingsContext();
  const { initAction } = useStreamActions();

  const [meta, setMeta] = useState(null);
  const [imageError, setImageError] = useState(false);
  const posterAnim = useRef(new Animated.Value(0)).current;

  // Use ref to avoid stale closure for initAction in effect
  const initActionRef = useRef(initAction);
  initActionRef.current = initAction;

  // Fetch movie metadata
  useEffect(() => {
    fetchMeta("movie", id)
      .then((data) => {
        if (data) setMeta(data);
      })
      .catch((e) => {
        console.error("Failed to fetch movie metadata:", e);
      });
  }, [id]);

  useEffect(() => {
    const stateItem = route.params?.item;
    const autoPlayMagnet = route.params?.autoPlayMagnet;

    setSelectedItem(stateItem || { id, name: "Movie", type: "movie" });

    if (autoPlayMagnet) {
      navigation.setParams({ autoPlayMagnet: null });
      initActionRef.current(autoPlayMagnet, "stream", true);
    }

    setLoading(true);
    fetchMovieStreams(id, addonApis)
      .then((streams) => {
        setResults(streams);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, addonApis]);

  useEffect(() => {
    if (meta) {
      posterAnim.setValue(0);
      Animated.timing(posterAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    }
  }, [meta, posterAnim]);

  return (
    <View style={styles.wrapper}>
      {loading && <Loader />}

      {meta && (
        <ImageBackground
          source={meta.background ? { uri: meta.background } : undefined}
          style={styles.heroSection}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Animated.View
              style={[
                styles.posterWrap,
                {
                  opacity: posterAnim,
                  transform: [{ translateY: posterAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                },
              ]}
            >
              {meta.poster && !imageError ? (
                <Image
                  source={{ uri: meta.poster }}
                  style={styles.poster}
                  onError={() => setImageError(true)}
                />
              ) : (
                <View style={styles.posterPlaceholder}>
                  <Film size={48} color={theme.colors.textMuted} />
                </View>
              )}
            </Animated.View>
            <View style={styles.heroInfo}>
              <Text style={styles.title}>{meta.name}</Text>
              <View style={styles.badgeRow}>
                {meta.year && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{meta.year}</Text>
                  </View>
                )}
                {meta.runtime && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{meta.runtime}</Text>
                  </View>
                )}
                {meta.imdbRating && (
                  <View style={[styles.badge, styles.ratingBadge]}>
                    <Star size={12} color={theme.colors.warning} fill={theme.colors.warning} />
                    <Text style={styles.badgeText}> {meta.imdbRating}</Text>
                  </View>
                )}
                {meta.genres &&
                  meta.genres.map((g) => (
                    <View key={g} style={[styles.badge, styles.genreBadge]}>
                      <Text style={styles.badgeText}>{g}</Text>
                    </View>
                  ))}
              </View>
              {meta.description && <Text style={styles.description}>{meta.description}</Text>}
            </View>
          </View>
        </ImageBackground>
      )}

      <View style={styles.streamsSection}>
        <View style={styles.streamsTitleRow}>
          <Cable size={18} color={theme.colors.text} />
          <Text style={styles.streamsTitle}> Available Streams</Text>
        </View>
        {results.length > 0 ? (
          <View style={styles.resultsContainer}>
            {results.map((item, index) => (
              <ResultCard
                key={`${item.infoHash || item.magnet || "no-hash"}-${item.title || "no-title"}-${index}`}
                item={item}
                index={index}
              />
            ))}
          </View>
        ) : (
          !loading && (
            <Text style={styles.noStreamsMsg}>
              No streams found for this movie. Check your addon APIs or settings.
            </Text>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 10,
  },
  heroSection: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  heroImage: {
    resizeMode: "cover",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,10,0.75)",
  },
  heroContent: {
    flexDirection: "row",
    padding: 20,
    gap: 20,
  },
  posterWrap: {
    width: 140,
  },
  poster: {
    width: 140,
    height: 210,
    borderRadius: 8,
  },
  posterPlaceholder: {
    width: 140,
    height: 210,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceLight,
  },
  heroInfo: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  ratingBadge: {
    backgroundColor: "rgba(255,193,7,0.15)",
  },
  genreBadge: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  badgeText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  streamsSection: {
    marginTop: 8,
  },
  streamsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  streamsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  resultsContainer: {
    gap: 12,
  },
  noStreamsMsg: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
});
