import { useEffect, useMemo } from "react";
import { useRoute } from "@react-navigation/native";
import { useMediaContext } from "../../context/AppContext.jsx";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { usePlayerContext } from "../../context/PlayerContext.jsx";
import { progressService } from "../../trackers/progressService.js";
import { showToast } from "../common/Toast.jsx";
import { RESUME_SKIP_THRESHOLD } from "../../utils/constants.js";
import { fetchEpisodeStreams } from "../../services/cinemeta.js";
import { getFiles, generateLink } from "../../services/torrentService.js";
import {
  isNativePlayerAvailable,
  playNative,
  playTorrentNative,
  stopNative,
  onNativePlayerEvent,
} from "../../lib/nativePlayer.js";

// Next episode in play order, across season boundaries. Returns null at the
// end of the available list.
function findNextEpisode(episodes, season, episode) {
  const sorted = [...episodes]
    .filter((e) => e.season != null && e.episode != null)
    .sort((a, b) => Number(a.season) - Number(b.season) || Number(a.episode) - Number(b.episode));
  const idx = sorted.findIndex(
    (e) => Number(e.season) === Number(season) && Number(e.episode) === Number(episode)
  );
  return idx >= 0 && idx + 1 < sorted.length ? sorted[idx + 1] : null;
}

function seriesSubtitle(meta) {
  if (!meta || meta.type !== "series") return "";
  const base = `S${meta.season} E${meta.episode}`;
  return meta.episodeTitle ? `${base} · ${meta.episodeTitle}` : base;
}

