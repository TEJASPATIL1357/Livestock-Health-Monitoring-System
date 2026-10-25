import { create } from 'zustand';
import { changeLanguage } from '../i18n';
import { LocalStorage } from '../storage/localStorage';
import { Farm, LanguageCode } from '../types';

interface AppState {
  language: LanguageCode;
  onboardingCompleted: boolean;
  farmSetupCompleted: boolean;
  activeFarm: Farm | null;
  activeFarmId: string | null;

  setLanguage: (lang: LanguageCode) => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  setFarmSetupCompleted: (completed: boolean) => Promise<void>;
  setActiveFarm: (farm: Farm | null) => void;
  setActiveFarmId: (id: string | null) => void;
  resetFarmContext: () => Promise<void>;
  loadInitialState: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  onboardingCompleted: false,
  farmSetupCompleted: false,
  activeFarm: null,
  activeFarmId: null,

  setLanguage: async (lang: LanguageCode) => {
    await changeLanguage(lang);
    await LocalStorage.setLanguage(lang);
    set({ language: lang });
  },

  setOnboardingCompleted: async (completed: boolean) => {
    await LocalStorage.setOnboardingCompleted(completed);
    set({ onboardingCompleted: completed });
  },

  setFarmSetupCompleted: async (completed: boolean) => {
    await LocalStorage.setFarmSetupCompleted(completed);
    set({ farmSetupCompleted: completed });
  },

  setActiveFarm: (farm: Farm | null) => {
    set({ activeFarm: farm, activeFarmId: farm?.id || null });
  },

  setActiveFarmId: (id: string | null) => {
    set({ activeFarmId: id });
  },

  resetFarmContext: async () => {
    await LocalStorage.clearPreferences();
    set({ activeFarm: null, activeFarmId: null, farmSetupCompleted: false });
  },

  loadInitialState: async () => {
    const savedLang = await LocalStorage.getLanguage();
    if (savedLang) {
      await changeLanguage(savedLang);
      set({ language: savedLang });
    }

    const onboarding = await LocalStorage.getOnboardingCompleted();
    const farmSetup = await LocalStorage.getFarmSetupCompleted();

    set({
      onboardingCompleted: onboarding,
      farmSetupCompleted: farmSetup,
    });
  },
}));
