import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, FlatList, Image, ImageBackground, Pressable } from "react-native";
import { Star, Film, Cable, ChevronLeft } from "lucide-react-native";
import { useAppContext } from "../context/AppContext.jsx";
import { useSettingsContext } from "../context/SettingsContext.jsx";
import { useStreamActions } from "../hooks/useStreamActions.js";
import { useHardwareBack } from "../hooks/useHardwareBack.js";
import { fetchSeriesMeta, fetchEpisodeStreams } from "../services/cinemeta.js";
import { fetchEpisodeRatings } from "../services/episodeRatings.js";
import Loader from "../components/common/Loader.jsx";
import ResultCard from "../components/cards/ResultCard.jsx";
import EpisodeCard from "../components/cards/EpisodeCard.jsx";
import VideoPlayer from "../components/player/VideoPlayer.jsx";
import { theme } from "../styles/theme.js";

export default function SeriesDetailScreen({ route, navigation }) {
  const { id, season: seasonParam, episode: episodeParam, item } = route.params;

  const {
    selectedItem,
    setSelectedItem,
    seasons,
    setSeasons,
    episodes,
    setEpisodes,
    selectedSeason,
    setSelectedSeason,
    results,
    setResults,
    setLoading,
    loading,
  } = useAppContext();

  const { addonApis, debridService, realDebridApiKey, torboxApiKey } = useSettingsContext();
  const { initAction } = useStreamActions();
  useHardwareBack();

  const [meta, setMeta] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [episodeRatings, setEpisodeRatings] = useState({});
  const scrollerRef = useRef(null);

  const initActionRef = useRef(initAction);
  initActionRef.current = initAction;

  // Real per-episode ratings (TVMaze)
  useEffect(() => {
    let cancelled = false;
    fetchEpisodeRatings(id).then((map) => {
      if (!cancelled) setEpisodeRatings(map);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const visibleEpisodes = useMemo(() => {
    if (selectedSeason === null || selectedSeason === undefined) return [];
    return episodes.filter((ep) => Number(ep.season) === Number(selectedSeason));
  }, [episodes, selectedSeason]);

  // Fetch series metadata
  useEffect(() => {
    fetchSeriesMeta(id)
      .then((data) => {
        if (data) {
          setMeta(data);

          // Hydrate seasons and episodes if empty
          if (episodes.length === 0 || selectedItem?.id !== id) {
            const videos = data.videos || [];

            const extractedSeasons = [
              ...new Set(
                videos
                  .filter((v) => v.season !== undefined && v.season !== null)
                  .filter((v) => {
                    if (Number(v.season) !== 0) return true;
                    return videos.some(
                      (ep) =>
                        Number(ep.season) === 0 &&
                        ep.episode !== undefined &&
                        ep.episode !== null
                    );
                  })
                  .map((v) => Number(v.season))
              ),
            ].sort((a, b) => {
              if (a === 0) return 1;
              if (b === 0) return -1;
              return a - b;
            });

            setSeasons(extractedSeasons);
            setEpisodes(videos);

            const isEpisodePath = !!(seasonParam && episodeParam);
            if (extractedSeasons.length > 0 && !isEpisodePath) {
              const hasSeason1 = extractedSeasons.some((s) => Number(s) === 1);
              setSelectedSeason(hasSeason1 ? 1 : extractedSeasons[0]);
            }
          }
        }
      })
      .catch((e) => {
        console.error("Failed to fetch series meta:", e);
      });
  }, [id]);

  useEffect(() => {
    setSelectedItem(item || { id, name: "Series", type: "series" });
    const autoPlayMagnet = route.params?.autoPlayMagnet;
    const isEpisodePath = !!(seasonParam && episodeParam);

    if (autoPlayMagnet) {
      navigation.setParams({ autoPlayMagnet: null });
      initActionRef.current(autoPlayMagnet, "stream", true);
    }

    if (isEpisodePath) {
      setSelectedSeason(Number(seasonParam));
      setLoading(true);
      fetchEpisodeStreams(id, seasonParam, episodeParam, addonApis)
        .then((streams) => {
          setResults(streams);
          setLoading(false);

          // Scroll to the streams view
          setTimeout(() => {
            scrollerRef.current?.scrollTo({ y: 180, animated: true });
          }, 300);
        })
        .catch((e) => {
          console.error(e);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [id, seasonParam, episodeParam, addonApis]);

  const isEpisodePath = !!(seasonParam && episodeParam);

  const handleSeasonSelect = (s) => {
    setSelectedSeason(s);
    setResults([]);
    // Remove episode specific route params so we stay in default series view
    navigation.setParams({ season: null, episode: null });
  };

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

      <ScrollView ref={scrollerRef} contentContainerStyle={styles.scrollContent}>
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

        {/* SELECTED EPISODE STREAMING LIST */}
        {isEpisodePath && results.length > 0 && (
          <View style={styles.episodeStreamsSection}>
            <View style={styles.sectionHeader}>
              <Cable size={16} color={theme.colors.accent} />
              <Text style={styles.sectionTitle}>
                Streams: S{seasonParam} Ep {episodeParam}
              </Text>
            </View>
            <View style={styles.resultsContainer}>
              {results.map((stream, idx) => (
                <ResultCard
                  key={`${stream.infoHash || stream.magnet || "no-hash"}-${stream.title || "no-title"}-${idx}`}
                  item={stream}
                  index={idx}
                />
              ))}
            </View>
          </View>
        )}

        {seasons.length > 0 && (
          <View style={styles.seasonsContainer}>
            {/* SEASON TABS BAR */}
            <View style={styles.seasonBarWrapper}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={seasons}
                keyExtractor={(s) => String(s)}
                contentContainerStyle={styles.seasonBarContent}
                renderItem={({ item: s }) => {
                  const isActive = Number(selectedSeason) === Number(s);
                  return (
                    <Pressable
                      focusable={true}
                      onPress={() => handleSeasonSelect(s)}
                      style={({ focused }) => [
                        styles.seasonTab,
                        isActive && styles.seasonTabActive,
                        focused && styles.seasonTabFocused
                      ]}
                    >
                      <Text style={[
                        styles.seasonLabel,
                        isActive && styles.seasonLabelActive
                      ]}>
                        {Number(s) === 0 ? "Specials" : `Season ${s}`}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </View>

            {/* EPISODES GRID/LIST */}
            {selectedSeason !== null && selectedSeason !== undefined && (
              <View style={styles.episodesList}>
                {visibleEpisodes.map((episode, idx) => (
                  <EpisodeCard
                    key={episode.id || `${episode.season}-${episode.episode}-${idx}`}
                    episode={episode}
                    seriesId={id}
                    selectedItem={meta || selectedItem}
                    rating={episodeRatings[`${Number(episode.season)}:${Number(episode.episode)}`]}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
      <VideoPlayer />
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
    backgroundColor: "rgba(10, 10, 10, 0.82)",
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
  episodeStreamsSection: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
    paddingLeft: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "bold",
  },
  resultsContainer: {
    width: "100%",
  },
  seasonsContainer: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  seasonBarWrapper: {
    marginBottom: theme.spacing.md,
    width: "100%",
  },
  seasonBarContent: {
    gap: theme.spacing.sm,
  },
  seasonTab: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  seasonTabActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  seasonTabFocused: {
    borderColor: "#ffffff",
    borderWidth: 1,
  },
  seasonLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "bold",
  },
  seasonLabelActive: {
    color: "#ffffff",
  },
  episodesList: {
    width: "100%",
  },
});
