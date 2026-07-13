import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Image, ImageBackground, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Star, Film, Cable, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useAppContext } from "../../context/AppContext.jsx";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { useStreamActions } from "../../hooks/useStreamActions.js";
import { useSeasonScroll } from "../../hooks/useSeasonScroll.js";
import { fetchSeriesMeta, fetchEpisodeStreams } from "../../services/cinemeta.js";
import { fetchEpisodeRatings } from "../../services/episodeRatings.js";
import Loader from "../../components/common/Loader.jsx";
import ResultCard from "../../components/cards/ResultCard.jsx";
import EpisodeCard from "../../components/cards/EpisodeCard.jsx";
import { theme } from "../../styles/theme.js";

// Entry stagger removed for speed — long episode lists took ~1s+ to reveal.

export default function SeriesPage() {
  const route = useRoute();
  const { id, season: seasonParam, episode: episodeParam } = route.params || {};
  const navigation = useNavigation();

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

  const { addonApis, imdbMode } = useSettingsContext();
  const { initAction } = useStreamActions();
  const {
    seasonBarRef,
    canScrollLeft,
    canScrollRight,
    checkScroll,
    scrollSeasons,
    handleScroll,
    handleContentSizeChange,
    handleLayout,
  } = useSeasonScroll();

  const [meta, setMeta] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [episodeRatings, setEpisodeRatings] = useState({});

  // Real per-episode ratings (TVMaze) — Cinemeta only ever sends "0".
  useEffect(() => {
    let cancelled = false;
    fetchEpisodeRatings(id).then((map) => {
      if (!cancelled) setEpisodeRatings(map);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Use ref to avoid stale closure for initAction in effect
  const initActionRef = useRef(initAction);
  initActionRef.current = initAction;

  const visibleEpisodes = useMemo(() => {
    if (selectedSeason === null || selectedSeason === undefined) return [];
    return episodes.filter((ep) => Number(ep.season) === Number(selectedSeason));
  }, [episodes, selectedSeason]);

  // Trigger checkScroll when seasons or selectedSeason change
  useEffect(() => {
    const timeout = setTimeout(checkScroll, 100);
    return () => clearTimeout(timeout);
  }, [seasons, selectedSeason, checkScroll]);

  // Fetch series metadata and cache in local state
  useEffect(() => {
    fetchSeriesMeta(id)
      .then((data) => {
        if (data) {
          setMeta(data);

          // Hydrate seasons and episodes if not already done
          if (episodes.length === 0) {
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
    const stateItem = route.params?.item;
    const autoPlayMagnet = route.params?.autoPlayMagnet;
    const isEpisodePath = !!(seasonParam && episodeParam);

    setSelectedItem(
      stateItem || {
        id,
        name: isEpisodePath ? `Season ${seasonParam} Ep ${episodeParam}` : "Series",
        type: "series",
      }
    );

    if (autoPlayMagnet) {
      navigation.setParams({ autoPlayMagnet: null });
      initActionRef.current(autoPlayMagnet, "stream", true);
    }

    if (isEpisodePath) {
      setSelectedSeason(Number(seasonParam));
    }

    // If on episode path, fetch streams
    if (isEpisodePath) {
      setLoading(true);
      fetchEpisodeStreams(id, seasonParam, episodeParam, addonApis)
        .then((streams) => {
          setResults(streams);
          setLoading(false);
          // Note: the old web build auto-scrolled the page to the newly
          // revealed stream list via document.querySelector +
          // scrollIntoView. There is no DOM here, and Layout's ScrollView
          // doesn't currently expose a ref down to this screen, so that
          // auto-scroll is intentionally dropped rather than faked.
        })
        .catch((e) => {
          console.error(e);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, seasonParam, episodeParam, addonApis]);

  const isEpisodePath = !!(seasonParam && episodeParam);

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
            <View style={styles.posterWrap}>
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
                {meta.year && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{meta.year}</Text>
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

      {/* SELECTED EPISODE STREAMING LIST */}
      {isEpisodePath && results.length > 0 && (
        <View style={styles.selectedEpisodeStreams}>
          <View style={styles.streamsTitleRow}>
            <Cable size={16} color={theme.colors.text} />
            <Text style={styles.streamsTitle}>
              {" "}Available Streams for Season {seasonParam} Episode {episodeParam}
            </Text>
          </View>
          <View style={styles.resultsContainer}>
            {results.map((item, index) => (
              <ResultCard
                key={`${item.infoHash || item.magnet || "no-hash"}-${item.title || "no-title"}-${index}`}
                item={item}
                index={index}
              />
            ))}
          </View>
        </View>
      )}

      {seasons.length > 0 && (
        <View style={styles.seriesViewContainer}>
          {/* SEASON BAR */}
          <View style={styles.seasonBarContainer}>
            {canScrollLeft && (
              <TouchableOpacity style={[styles.scrollArrow, styles.scrollArrowLeft]} onPress={() => scrollSeasons("left")}>
                <ChevronLeft size={20} color={theme.colors.text} />
              </TouchableOpacity>
            )}

            <ScrollView
              horizontal
              ref={seasonBarRef}
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              onContentSizeChange={handleContentSizeChange}
              onLayout={handleLayout}
              scrollEventThrottle={16}
              style={styles.seasonBar}
            >
              {seasons.map((s) => {
                const isActive = Number(selectedSeason) === Number(s);
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.seasonTab, isActive && styles.seasonTabActive]}
                    onPress={() => {
                      setSelectedSeason(s);
                      setResults([]);
                    }}
                  >
                    <Text style={[styles.seasonTabLabel, isActive && styles.seasonTabLabelActive]}>
                      {Number(s) === 0 ? "Specials" : `Season ${s}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {canScrollRight && (
              <TouchableOpacity style={[styles.scrollArrow, styles.scrollArrowRight]} onPress={() => scrollSeasons("right")}>
                <ChevronRight size={20} color={theme.colors.text} />
              </TouchableOpacity>
            )}
          </View>

          {/* EPISODES GRID */}
          {selectedSeason !== null && selectedSeason !== undefined && (
            <View key={selectedSeason} style={styles.episodesGrid}>
              {visibleEpisodes.map((episode, i) => (
                <View key={episode.id || `${episode.season}-${episode.episode}-${i}`} style={styles.episodeCardWrap}>
                  <EpisodeCard
                    episode={episode}
                    seriesId={id}
                    selectedItem={meta || selectedItem}
                    rating={episodeRatings[`${Number(episode.season)}:${Number(episode.episode)}`]}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {imdbMode && !isEpisodePath && results.length > 0 && (
        <View style={styles.resultsContainer}>
          {results.map((item, index) => (
            <ResultCard
              key={`${item.infoHash || item.magnet || "no-hash"}-${item.title || "no-title"}-${index}`}
              item={item}
              index={index}
            />
          ))}
        </View>
      )}
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
  selectedEpisodeStreams: {
    marginBottom: 16,
  },
  streamsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  streamsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  resultsContainer: {
    gap: 12,
  },
  seriesViewContainer: {
    marginTop: 8,
  },
  seasonBarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  seasonBar: {
    flexDirection: "row",
  },
  seasonTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
  },
  seasonTabActive: {
    backgroundColor: theme.colors.accent,
  },
  seasonTabLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.textMuted,
  },
  seasonTabLabelActive: {
    color: "#fff",
  },
  scrollArrow: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
  },
  scrollArrowLeft: {
    marginRight: 6,
  },
  scrollArrowRight: {
    marginLeft: 6,
  },
  episodesGrid: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  episodeCardWrap: {
    minWidth: 260,
  },
});
