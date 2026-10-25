import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Phone, Globe, ArrowRight } from 'lucide-react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { AppText } from '../../src/components/AppText';
import { AppInput } from '../../src/components/AppInput';
import { GlassButton } from '../../src/components/GlassButton';
import { GlassCard } from '../../src/components/GlassCard';
import { ErrorState } from '../../src/components/ErrorState';
import { AuthService } from '../../src/services/authService';
import { FarmService } from '../../src/services/farmService';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useAppStore } from '../../src/store/useAppStore';
import { getAuthErrorMessageKey } from '../../src/utils/errorMapper';
import { theme } from '../../src/theme/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setActiveFarm = useAppStore((state) => state.setActiveFarm);
  const setFarmSetupCompleted = useAppStore((state) => state.setFarmSetupCompleted);

  const [loginMode, setLoginMode] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiErrorKey, setApiErrorKey] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: { identifier?: string; password?: string } = {};

    if (!identifier.trim()) {
      newErrors.identifier = t('auth.invalidEmail');
    }

    if (!password || password.length < 6) {
      newErrors.password = t('auth.invalidPassword');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiErrorKey(null);

    try {
      const response = await AuthService.login({ identifier, password });
      setAuth(response.user);

      try {
        const memberships = await FarmService.getMyFarms();
        if (memberships && memberships.length > 0) {
          const firstFarm = memberships[0].farm;
          setActiveFarm(firstFarm);
          await setFarmSetupCompleted(true);
          router.replace('/(main)');
        } else {
          setActiveFarm(null);
          await setFarmSetupCompleted(false);
          router.replace('/(onboarding)/farm-setup');
        }
      } catch {
        setActiveFarm(null);
        await setFarmSetupCompleted(false);
        router.replace('/(onboarding)/farm-setup');
      }
    } catch (err: unknown) {
      const key = getAuthErrorMessageKey(err);
      setApiErrorKey(key);
    } finally {
      setLoading(false);
    }
  };

  const getLangName = () => {
    if (i18n.language === 'mr') return 'मराठी';
    if (i18n.language === 'hi') return 'हिंदी';
    return 'English';
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      {/* Top Header Row with Back and Language Switcher */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <ArrowRight size={18} color={theme.colors.neutral[800]} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.langPill}
          onPress={() => router.push('/(auth)/language')}
          activeOpacity={0.8}
        >
          <Globe size={14} color={theme.colors.primary[700]} />
          <AppText variant="caption" weight="semibold" style={styles.langText}>
            {getLangName()}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Hero Welcome Banner with Rural Farmer Aesthetic */}
      <GlassCard variant="tinted" padding="lg" style={styles.heroCard}>
        <View style={styles.heroContentRow}>
          <View style={styles.heroTextCol}>
            <AppText variant="caption" weight="bold" style={styles.heroTag}>
              🌾 शेतकरी सुखी तर देश समृद्ध
            </AppText>
            <AppText variant="h1" style={styles.welcomeTitle}>
              {t('auth.loginTitle')}
            </AppText>
            <AppText variant="caption" style={styles.welcomeSub}>
              {t('auth.loginSubtitle')}
            </AppText>
          </View>

          <View style={styles.farmerGraphicCircle}>
            <AppText variant="display">👨‍🌾</AppText>
          </View>
        </View>
      </GlassCard>

      {/* API Error Alert */}
      {apiErrorKey && (
        <ErrorState
          title={t('auth.loginTitle')}
          message={t(apiErrorKey)}
          onRetry={handleLogin}
          retryText={t('common.retry')}
        />
      )}

      {/* Email / Phone Mode Segmented Tabs */}
      <View style={styles.segmentedContainer}>
        <TouchableOpacity
          style={[styles.segmentTab, loginMode === 'email' && styles.segmentTabActive]}
          onPress={() => setLoginMode('email')}
        >
          <AppText
            variant="label"
            weight="bold"
            style={[styles.segmentText, loginMode === 'email' && styles.segmentTextActive]}
          >
            {t('auth.emailTab')}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentTab, loginMode === 'phone' && styles.segmentTabActive]}
          onPress={() => setLoginMode('phone')}
        >
          <AppText
            variant="label"
            weight="bold"
            style={[styles.segmentText, loginMode === 'phone' && styles.segmentTextActive]}
          >
            {t('auth.phoneTab')}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Login Form */}
      <View style={styles.form}>
        <AppInput
          label={loginMode === 'email' ? t('auth.emailLabel') : t('auth.mobileNumberLabel')}
          placeholder={loginMode === 'email' ? t('auth.emailPlaceholder') : '+91 9876543210'}
          value={identifier}
          onChangeText={setIdentifier}
          error={errors.identifier}
          leftIcon={
            loginMode === 'email' ? (
              <Mail size={18} color={theme.colors.neutral[500]} />
            ) : (
              <Phone size={18} color={theme.colors.neutral[500]} />
            )
          }
          keyboardType={loginMode === 'email' ? 'email-address' : 'phone-pad'}
          autoCapitalize="none"
        />

        <AppInput
          label={t('auth.passwordLabel')}
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          isPassword
          leftIcon={<Lock size={18} color={theme.colors.neutral[500]} />}
        />

        <View style={styles.optionsRow}>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotBtn}
            accessibilityRole="button"
          >
            <AppText variant="caption" weight="semibold" style={styles.forgotText}>
              {t('auth.forgotPasswordLink')}
            </AppText>
          </TouchableOpacity>
        </View>

        <GlassButton
          title={t('auth.loginBtn')}
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          icon={<ArrowRight size={18} color="#FFFFFF" />}
          style={styles.submitBtn}
        />
      </View>

      {/* Footer link */}
      <View style={styles.footerRow}>
        <AppText variant="body" color="600">
          {t('auth.newToApp')}{' '}
        </AppText>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')} accessibilityRole="button">
          <AppText variant="body" weight="bold" style={styles.registerLink}>
            {t('auth.createAccountLink')}
          </AppText>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    ...theme.shadows.sm,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    gap: 6,
    ...theme.shadows.sm,
  },
  langText: {
    color: theme.colors.primary[800],
    fontSize: 12,
  },
  heroCard: {
    marginBottom: theme.spacing.md,
  },
  heroContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextCol: {
    flex: 1,
  },
  heroTag: {
    color: theme.colors.primary[700],
    marginBottom: 2,
    fontSize: 11,
  },
  welcomeTitle: {
    color: theme.colors.neutral[900],
    fontSize: 22,
  },
  welcomeSub: {
    color: theme.colors.neutral[600],
    fontSize: 12,
  },
  farmerGraphicCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginLeft: theme.spacing.sm,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.full,
    padding: 4,
    marginBottom: theme.spacing.md,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
    ...theme.shadows.sm,
  },
  segmentText: {
    color: theme.colors.neutral[600],
    fontSize: 13,
  },
  segmentTextActive: {
    color: theme.colors.primary[800],
  },
  form: {
    marginTop: theme.spacing.xs,
  },
  optionsRow: {
    alignItems: 'flex-end',
    marginBottom: theme.spacing.lg,
    marginTop: -theme.spacing.xs,
  },
  forgotBtn: {
    paddingVertical: 4,
  },
  forgotText: {
    color: theme.colors.primary[700],
  },
  submitBtn: {
    marginBottom: theme.spacing.lg,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  registerLink: {
    color: theme.colors.primary[700],
  },
});
