import { create } from 'zustand';
import { AuthService } from '../services/authService';
import { HttpClient } from '../services/httpClient';
import { queryClient } from '../services/queryClient';
import { useAppStore } from './useAppStore';
import { AuthSessionStatus, User } from '../types';

interface AuthState {
  user: User | null;
  status: AuthSessionStatus;
  isAuthenticated: boolean;
  isInitializing: boolean;

  setAuth: (user: User) => void;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  handleSessionExpired: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'SESSION_RESTORING',
  isAuthenticated: false,
  isInitializing: true,

  setAuth: (user: User) => {
    set({
      user,
      status: 'SESSION_AUTHENTICATED',
      isAuthenticated: true,
      isInitializing: false,
    });
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  logout: async () => {
    await AuthService.logout();
    await useAppStore.getState().resetFarmContext();
    queryClient.clear();
    set({
      user: null,
      status: 'SESSION_UNAUTHENTICATED',
      isAuthenticated: false,
      isInitializing: false,
    });
  },

  restoreSession: async () => {
    set({ status: 'SESSION_RESTORING', isInitializing: true });
    try {
      const user = await AuthService.restoreSession();
      if (user) {
        set({
          user,
          status: 'SESSION_AUTHENTICATED',
          isAuthenticated: true,
          isInitializing: false,
        });
      } else {
        await useAppStore.getState().resetFarmContext();
        queryClient.clear();
        set({
          user: null,
          status: 'SESSION_UNAUTHENTICATED',
          isAuthenticated: false,
          isInitializing: false,
        });
      }
    } catch {
      await useAppStore.getState().resetFarmContext();
      queryClient.clear();
      set({
        user: null,
        status: 'SESSION_UNAUTHENTICATED',
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  },

  handleSessionExpired: async () => {
    await useAppStore.getState().resetFarmContext();
    queryClient.clear();
    set({
      user: null,
      status: 'SESSION_UNAUTHENTICATED',
      isAuthenticated: false,
      isInitializing: false,
    });
  },
}));

// Register session expired handler with HttpClient
HttpClient.registerSessionExpiredHandler(() => {
  useAuthStore.getState().handleSessionExpired();
});
