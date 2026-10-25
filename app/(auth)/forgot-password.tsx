import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Mail, CheckCircle2 } from 'lucide-react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { AppHeader } from '../../src/components/AppHeader';
import { AppText } from '../../src/components/AppText';
import { AppInput } from '../../src/components/AppInput';
import { AppButton } from '../../src/components/AppButton';
import { AppCard } from '../../src/components/AppCard';
import { AuthService } from '../../src/services/authService';
import { theme } from '../../src/theme/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!emailOrPhone.trim()) {
      setError(t('auth.invalidEmail'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      await AuthService.forgotPassword(emailOrPhone);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      <AppHeader
        title={t('auth.forgotPasswordTitle')}
        subtitle={t('auth.forgotPasswordSubtitle')}
        showBack
      />

      <View style={styles.content}>
        {sent ? (
          <AppCard variant="elevated" padding="lg" style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <CheckCircle2 size={48} color={theme.colors.status.success} />
            </View>
            <AppText variant="h2" align="center" style={styles.successTitle}>
              Check Your Inbox
            </AppText>
            <AppText variant="body" align="center" style={styles.successDesc}>
              Instructions to reset your password have been sent to{' '}
              <AppText weight="semibold">{emailOrPhone}</AppText>.
            </AppText>

            <AppButton
              title={t('auth.loginBtn')}
              onPress={() => router.replace('/(auth)/login')}
              variant="primary"
              style={styles.backLoginBtn}
            />
          </AppCard>
        ) : (
          <View style={styles.form}>
            <AppInput
              label={t('auth.emailLabel')}
              placeholder={t('auth.emailPlaceholder')}
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              error={error}
              leftIcon={<Mail size={20} color={theme.colors.neutral[500]} />}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AppButton
              title={t('auth.resetPasswordBtn')}
              onPress={handleReset}
              loading={loading}
              disabled={loading}
              style={styles.submitBtn}
            />
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
  },
  content: {
    marginTop: theme.spacing.lg,
  },
  form: {
    width: '100%',
  },
  submitBtn: {
    marginTop: theme.spacing.md,
  },
  successCard: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.status.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  successTitle: {
    marginBottom: theme.spacing.xs,
  },
  successDesc: {
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.lg,
  },
  backLoginBtn: {
    width: '100%',
  },
});
