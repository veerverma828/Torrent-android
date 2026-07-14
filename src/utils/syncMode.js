import { traktAuth } from "../services/trakt/traktAuth.js";
import { storageService } from "../services/storageService.js";

const SYNC_MODE_KEY = "syncMode";

// The only sanctioned way to read sync mode outside React. SettingsContext
// persists this via storageService.set, which already JSON-encodes/decodes
// — reading it any other way (e.g. a raw MMKV getString) is the exact bug
// that silently disabled Trakt sync previously.
export function getSyncMode() {
  try {
    const mode = storageService.get(SYNC_MODE_KEY);
    return mode === "trakt" ? "trakt" : "local";
  } catch {
    return "local";
  }
}

export function isTraktSyncEnabled() {
  return getSyncMode() === "trakt" && traktAuth.isAuthenticated();
}
