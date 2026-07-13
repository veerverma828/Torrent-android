import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export const storageService = {
  get(key) {
    try {
      const item = storage.getString(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      storage.set(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage error:", e);
      throw e;
    }
  },

  remove(key) {
    storage.delete(key);
  },
};