export default function VideoPlayer() {
  const route = useRoute();
  const { selectedItem, episodes = [], seasons = [] } = useMediaContext();
  const { addonApis, debridService, realDebridApiKey, torboxApiKey } = useSettingsContext();
  const debridKey = debridService === "real-debrid" ? realDebridApiKey : torboxApiKey;
  const { streamUrl, setStreamUrl, currentMagnet } = usePlayerContext();

  const movieMatch = useMemo(() => {
    if (route.name !== "Movie") return null;
    return { params: { id: route.params?.id } };
  }, [route.name, route.params]);

  const episodeMatch = useMemo(() => {
    if (route.name !== "Series" || route.params?.season == null || route.params?.episode == null) return null;
    return {
      params: {
        id: route.params?.id,
        season: route.params?.season,
        episode: route.params?.episode,
      },
    };
  }, [route.name, route.params]);

  const episodeMetadata = useMemo(() => {
    if (!episodeMatch) return null;

    const seasonNum = Number(episodeMatch.params.season);
    const epNum = Number(episodeMatch.params.episode);

    const currentEp = episodes.find((ep) => Number(ep.season) === seasonNum && Number(ep.episode) === epNum);

    return {
      seasonNum,
      episodesInSeason: episodes.filter((ep) => Number(ep.season) === seasonNum).length,
      currentEp,
    };
  }, [episodeMatch, episodes]);

  const getMetadata = () => {
    if (movieMatch) {
      return {
        type: "movie",
        id: movieMatch.params.id,
        imdbId: selectedItem?.id,
        title: selectedItem?.name,
        poster: selectedItem?.poster,
        magnet: currentMagnet.current,
      };
    }
    if (episodeMatch && episodeMetadata) {
      return {
        type: "series",
        id: episodeMatch.params.id,
        imdbId: selectedItem?.id,
        season: episodeMatch.params.season,
        episode: episodeMatch.params.episode,
        episodesInSeason: episodeMetadata.episodesInSeason,
        totalSeasons: seasons.length,
        title: selectedItem?.name,
        poster: selectedItem?.poster,
        episodeTitle: episodeMetadata.currentEp?.name || episodeMetadata.currentEp?.title,
        thumbnail: episodeMetadata.currentEp?.thumbnail,
        magnet: currentMagnet.current,
      };
    }
    return null;
  };

  // ===== Native (Android) playback: hand the URL to the ExoPlayer activity =====
  useEffect(() => {
    if (!isNativePlayerAvailable || !streamUrl) return undefined;

    let disposed = false;
    const unsubs = [];
    // A "magnet:" stream URL means P2P torrent streaming (no debrid); anything
    // else is an already-resolved direct/debrid HTTP URL.
    const isP2P = typeof streamUrl === "string" && streamUrl.startsWith("magnet:");
    const pct = (posMs, durMs) => (durMs > 0 ? (posMs / durMs) * 100 : 0);
    const saveFromEvent = (m, posMs, durMs) => {
      if (m && durMs > 0) progressService.saveProgress(m, posMs / 1000, durMs / 1000);
    };

    const resolveAndPlayNext = async () => {
      if (!episodeMatch) return stopNative();
      const seriesId = episodeMatch.params.id;
      const next = findNextEpisode(episodes, episodeMatch.params.season, episodeMatch.params.episode);
      if (!next) return stopNative();

      const streams = await fetchEpisodeStreams(seriesId, next.season, next.episode, addonApis);
      const magnet = streams?.[0]?.magnet;
      if (!magnet) return stopNative();

      currentMagnet.current = magnet;
      const nextMeta = {
        type: "series",
        id: seriesId,
        imdbId: selectedItem?.id,
        season: String(next.season),
        episode: String(next.episode),
        episodesInSeason: episodes.filter((e) => Number(e.season) === Number(next.season)).length,
        totalSeasons: seasons.length,
        title: selectedItem?.name,
        poster: selectedItem?.poster,
        episodeTitle: next.name || next.title,
        thumbnail: next.thumbnail,
        magnet,
      };
      const nextArgs = {
        title: nextMeta.title || "",
        subtitle: seriesSubtitle(nextMeta),
        startPercent: 0,
        metadata: nextMeta,
        hasNext: !!findNextEpisode(episodes, next.season, next.episode),
      };

      // Continue in the same mode the user started in.
      if (isP2P && !magnet.startsWith("http")) {
        await playTorrentNative({ magnet, ...nextArgs });
        return;
      }

      let url;
      if (magnet.startsWith("http")) {
        url = magnet;
      } else {
        const filesData = await getFiles(magnet, debridService, debridKey);
        const fileId = filesData?.files?.[0]?.id;
        if (!fileId) return stopNative();
        const link = await generateLink(filesData.torrentId, fileId, debridService, debridKey);
        url = link?.downloadUrl;
      }
      if (!url) return stopNative();

      await playNative({ url, ...nextArgs });
    };

    unsubs.push(onNativePlayerEvent("progress", ({ metadata, positionMs, durationMs }) => saveFromEvent(metadata, positionMs, durationMs)));
    unsubs.push(onNativePlayerEvent("resumed", ({ metadata, positionMs, durationMs }) => {
      if (metadata) progressService.startPlayback(metadata, pct(positionMs, durationMs));
    }));
    unsubs.push(onNativePlayerEvent("paused", ({ metadata, positionMs, durationMs }) => {
      saveFromEvent(metadata, positionMs, durationMs);
      if (metadata) progressService.stopPlayback(metadata, pct(positionMs, durationMs));
    }));
    unsubs.push(onNativePlayerEvent("ended", ({ metadata, durationMs }) => {
      if (metadata && durationMs > 0) progressService.saveProgress(metadata, durationMs / 1000, durationMs / 1000);
      if (metadata) progressService.stopPlayback(metadata, 100);
    }));
    unsubs.push(onNativePlayerEvent("playNext", () => {
      resolveAndPlayNext().catch((e) => {
        console.error("Auto-next failed:", e);
        stopNative();
      });
    }));
    unsubs.push(onNativePlayerEvent("closed", () => {
      if (disposed) return;
      disposed = true;
      // The native PlayerActivity already consumed the back-press (or the
      // video simply ended) and has finished, returning focus to whichever
      // JS screen was already showing beneath it. Just clear the stream
      // state — an extra goBack() here pops that already-correct screen,
      // sending the user one level further back than intended.
      setStreamUrl(null);
    }));
    // P2P resolve progress is now shown inside PlayerActivity itself (native
    // loading overlay), not as a web toast — torrentStatus is no longer
    // consumed here.
    unsubs.push(onNativePlayerEvent("error", ({ message }) => {
      console.error("Native player error:", message);
      // If this fires before PlayerActivity ever opened (e.g. P2P metadata
      // resolution failed/timed out), the modal state must be cleared too —
      // otherwise the UI looks stuck on a stream that silently died.
      showToast(message || "Playback failed to start");
      if (!disposed) {
        disposed = true;
        setStreamUrl(null);
      }
    }));

    (async () => {
      const metadata = getMetadata();
      let prog = null;
      if (movieMatch) prog = await progressService.getMovieProgress(movieMatch.params.id);
      else if (episodeMatch)
        prog = await progressService.getEpisodeProgress(episodeMatch.params.id, episodeMatch.params.season, episodeMatch.params.episode);

      let startPercent = 0;
      if (prog?.percentage > 0 && prog.percentage < RESUME_SKIP_THRESHOLD) startPercent = prog.percentage;

      const hasNext = !!(episodeMatch && findNextEpisode(episodes, episodeMatch.params.season, episodeMatch.params.episode));

      const args = {
        title: metadata?.title || "",
        subtitle: seriesSubtitle(metadata),
        startPercent,
        metadata,
        hasNext,
      };
      if (isP2P) await playTorrentNative({ magnet: streamUrl, ...args });
      else await playNative({ url: streamUrl, ...args });
    })();

    return () => unsubs.forEach((u) => u && u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamUrl]);

  // Native (Android) playback renders entirely inside its own full-screen
  // ExoPlayer Activity (see lib/nativePlayer.js) — this component's only
  // job is orchestrating that Activity via the effect above. There is no
  // in-JS video surface to render (RN has no <video> element), so it never
  // renders anything itself.
  return null;
}
