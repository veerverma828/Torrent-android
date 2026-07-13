import { isNativePlayerAvailable, getNativeLogs, clearNativeLogs, logClientError } from "../lib/nativePlayer.js";
import { storageService } from "./storageService.js";

/**
 * App-wide diagnostics log. In the Android app, errors are appended to the
 * same persistent file a native crash writes to (AppLogger.java) — so
 * Settings > Logs shows the full picture (native crash + JS errors) in one
 * export, even across the process death a crash causes. On plain web there's
 * no native file, so JS errors fall back to an in-memory ring buffer only.
 */

const WEB_LOG_KEY = "clientErrorLog";
const MAX_WEB_LINES = 300;
let installed = false;

function appendWebLog(line) {
  try {
    const existing = storageService.get(WEB_LOG_KEY) || "";
    const lines = existing ? existing.split("\n") : [];
    lines.push(line);
    const trimmed = lines.slice(-MAX_WEB_LINES);
    storageService.set(WEB_LOG_KEY, trimmed.join("\n"));
  } catch {
    // storage full/unavailable — nothing more we can do
  }
}

function record(tag, message) {
  const line = `${new Date().toISOString()} E/${tag}: ${message}`;
  if (isNativePlayerAvailable) {
    logClientError(tag, message);
  } else {
    appendWebLog(line);
  }
}

/** Call once at app startup. Captures uncaught JS errors and promise
 *  rejections app-wide, not just inside the player. */
export function installErrorLogging() {
  if (installed) return;
  installed = true;

  if (global.ErrorUtils) {
    const originalHandler = global.ErrorUtils.getGlobalHandler();
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      const message = error?.stack || error?.message || String(error);
      record("ErrorUtils", message);
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
}

/** Manual capture point for caught-but-notable errors (e.g. in catch blocks
 *  where you still want it in the exportable log). */
export function logError(tag, message) {
  record(tag, message);
}

/** Combined log text for the Settings > Logs tab: native (if available) +
 *  the web ring buffer (JS errors captured while running as a website, or
 *  before the native bridge was ready). */
export async function getCombinedLogs() {
  const parts = [];
  if (isNativePlayerAvailable) {
    const native = await getNativeLogs();
    if (native) parts.push(native);
  }
  try {
    const web = storageService.get(WEB_LOG_KEY);
    if (web) parts.push("--- web/JS log ---\n" + web);
  } catch {
    // ignore
  }
  return parts.join("\n\n") || "No errors logged yet.";
}

export async function clearAllLogs() {
  if (isNativePlayerAvailable) await clearNativeLogs();
  try {
    storageService.remove(WEB_LOG_KEY);
  } catch {
    // ignore
  }
}
