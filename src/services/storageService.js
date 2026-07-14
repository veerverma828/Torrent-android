import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory cache backs a synchronous get/set/remove API (matching the old
// mmkv contract) on top of AsyncStorage, which is async-only. Call hydrate()
// once before first render so the cache is warm before any get() runs.
const cache = new Map();
let hydrated = false;

export async function hydrateStorage() {
  if (hydrated) return;
  const keys = await AsyncStorage.getAllKeys();
  const values = await AsyncStorage.getMany(keys);
  for (const key of keys) {
    if (values[key] != null) cache.set(key, values[key]);
  }
  hydrated = true;
}

export const storageService = {
  get(key) {
    try {
      const item = cache.has(key) ? cache.get(key) : null;
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      cache.set(key, serialized);
      AsyncStorage.setItem(key, serialized).catch((e) => {
        console.error('Storage persist error:', e);
      });
    } catch (e) {
      console.error('Storage error:', e);
      throw e;
    }
  },

  remove(key) {
    cache.delete(key);
    AsyncStorage.removeItem(key).catch((e) => {
      console.error('Storage remove error:', e);
    });
  },
};
