import { useState, useEffect } from 'react';
import { traktSyncQueue } from '../services/trakt/traktSyncQueue.js';

export function useSyncStatus() {
  const [syncStatus, setSyncStatus] = useState(() => traktSyncQueue.getSyncStatus());

  useEffect(() => {
    const updateStatus = () => {
      setSyncStatus(traktSyncQueue.getSyncStatus());
    };

    // Update status every 5 seconds. There's no NetInfo dependency
    // installed for real online/offline events, so polling is the RN
    // equivalent here.
    const interval = setInterval(updateStatus, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const retrySync = () => {
    return traktSyncQueue.retryAll();
  };

  return {
    ...syncStatus,
    retrySync,
    isSyncing: syncStatus.isProcessing || syncStatus.queueLength > 0,
    hasIssues: !syncStatus.isOnline || syncStatus.hasFailedOperations
  };
}
