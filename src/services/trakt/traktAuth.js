import { traktApi } from "./traktApi.js";
import { API_URL } from "../api.js";
import { storageService } from "../storageService.js";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "trakt_access_token",
  REFRESH_TOKEN: "trakt_refresh_token",
  EXPIRES_AT: "trakt_token_expires_at",
  USER: "trakt_user",
};

export const traktAuth = {
  async startDeviceFlow() {
    const response = await fetch(`${API_URL}/trakt/device/code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      let message = "Failed to start Trakt device flow";
      try {
        const body = await response.json();
        if (body?.message) message = body.message;
      } catch {
        // Response wasn't JSON — fall back to the generic message.
      }
      throw new Error(message);
    }

    return response.json();
  },

  async pollForAccessToken(deviceCode, interval = 5) {
    return new Promise((resolve, reject) => {
      const maxDuration = 10 * 60 * 1000;
      const startTime = Date.now();
      let currentInterval = interval * 1000;

      const poll = async () => {
        if (Date.now() - startTime >= maxDuration) {
          reject(new Error("Trakt authentication timed out"));
          return;
        }

        try {
          const response = await fetch(`${API_URL}/trakt/device/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: deviceCode }),
          });

          if (response.status === 200) {
            const data = await response.json();
            this.saveTokens(data);
            try {
              const profile = await traktApi.getProfile();
              storageService.set(STORAGE_KEYS.USER, profile.user);
            } catch (error) {
              // Handle profile fetch failures, especially account deactivation
              if (error.message.includes("deactivated")) {
                console.warn("Trakt account deactivated:", error.message);
                // Clear tokens to force re-authentication
                this.logout();
              }
            }
            resolve(data);
            return;
          }

          let data = {};
          try {
            data = await response.json();
          } catch {
            // Ignore non-JSON responses
          }

          if (data.error === "slow_down") {
            currentInterval += 2000;
          }

          if (data.error === "expired_token") {
            reject(new Error("Trakt device code expired. Please try again."));
            return;
          }

          if (data.error === "access_denied") {
            reject(new Error("Trakt authorization was denied."));
            return;
          }

          // authorization_pending and any other status -> keep polling silently
        } catch (error) {
          // Network error -> keep polling silently
        }

        setTimeout(poll, currentInterval);
      };

      setTimeout(poll, currentInterval);
    });
  },

  saveTokens(data) {
    storageService.set(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
    storageService.set(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
    storageService.set(
      STORAGE_KEYS.EXPIRES_AT,
      String(Date.now() + data.expires_in * 1000)
    );
  },

  async refreshAccessToken() {
    const refreshToken = storageService.get(STORAGE_KEYS.REFRESH_TOKEN);

    if (!refreshToken) {
      throw new Error("Missing refresh token");
    }

    const response = await fetch(`${API_URL}/trakt/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      this.logout();
      throw new Error("Failed to refresh Trakt token");
    }

    const data = await response.json();

    this.saveTokens(data);

    return data;
  },

  async ensureValidToken() {
    const token = storageService.get(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      throw new Error("No Trakt access token found. Please reconnect your Trakt account.");
    }

    const expiresAt = Number(storageService.get(STORAGE_KEYS.EXPIRES_AT) || 0);

    // Missing/corrupt expiry is NOT "still valid" — treat it the same as
    // "past the refresh window" so a stale/incomplete token gets refreshed
    // rather than used indefinitely.
    const refreshWindow = 5 * 60 * 1000;

    if (!expiresAt || Date.now() + refreshWindow >= expiresAt) {
      await this.refreshAccessToken();
    }

    return true;
  },

  logout() {
    Object.values(STORAGE_KEYS).forEach((key) => {
      storageService.remove(key);
    });
  },

  isAuthenticated() {
    return Boolean(storageService.get(STORAGE_KEYS.ACCESS_TOKEN));
  },

  getUser() {
    return storageService.get(STORAGE_KEYS.USER);
  },
};
