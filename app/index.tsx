import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { HeartPulse, Sprout } from 'lucide-react-native';
import { useAuthStore } from '../src/store/useAuthStore';
import { useAppStore } from '../src/store/useAppStore';
import { AppText } from '../src/components/AppText';
import { FarmService } from '../src/services/farmService';
import { theme } from '../src/theme/theme';

export default function SplashScreen() {
  const router = useRouter();
  const { status } = useAuthStore();
  const { setActiveFarm, setFarmSetupCompleted } = useAppStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (status === 'SESSION_RESTORING') return;

    let isMounted = true;

    async function routeUser() {
      if (status === 'SESSION_AUTHENTICATED') {
        try {
          const memberships = await FarmService.getMyFarms();
          if (!isMounted) return;

          if (memberships && memberships.length > 0) {
            const firstFarm = memberships[0].farm;
            setActiveFarm(firstFarm);
            await setFarmSetupCompleted(true);
            router.replace('/(main)');
          } else {
            await setFarmSetupCompleted(false);
            router.replace('/(onboarding)/farm-setup');
          }
        } catch {
          if (!isMounted) return;
          router.replace('/(onboarding)/farm-setup');
        }
      } else {
        router.replace('/(auth)/welcome');
      }
    }

    routeUser();

    return () => {
      isMounted = false;
    };
  }, [status, setActiveFarm, setFarmSetupCompleted, router]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.centerContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Brand Icon Badge */}
        <View style={styles.iconCircle}>
          <HeartPulse size={44} color={theme.colors.primary[600]} />
        </View>

        <AppText variant="h1" align="center" style={styles.brandTitle}>
          Smart Livestock <AppText variant="h1" align="center" style={styles.brandGreen}>Health</AppText>
        </AppText>

        <AppText variant="caption" align="center" style={styles.brandSubtitle}>
          AI-Powered Farm Management
        </AppText>

        <View style={styles.marathiBadge}>
          <Sprout size={14} color={theme.colors.primary[700]} />
          <AppText variant="caption" weight="semibold" style={styles.marathiText}>
            निरोगी जनावरे, समृद्ध शेतकरी
          </AppText>
        </View>
      </Animated.View>

      <View style={styles.bottomFooter}>
        <ActivityIndicator size="small" color={theme.colors.primary[600]} style={{ marginBottom: 8 }} />
        <AppText variant="caption" align="center" style={styles.footerText}>
          A healthier tomorrow for every farmer
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F4',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  centerContent: {
    alignItems: 'center',
    marginTop: 100,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    ...theme.shadows.md,
  },
  brandTitle: {
    color: theme.colors.neutral[900],
    fontSize: 26,
    marginBottom: 4,
  },
  brandGreen: {
    color: theme.colors.primary[600],
    fontSize: 26,
  },
  brandSubtitle: {
    color: theme.colors.neutral[600],
    fontSize: 14,
    marginBottom: theme.spacing.md,
  },
  marathiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    gap: 6,
  },
  marathiText: {
    color: theme.colors.primary[800],
    fontSize: 12,
  },
  bottomFooter: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  footerText: {
    color: theme.colors.neutral[500],
    fontSize: 12,
  },
});
