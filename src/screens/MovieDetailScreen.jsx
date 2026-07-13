import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ImageBackground, Pressable } from "react-native";
import { Star, Film, Cable, ChevronLeft } from "lucide-react-native";
import { useAppContext } from "../context/AppContext.jsx";
import { useSettingsContext } from "../context/SettingsContext.jsx";
import { useStreamActions } from "../hooks/useStreamActions.js";
import { fetchMovieStreams, fetchMeta } from "../services/cinemeta.js";
import Loader from "../components/common/Loader.jsx";
import ResultCard from "../components/cards/ResultCard.jsx";
import { theme } from "../styles/theme.js";

export default function MovieDetailScreen({ route, navigation }) {
  const { id, item } = route.params;
  const { setSelectedItem, setResults, setLoading, loading, results } = useAppContext();
  const { addonApis, debridService, realDebridApiKey, torboxApiKey } = useSettingsContext();
  const { initAction } = useStreamActions();

  const [meta, setMeta] = useState(null);
  const [imageError, setImageError] = useState(false);

  const initActionRef = useRef(initAction);
  initActionRef.current = initAction;

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
    setSelectedItem(item || { id, name: "Movie", type: "movie" });
    const autoPlayMagnet = route.params?.autoPlayMagnet;

    if (autoPlayMagnet) {
      // Clear auto-play magnet parameter to avoid repeating autoPlay
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
  }, [id, addonApis]);

  return (
    <View style={styles.screen}>
      {loading && <Loader />}

      {/* Floating Back Button */}
      <Pressable 
        focusable={true}
        onPress={() => navigation.goBack()} 
        style={({ focused }) => [
          styles.backBtn,
          focused && styles.backBtnFocused
        ]}
      >
        <ChevronLeft size={20} color="#ffffff" />
      </Pressable>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {meta && (
          <ImageBackground
            source={{ uri: meta.background }}
            style={styles.heroSection}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay}>
              <View style={styles.heroContent}>
                <View style={styles.posterContainer}>
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
                </View>

                <View style={styles.heroInfo}>
                  <Text style={styles.title}>{meta.name}</Text>
                  
                  <View style={styles.badgeRow}>
                    {meta.year ? <View style={styles.badge}><Text style={styles.badgeText}>{meta.year}</Text></View> : null}
                    {meta.runtime ? <View style={styles.badge}><Text style={styles.badgeText}>{meta.runtime}</Text></View> : null}
                    {meta.imdbRating ? (
                      <View style={[styles.badge, styles.ratingBadge]}>
                        <Star size={10} color={theme.colors.warning} fill={theme.colors.warning} />
                        <Text style={styles.ratingText}>{meta.imdbRating}</Text>
                      </View>
                    ) : null}
                    {meta.genres?.slice(0, 3).map((g) => (
                      <View key={g} style={[styles.badge, styles.genreBadge]}>
                        <Text style={styles.genreText}>{g}</Text>
                      </View>
                    ))}
                  </View>

                  {meta.description ? (
                    <Text style={styles.description}>{meta.description}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          </ImageBackground>
        )}

        <View style={styles.streamsSection}>
          <View style={styles.sectionHeader}>
            <Cable size={18} color={theme.colors.accent} />
            <Text style={styles.sectionTitle}>Available Streams</Text>
          </View>

          {results.length > 0 ? (
            <View style={styles.resultsContainer}>
              {results.map((stream, idx) => (
                <ResultCard
                  key={`${stream.infoHash || stream.magnet || "no-hash"}-${stream.title || "no-title"}-${idx}`}
                  item={stream}
                  index={idx}
                />
              ))}
            </View>
          ) : (
            !loading && (
              <View style={styles.noStreamsMsg}>
                <Text style={styles.noStreamsText}>
                  No streams found for this movie. Check your addon APIs or settings.
                </Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  backBtnFocused: {
    backgroundColor: theme.colors.accent,
    borderColor: "#ffffff",
  },
  heroSection: {
    width: "100%",
    minHeight: 280,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 10, 10, 0.82)", // simulate gradient overlay
    justifyContent: "flex-end",
    padding: theme.spacing.lg,
  },
  heroContent: {
    flexDirection: "row",
    gap: theme.spacing.lg,
    alignItems: "flex-end",
    marginTop: 40,
  },
  posterContainer: {
    width: 100,
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  posterPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroInfo: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: theme.spacing.sm,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingBadge: {
    backgroundColor: "rgba(255, 193, 7, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.3)",
  },
  ratingText: {
    color: theme.colors.warning,
    fontSize: 10,
    fontWeight: "bold",
  },
  badgeText: {
    color: theme.colors.text,
    fontSize: 10,
  },
  genreBadge: {
    backgroundColor: "rgba(0, 123, 255, 0.12)",
    borderColor: "rgba(0, 123, 255, 0.25)",
    borderWidth: 1,
  },
  genreText: {
    color: "#70b5ff",
    fontSize: 10,
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  streamsSection: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
    paddingLeft: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  resultsContainer: {
    width: "100%",
  },
  noStreamsMsg: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  noStreamsText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
});
