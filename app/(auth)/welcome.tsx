import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Globe, HeartPulse, Cpu, ShieldCheck, Activity } from 'lucide-react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { AppText } from '../../src/components/AppText';
import { AppButton } from '../../src/components/AppButton';
import { GlassCard } from '../../src/components/GlassCard';
import { AppIconButton } from '../../src/components/AppIconButton';
import { theme } from '../../src/theme/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <ScreenContainer scrollable style={styles.container}>
      {/* Visual Header Banner */}
      <View style={styles.headerImageContainer}>
        <Image
          source={require('../../assets/images/farming_background.jpg')}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay} />
        <View style={styles.headerTopRow}>
          <View style={styles.brandRow}>
            <View style={styles.smallLogo}>
              <HeartPulse size={20} color={theme.colors.primary[500]} />
            </View>
            <AppText variant="h3" weight="bold" style={styles.brandTitleLight}>
              {t('app.name')}
            </AppText>
          </View>
          <AppIconButton
            icon={<Globe size={20} color="#FFFFFF" />}
            onPress={() => router.push('/(auth)/language')}
            variant="outline"
            accessibilityLabel={t('language.title')}
            style={styles.langBtn}
          />
        </View>

        <View style={styles.heroTextContainer}>
          <View style={styles.aiBadge}>
            <Cpu size={14} color="#FFFFFF" />
            <AppText variant="caption" weight="bold" style={styles.aiBadgeText}>
              {t('welcome.visionBadge')}
            </AppText>
          </View>
          <AppText variant="h1" style={styles.heroTitleLight}>
            {t('welcome.title')}
          </AppText>
        </View>
      </View>

      {/* Hero Section Card */}
      <View style={styles.heroSection}>
        <GlassCard variant="glass" padding="lg" style={styles.heroCard}>
          <AppText variant="body" style={styles.heroSubtitle}>
            {t('welcome.subtitle')}
          </AppText>

          {/* Product Vision Feature Highlights */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <ShieldCheck size={16} color={theme.colors.primary[800]} />
              </View>
              <AppText variant="caption" weight="medium" style={styles.featureText}>
                {t('welcome.feature1')}
              </AppText>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <Activity size={16} color={theme.colors.primary[800]} />
              </View>
              <AppText variant="caption" weight="medium" style={styles.featureText}>
                {t('welcome.feature2')}
              </AppText>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <Cpu size={16} color={theme.colors.primary[800]} />
              </View>
              <AppText variant="caption" weight="medium" style={styles.featureText}>
                {t('welcome.feature3')}
              </AppText>
            </View>
          </View>
        </GlassCard>
      </View>

      {/* Bottom CTAs */}
      <View style={styles.ctaSection}>
        <AppButton
          title={t('welcome.getStarted')}
          onPress={() => router.push('/(auth)/register')}
          variant="primary"
          style={styles.primaryBtn}
        />

        <AppButton
          title={t('welcome.alreadyHaveAccount')}
          onPress={() => router.push('/(auth)/login')}
          variant="ghost"
          style={styles.secondaryBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  headerImageContainer: {
    height: 240,
    width: '100%',
    position: 'relative',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  headerImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 45, 25, 0.65)',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  brandTitleLight: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.md,
  },
  langBtn: {
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  heroTextContainer: {
    marginBottom: theme.spacing.xs,
  },
  heroTitleLight: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.xl,
    lineHeight: theme.typography.lineHeight.xl,
    fontWeight: 'bold',
  },
  heroSection: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: -theme.spacing.xl,
  },
  heroCard: {
    padding: theme.spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 140, 75, 0.85)',
    paddingHorizontal: theme.spacing.sm + 4,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: theme.typography.fontSize.xs,
  },
  heroSubtitle: {
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeight.md,
  },
  featuresList: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    paddingTop: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  featureText: {
    color: theme.colors.neutral[700],
    flex: 1,
  },
  ctaSection: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  primaryBtn: {
    marginBottom: theme.spacing.sm,
  },
  secondaryBtn: {
    marginTop: theme.spacing.xs,
  },
});
