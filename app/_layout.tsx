import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/services/queryClient';
import { useAppStore } from '../src/store/useAppStore';
import { useAuthStore } from '../src/store/useAuthStore';
import '../src/i18n';

export default function RootLayout() {
  const loadInitialState = useAppStore((state) => state.loadInitialState);
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    async function init() {
      await loadInitialState();
      await restoreSession();
    }
    init();
  }, [loadInitialState, restoreSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/welcome" />
        <Stack.Screen name="(auth)/language" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="(onboarding)/index" />
        <Stack.Screen name="(onboarding)/farm-setup" />
        <Stack.Screen name="(main)" />
      </Stack>
    </QueryClientProvider>
  );
}
