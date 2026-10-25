import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Activity, ShieldCheck, Sparkles, Heart } from 'lucide-react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { AppText } from '../../src/components/AppText';
import { GlassCard } from '../../src/components/GlassCard';
import { useAppStore } from '../../src/store/useAppStore';
import { theme } from '../../src/theme/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const setOnboardingCompleted = useAppStore((state) => state.setOnboardingCompleted);

  const [currentStep, setCurrentStep] = useState(0);

  const STEPS = [
    {
      badge: '🌾 Smart साथीदार',
      title: 'Smarter Insights, Healthier Livestock',
      subtitle: 'Monitor your animals\' health with AI-powered insights and real-time recommendations.',
      icon: <Activity size={44} color={theme.colors.primary[600]} />,
      cardPills: ['Health Monitoring', 'Productivity'],
    },
    {
      badge: '📊 डेटावर आधारित निर्णय',
      title: 'Manage with Confidence',
      subtitle: 'Track health, milk production, breeding, and more — all in one place.',
      icon: <ShieldCheck size={44} color={theme.colors.primary[600]} />,
      cardPills: ['Better Data', 'Happier Farms'],
    },
    {
      badge: '🤖 AI मित्र तयार',
      title: 'Your Farm AI Assistant',
      subtitle: 'Ask questions in Marathi, Hindi, or English about cattle symptoms and care.',
      icon: <Sparkles size={44} color={theme.colors.primary[600]} />,
      cardPills: ['Instant Answers', 'Local Language'],
    },
  ];

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await setOnboardingCompleted(true);
      router.replace('/(auth)/register');
    }
  };

  const handleSkip = async () => {
    await setOnboardingCompleted(true);
    router.replace('/(auth)/register');
  };

  const step = STEPS[currentStep];

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      {/* Top Header Row with Skip Button */}
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <AppText variant="h3" weight="bold" style={styles.brandText}>
            Smart Livestock <AppText variant="h3" weight="bold" style={{ color: theme.colors.primary[600] }}>Health</AppText>
          </AppText>
        </View>

        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} hitSlop={12}>
          <AppText variant="caption" weight="semibold" style={styles.skipText}>
            Skip
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Center Slide Container */}
      <View style={styles.centerContainer}>
        {/* Visual Card */}
        <GlassCard variant="glass" padding="lg" style={styles.visualCard}>
          <View style={styles.badgeRow}>
            <View style={styles.badgePill}>
              <AppText variant="caption" weight="semibold" style={styles.badgePillText}>
                {step.badge}
              </AppText>
            </View>
          </View>

          <View style={styles.illustrationCenter}>
            <View style={styles.iconRing}>
              {step.icon}
            </View>
            <View style={styles.floatingPillsContainer}>
              {step.cardPills.map((pill, idx) => (
                <View key={idx} style={styles.floatingPill}>
                  <Heart size={12} color={theme.colors.primary[600]} />
                  <AppText variant="caption" weight="bold" style={styles.floatingPillText}>
                    {pill}
                  </AppText>
                </View>
              ))}
            </View>
          </View>

          <AppText variant="h1" align="center" style={styles.stepTitle}>
            {step.title}
          </AppText>

          <AppText variant="body" align="center" style={styles.stepSubtitle}>
            {step.subtitle}
          </AppText>
        </GlassCard>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControlsRow}>
        {/* Pagination Dots */}
        <View style={styles.paginationRow}>
          {STEPS.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentStep ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Next / Finish Button */}
        <TouchableOpacity
          style={styles.nextArrowBtn}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <ArrowRight size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    color: theme.colors.neutral[900],
    fontSize: 16,
  },
  skipBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    ...theme.shadows.sm,
  },
  skipText: {
    color: theme.colors.neutral[600],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  visualCard: {
    alignItems: 'center',
  },
  badgeRow: {
    marginBottom: theme.spacing.md,
  },
  badgePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  badgePillText: {
    color: theme.colors.primary[800],
    fontSize: 12,
  },
  illustrationCenter: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#86EFAC',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  floatingPillsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  floatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    gap: 4,
    ...theme.shadows.sm,
  },
  floatingPillText: {
    fontSize: 10,
    color: theme.colors.neutral[800],
  },
  stepTitle: {
    fontSize: 22,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.sm,
  },
  stepSubtitle: {
    color: theme.colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: theme.spacing.sm,
  },
  bottomControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.colors.primary[500],
  },
  dotInactive: {
    width: 8,
    backgroundColor: theme.colors.neutral[300],
  },
  nextArrowBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
});
