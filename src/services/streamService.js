import { Linking } from "react-native";
import { isAndroid, isIOS } from "../utils/deviceHelpers.js";

export function openExternalPlayer(url) {
  if (isAndroid()) {
    const urlObj = new URL(url);
    const intentUrl = `intent://${urlObj.host}${urlObj.pathname}${urlObj.search}#Intent;scheme=${urlObj.protocol.replace(":", "")};type=video/*;action=android.intent.action.VIEW;end`;
    Linking.openURL(intentUrl);
  } else if (isIOS()) {
    Linking.openURL(`vlc://${url}`);
  } else {
    // No DOM/Blob download surface on native — fall back to just opening
    // the stream URL directly (e.g. in an external browser/player).
    Linking.openURL(url);
  }
}

export function openDirectDownload(url) {
  Linking.openURL(url);
}

export function createM3uDownload(url) {
  openExternalPlayer(url);
}
