import { NativeModules, DeviceEventEmitter } from 'react-native';

const ApkUpdater = NativeModules.ApkUpdater;

export async function canInstallApks() {
  if (!ApkUpdater) return false;
  try {
    const { allowed } = await ApkUpdater.canInstall();
    return allowed;
  } catch {
    return false;
  }
}

export async function openInstallPermissionSettings() {
  if (!ApkUpdater) return;
  await ApkUpdater.openInstallPermissionSettings();
}

export function downloadUpdate(url, { onProgress, onComplete, onError, onCancelled } = {}) {
  if (!ApkUpdater) {
    onError?.('Not running in the installed app');
    return { cancel: () => {} };
  }

  const subscriptions = [];
  const cleanup = () => subscriptions.forEach((sub) => sub.remove());

  subscriptions.push(
    DeviceEventEmitter.addListener('downloadProgress', (data) => onProgress?.(data))
  );
  subscriptions.push(
    DeviceEventEmitter.addListener('downloadComplete', (data) => {
      cleanup();
      onComplete?.(data);
    })
  );
  subscriptions.push(
    DeviceEventEmitter.addListener('downloadError', (data) => {
      cleanup();
      onError?.(data.message);
    })
  );
  subscriptions.push(
    DeviceEventEmitter.addListener('downloadCancelled', () => {
      cleanup();
      onCancelled?.();
    })
  );

  ApkUpdater.download(url).catch((err) => {
    cleanup();
    onError?.(err.message || 'Download failed');
  });

  return {
    cancel: () => ApkUpdater.cancelDownload(),
  };
}

export async function installDownloadedApk() {
  if (!ApkUpdater) return;
  await ApkUpdater.install();
}

export const isNativeApp = !!ApkUpdater;
