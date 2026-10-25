import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageCode } from '../types';

const STORAGE_KEYS = {
  LANGUAGE: '@slh_user_language',
  ONBOARDING_COMPLETED: '@slh_onboarding_completed',
  FARM_SETUP_COMPLETED: '@slh_farm_setup_completed',
  THEME_MODE: '@slh_theme_mode',
  ACTIVE_FARM_ID: '@slh_active_farm_id',
};

export const LocalStorage = {
  async setLanguage(lang: LanguageCode): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
  },

  async getLanguage(): Promise<LanguageCode | null> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return (val as LanguageCode) || null;
    } catch (e) {
      console.error('Failed to read language preference:', e);
      return null;
    }
  },

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, JSON.stringify(completed));
    } catch (e) {
      console.error('Failed to save onboarding state:', e);
    }
  },

  async getOnboardingCompleted(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return val ? JSON.parse(val) : false;
    } catch (e) {
      console.error('Failed to read onboarding state:', e);
      return false;
    }
  },

  async setFarmSetupCompleted(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FARM_SETUP_COMPLETED, JSON.stringify(completed));
    } catch (e) {
      console.error('Failed to save farm setup state:', e);
    }
  },

  async getFarmSetupCompleted(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.FARM_SETUP_COMPLETED);
      return val ? JSON.parse(val) : false;
    } catch (e) {
      console.error('Failed to read farm setup state:', e);
      return false;
    }
  },

  async clearPreferences(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        STORAGE_KEYS.FARM_SETUP_COMPLETED,
        STORAGE_KEYS.ACTIVE_FARM_ID,
      ]);
    } catch (e) {
      console.error('Failed to clear local preferences:', e);
    }
  },
};
