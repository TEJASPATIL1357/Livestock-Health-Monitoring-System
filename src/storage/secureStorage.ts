const KEYS = {
  ACCESS_TOKEN: 'slh_access_token',
  REFRESH_TOKEN: 'slh_refresh_token',
  USER_CREDENTIALS: 'slh_user_credentials',
};

// Memory cache for web / node test environments
const memoryStorage: Record<string, string> = {};

const isNativePlatform = (): boolean => {
  try {
    // Check if running in a real React Native environment with native bridge
    const { Platform } = require('react-native');
    return Boolean(Platform && (Platform.OS === 'ios' || Platform.OS === 'android'));
  } catch {
    return false;
  }
};

const getSecureStore = () => {
  try {
    return require('expo-secure-store');
  } catch {
    return null;
  }
};

export const SecureTokenStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (!isNativePlatform()) {
        memoryStorage[key] = value;
      } else {
        const store = getSecureStore();
        if (store) {
          await store.setItemAsync(key, value);
        } else {
          memoryStorage[key] = value;
        }
      }
    } catch (error) {
      console.error(`Error saving secure key ${key}:`, error);
      memoryStorage[key] = value;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (!isNativePlatform()) {
        return memoryStorage[key] || null;
      }
      const store = getSecureStore();
      if (store) {
        return await store.getItemAsync(key);
      }
      return memoryStorage[key] || null;
    } catch (error) {
      console.error(`Error reading secure key ${key}:`, error);
      return memoryStorage[key] || null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (!isNativePlatform()) {
        delete memoryStorage[key];
      } else {
        const store = getSecureStore();
        if (store) {
          await store.deleteItemAsync(key);
        } else {
          delete memoryStorage[key];
        }
      }
    } catch (error) {
      console.error(`Error removing secure key ${key}:`, error);
      delete memoryStorage[key];
    }
  },

  // Token Helpers
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await this.setItem(KEYS.ACCESS_TOKEN, accessToken);
    await this.setItem(KEYS.REFRESH_TOKEN, refreshToken);
  },

  async getAccessToken(): Promise<string | null> {
    return this.getItem(KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return this.getItem(KEYS.REFRESH_TOKEN);
  },

  async hasTokens(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    const refreshToken = await this.getRefreshToken();
    return Boolean(accessToken && refreshToken);
  },

  async clearTokens(): Promise<void> {
    await this.removeItem(KEYS.ACCESS_TOKEN);
    await this.removeItem(KEYS.REFRESH_TOKEN);
  },
};
