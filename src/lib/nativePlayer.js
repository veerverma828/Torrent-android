import { NativeModules, DeviceEventEmitter } from 'react-native';

const NativePlayer = NativeModules.NativePlayer;

export const isNativePlayerAvailable = !!NativePlayer;

export async function playNative({ url, title = '', subtitle = '', startPercent = 0, metadata = null, hasNext = false }) {
  if (!NativePlayer) return false;
  await NativePlayer.play({
    url,
    title,
    subtitle,
    startPercent: Number(startPercent) || 0,
    metadataJson: JSON.stringify(metadata || {}),
    hasNext: !!hasNext,
  });
  return true;
}

export async function playTorrentNative({ magnet, title = '', subtitle = '', startPercent = 0, metadata = null, hasNext = false }) {
  if (!NativePlayer) return false;
  await NativePlayer.playTorrent({
    magnet,
    title,
    subtitle,
    startPercent: Number(startPercent) || 0,
    metadataJson: JSON.stringify(metadata || {}),
    hasNext: !!hasNext,
  });
  return true;
}

export async function stopNative() {
  if (!NativePlayer) return;
  await NativePlayer.stop();
}

export async function getNativeLogs() {
  if (!NativePlayer) return '';
  try {
    const { logs } = await NativePlayer.getLogs();
    return logs || '';
  } catch {
    return '';
  }
}

export async function clearNativeLogs() {
  if (!NativePlayer) return;
  await NativePlayer.clearLogs();
}

export async function logClientError(tag, message) {
  if (!NativePlayer) return;
  try {
    await NativePlayer.logClientError(tag, message);
  } catch {
    // logging must never throw
  }
}

export function onNativePlayerEvent(event, cb) {
  if (!NativePlayer) return () => {};
  
  const subscription = DeviceEventEmitter.addListener(event, (data) => {
    let metadata = null;
    try {
      metadata = data?.metadata ? JSON.parse(data.metadata) : null;
    } catch {
      metadata = null;
    }
    cb({ ...data, metadata });
  });

  return () => subscription.remove();
}
