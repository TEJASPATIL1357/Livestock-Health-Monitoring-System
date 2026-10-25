import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Home, Contact, Bot, Bell, Menu } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { theme } from '../../src/theme/theme';

export default function MainLayout() {
  const { t } = useTranslation();
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (!isInitializing && !isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[800],
        tabBarInactiveTintColor: theme.colors.neutral[400],
        tabBarStyle: {
          backgroundColor: theme.colors.surface.card,
          borderTopColor: theme.colors.neutral[200],
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          ...theme.shadows.md,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="animals"
        options={{
          title: t('nav.animals'),
          tabBarIcon: ({ color, size }) => <Contact size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: t('nav.aiAssistant'),
          tabBarIcon: ({ color, size }) => <Bot size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: t('nav.alerts'),
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('nav.more'),
          tabBarIcon: ({ color, size }) => <Menu size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="farm-details"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
