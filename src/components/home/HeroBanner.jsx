import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ImageBackground, Pressable, Dimensions, PanResponder } from "react-native";
import { Play, Info, Star } from "lucide-react-native";
import { useAppContext } from "../../context/AppContext.jsx";
import { useNavigate } from "../../hooks/useNavigate.js";
import { theme } from "../../styles/theme.js";

const HERO_POOL_SIZE = 5;
const AUTO_ADVANCE_MS = 8000;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

function pickHeroCandidates(movies, series) {
  return [...movies, ...series]
    .filter((item) => item.background && item.description)
    .sort((a, b) => (Number(b.imdbRating) || 0) - (Number(a.imdbRating) || 0))
    .slice(0, HERO_POOL_SIZE);
}

export default function HeroBanner() {
  const navigate = useNavigate();
  const { movies, series, moviesLoading, seriesLoading } = useAppContext();

  const candidates = useMemo(
    () => pickHeroCandidates(movies, series),
    [movies.length, series.length]
  );

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const count = candidates.length;
  const hero = count > 0 ? candidates[index % count] : null;

  const goNext = () => setIndex((i) => (i + 1) % count);
  const goPrev = () => setIndex((i) => (i - 1 + count) % count);

  useEffect(() => {
    setIndex(0);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;

    timerRef.current = setInterval(goNext, AUTO_ADVANCE_MS);
    return () => clearInterval(timerRef.current);
  }, [count, index]);

  // Swipe left/right to change slides (replaces the old chevron buttons).
  // Recreated each render (cheap) so it always closes over the current
  // goNext/goPrev — a useRef-memoized version would go stale after render 1.
  const SWIPE_THRESHOLD = 40;
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_evt, gesture) =>
      Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderRelease: (_evt, gesture) => {
      if (gesture.dx <= -SWIPE_THRESHOLD) goNext();
      else if (gesture.dx >= SWIPE_THRESHOLD) goPrev();
    },
  });

  if (moviesLoading && seriesLoading) {
    return <View style={[styles.banner, styles.skeleton]} />;
  }

  if (!hero) return null;

  const goToDetail = () => {
    navigate(`/${hero.type}/${hero.id}`, { state: { item: hero } });
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <ImageBackground
        source={{ uri: hero.background }}
        style={styles.banner}
        resizeMode="cover"
      >
        {/* Gradients simulation using overlaid views */}
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>
              {hero.name}
            </Text>

            <View style={styles.badgeRow}>
              {hero.imdbRating ? (
                <View style={[styles.badge, styles.ratingBadge]}>
                  <Star size={10} color={theme.colors.warning} fill={theme.colors.warning} />
                  <Text style={styles.ratingText}>{hero.imdbRating}</Text>
                </View>
              ) : null}
              {hero.releaseInfo || hero.year ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{hero.releaseInfo || hero.year}</Text>
                </View>
              ) : null}
              {hero.genres?.slice(0, 2).map((g) => (
                <View key={g} style={[styles.badge, styles.genreBadge]}>
                  <Text style={styles.genreText}>{g}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.description} numberOfLines={3}>
              {hero.description}
            </Text>

            <View style={styles.actionsRow}>
              <Pressable
                focusable={true}
                onPress={goToDetail}
                style={({ pressed, focused }) => [
                  styles.heroBtn,
                  styles.playBtn,
                  focused && styles.btnFocused,
                  pressed && styles.btnPressed
                ]}
              >
                <Play size={14} color="#000000" fill="#000000" />
                <Text style={styles.playBtnText}>Play</Text>
              </Pressable>
              
              <Pressable
                focusable={true}
                onPress={goToDetail}
                style={({ pressed, focused }) => [
                  styles.heroBtn,
                  styles.infoBtn,
                  focused && styles.btnFocused,
                  pressed && styles.btnPressed
                ]}
              >
                <Info size={14} color="#ffffff" />
                <Text style={styles.infoBtnText}>More Info</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ImageBackground>

      {count > 1 && (
        <>
          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {candidates.map((_, i) => (
              <Pressable
                key={i}
                onPress={() => setIndex(i)}
                style={[
                  styles.dot,
                  i === (index % count) && styles.dotActive
                ]}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    position: "relative",
    width: "95%",
    alignSelf: "center",
    height: 220,
  },
  skeleton: {
    backgroundColor: theme.colors.surfaceLight,
  },
  banner: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
    // Simulate top/bottom gradients
    padding: theme.spacing.md,
  },
  content: {
    width: "80%",
  },
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
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
    fontSize: 9,
    fontWeight: "bold",
  },
  badgeText: {
    color: theme.colors.text,
    fontSize: 9,
  },
  genreBadge: {
    backgroundColor: "rgba(0, 123, 255, 0.12)",
    borderColor: "rgba(0, 123, 255, 0.25)",
    borderWidth: 1,
  },
  genreText: {
    color: "#70b5ff",
    fontSize: 9,
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: theme.spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 6,
  },
  playBtn: {
    backgroundColor: "#ffffff",
  },
  playBtnText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  infoBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  btnFocused: {
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  btnPressed: {
    opacity: 0.8,
  },
  dotsContainer: {
    position: "absolute",
    bottom: theme.spacing.sm,
    right: theme.spacing.md,
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  dotActive: {
    backgroundColor: theme.colors.accent,
    width: 12,
  },
});
