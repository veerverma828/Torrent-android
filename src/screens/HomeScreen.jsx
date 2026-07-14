import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, X, ArrowRight } from "lucide-react-native";
import { useAppContext } from "../context/AppContext.jsx";
import { useSettingsContext } from "../context/SettingsContext.jsx";
import { useContinueWatching } from "../hooks/useContinueWatching.js";
import { useSearch } from "../hooks/useSearch.js";
import { fetchAddonCatalogRails } from "../services/addonCatalogs.js";
import { groupByGenre } from "../utils/mediaGrouping.js";
import { useUpdate } from "../context/UpdateContext.jsx";
import Loader from "../components/common/Loader.jsx";
import ContinueWatchingCard from "../components/cards/ContinueWatchingCard.jsx";
import ResultCard from "../components/cards/ResultCard.jsx";
import HeroBanner from "../components/home/HeroBanner.jsx";
import MediaRail from "../components/home/MediaRail.jsx";
import SkeletonRail from "../components/home/SkeletonRail.jsx";
import { theme } from "../styles/theme.js";

const logoImg = require("../assets/Images/title-logo-600.png");

export default function HomeScreen() {
  const {
    movies,
    series,
    results,
    loading,
    moviesLoading,
    seriesLoading,
    selectedItem,
    setSelectedItem,
    setSeasons,
    setEpisodes,
    setSelectedSeason,
    setResults,
    query,
    setQuery,
  } = useAppContext();

  const { 
    imdbMode, 
    useJackett, 
    addonApis, 
    debridService, 
    setDebridService,
  } = useSettingsContext();

  const { continueWatchingList, removeFromContinueWatching } = useContinueWatching();
  const { searchContent, searchTorrents } = useSearch();
  
  const [addonRails, setAddonRails] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Extra Home rails from installed Stremio addons that expose catalogs.
  useEffect(() => {
    let cancelled = false;
    fetchAddonCatalogRails(addonApis)
      .then((rails) => {
        if (!cancelled) setAddonRails(rails);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [addonApis]);

  useEffect(() => {
    if (selectedItem !== null) {
      setSelectedItem(null);
      if (!useJackett && !imdbMode) setResults([]);
    }

    setSeasons([]);
    setEpisodes([]);
    setSelectedSeason(null);
  }, []);

  const trimmedQuery = query.trim();
  const showCatalog = !imdbMode && !selectedItem && results.length === 0;
  const isBrowsing = trimmedQuery === "";

  const genreRails = useMemo(() => {
    if (!isBrowsing) return [];
    return groupByGenre([...movies, ...series]);
  }, [isBrowsing, movies, series]);

  const renderContinueWatchingCard = useCallback(
    (item) => <ContinueWatchingCard item={item} onRemove={removeFromContinueWatching} />,
    [removeFromContinueWatching]
  );

  const placeholder = imdbMode
    ? "Enter IMDb ID (e.g. tt10872600)"
    : useJackett
      ? "Search torrents..."
      : "Search movies or series...";

  const runSearch = useJackett || imdbMode ? searchTorrents : searchContent;
  const hasQuery = query.trim().length > 0;
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      {loading && <Loader />}

      {/* Top Header Bar */}
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
        <Image source={logoImg} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Search Input Container */}
      <View style={styles.searchContainer}>
        <Search size={16} color={theme.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={runSearch}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          style={[
            styles.searchInput,
            isSearchFocused && styles.searchInputFocused,
            hasQuery && styles.searchInputHasText
          ]}
        />
        {hasQuery && (
          <Pressable onPress={() => setQuery("")} style={styles.clearBtn}>
            <X size={16} color={theme.colors.textMuted} />
          </Pressable>
        )}
        <Pressable
          focusable={true}
          disabled={!hasQuery}
          onPress={runSearch}
          style={({ focused, pressed }) => [
            styles.searchGoBtn,
            hasQuery ? styles.searchGoActive : styles.searchGoInactive,
            focused && styles.btnFocused,
            pressed && styles.btnPressed
          ]}
        >
          <ArrowRight size={16} color="#ffffff" />
        </Pressable>
      </View>

      {/* Debrid Selector Pill on Home Screen */}
      {showCatalog && (
        <View style={styles.debridSelector}>
          <Pressable
            focusable={true}
            onPress={() => setDebridService("real-debrid")}
            style={[
              styles.debridTab,
              debridService === "real-debrid" && styles.debridTabActive
            ]}
          >
            <Text style={[styles.debridTabText, debridService === "real-debrid" && styles.debridTabTextActive]}>
              Real-Debrid
            </Text>
          </Pressable>
          <Pressable
            focusable={true}
            onPress={() => setDebridService("torbox")}
            style={[
              styles.debridTab,
              debridService === "torbox" && styles.debridTabActive
            ]}
          >
            <Text style={[styles.debridTabText, debridService === "torbox" && styles.debridTabTextActive]}>
              Torbox
            </Text>
          </Pressable>
        </View>
      )}

      {/* Main Scroll Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
        {showCatalog && isBrowsing && <HeroBanner />}

        {showCatalog && (
          <View style={styles.contentSection}>
            {trimmedQuery === "" && continueWatchingList.length > 0 && (
              <MediaRail
                title="Continue Watching"
                items={continueWatchingList}
                keyPrefix="cw"
                renderItem={renderContinueWatchingCard}
              />
            )}

            {moviesLoading ? (
              <SkeletonRail title={trimmedQuery ? "Movies" : "Trending Movies"} />
            ) : (
              <MediaRail
                title={trimmedQuery ? "Movies" : "Trending Movies"}
                items={movies}
                type="movie"
                keyPrefix="movies"
              />
            )}

            {seriesLoading ? (
              <SkeletonRail title={trimmedQuery ? "Series" : "Trending Series"} />
            ) : (
              <MediaRail
                title={trimmedQuery ? "Series" : "Trending Series"}
                items={series}
                type="series"
                keyPrefix="series"
              />
            )}

            {addonRails.map((rail) => (
              <MediaRail
                key={rail.key}
                title={rail.title}
                items={rail.metas}
                type={rail.type}
                keyPrefix={rail.key}
              />
            ))}

            {genreRails.map(({ genre, items }) => (
              <MediaRail key={genre} title={genre} items={items} keyPrefix={`genre-${genre}`} />
            ))}
          </View>
        )}

        {(imdbMode || results.length > 0) && (
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  logo: {
    width: 200,
    height: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingLeft: 36,
    position: "relative",
    height: 46,
    marginVertical: theme.spacing.sm,
  },
  searchIcon: {
    position: "absolute",
    left: 14,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: theme.colors.text,
    fontSize: 14,
    paddingRight: 50,
  },
  searchInputFocused: {
    borderColor: theme.colors.accent,
  },
  searchInputHasText: {
    paddingRight: 80,
  },
  clearBtn: {
    position: "absolute",
    right: 50,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  searchGoBtn: {
    position: "absolute",
    right: 4,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  searchGoActive: {
    backgroundColor: theme.colors.accent,
  },
  searchGoInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  btnFocused: {
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  btnPressed: {
    opacity: 0.8,
  },
  debridSelector: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: theme.colors.surface,
    padding: 3,
    borderRadius: 20,
    gap: 2,
    marginVertical: theme.spacing.xs,
  },
  debridTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "transparent",
  },
  debridTabActive: {
    backgroundColor: theme.colors.accent,
  },
  debridTabText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  debridTabTextActive: {
    color: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  contentSection: {
    width: "100%",
  },
  resultsContainer: {
    paddingHorizontal: theme.spacing.md,
    width: "100%",
  },
});
