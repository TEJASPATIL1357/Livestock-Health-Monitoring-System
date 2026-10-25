import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, Mail, Lock, Check } from 'lucide-react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { AppHeader } from '../../src/components/AppHeader';
import { AppText } from '../../src/components/AppText';
import { AppInput } from '../../src/components/AppInput';
import { AppButton } from '../../src/components/AppButton';
import { AppCard } from '../../src/components/AppCard';
import { AuthService } from '../../src/services/authService';
import { useAuthStore } from '../../src/store/useAuthStore';
import { PublicUserRole } from '../../src/types';
import { getAuthErrorMessageKey } from '../../src/utils/errorMapper';
import { theme } from '../../src/theme/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<PublicUserRole>('FARM_OWNER');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const ROLES: { id: PublicUserRole; labelKey: string }[] = [
    { id: 'FARM_OWNER', labelKey: 'auth.roleOwner' },
    { id: 'FARM_MANAGER', labelKey: 'auth.roleManager' },
    { id: 'VETERINARIAN', labelKey: 'auth.roleVet' },
    { id: 'FARMER', labelKey: 'auth.roleFarmer' },
  ];

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = t('auth.nameRequired');
    }

    if (!emailOrPhone.trim()) {
      errs.emailOrPhone = t('auth.invalidEmail');
    }

    if (!password || password.length < 6) {
      errs.password = t('auth.invalidPassword');
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = t('auth.passwordsDoNotMatch');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await AuthService.register({
        fullName,
        emailOrPhone,
        password,
        role,
      });
      
      // Auto login user or navigate to login
      try {
        const authData = await AuthService.login({ identifier: emailOrPhone, password });
        setAuth(authData.user);
        router.replace('/(main)');
      } catch {
        router.replace('/(auth)/login');
      }
    } catch (err: unknown) {
      const key = getAuthErrorMessageKey(err);
      setErrors({ global: t(key) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      <AppHeader
        title={t('auth.registerTitle')}
        subtitle={t('auth.registerSubtitle')}
        showBack
      />

      <View style={styles.form}>
        <AppInput
          label={t('auth.nameLabel')}
          placeholder={t('auth.namePlaceholder')}
          value={fullName}
          onChangeText={setFullName}
          error={errors.fullName}
          leftIcon={<UserIcon size={20} color={theme.colors.neutral[500]} />}
        />

        <AppInput
          label={t('auth.emailLabel')}
          placeholder={t('auth.emailPlaceholder')}
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          error={errors.emailOrPhone}
          leftIcon={<Mail size={20} color={theme.colors.neutral[500]} />}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Role Selection */}
        <AppText variant="label" style={styles.roleLabel}>
          {t('auth.roleLabel')}
        </AppText>

        <View style={styles.roleGrid}>
          {ROLES.map((r) => {
            const isSelected = role === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                onPress={() => setRole(r.id)}
                activeOpacity={0.8}
                style={styles.roleTouch}
              >
                <AppCard
                  variant={isSelected ? 'elevated' : 'outlined'}
                  padding="sm"
                  style={[
                    styles.roleCard,
                    isSelected && styles.roleCardSelected,
                  ]}
                >
                  <View style={styles.roleRow}>
                    <AppText
                      variant="caption"
                      weight="semibold"
                      style={[
                        styles.roleText,
                        isSelected && styles.roleTextSelected,
                      ]}
                    >
                      {t(r.labelKey)}
                    </AppText>
                    {isSelected && (
                      <Check size={16} color={theme.colors.primary[800]} />
                    )}
                  </View>
                </AppCard>
              </TouchableOpacity>
            );
          })}
        </View>

        <AppInput
          label={t('auth.passwordLabel')}
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          isPassword
          leftIcon={<Lock size={20} color={theme.colors.neutral[500]} />}
        />

        <AppInput
          label={t('auth.confirmPasswordLabel')}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={errors.confirmPassword}
          isPassword
          leftIcon={<Lock size={20} color={theme.colors.neutral[500]} />}
        />

        {errors.global && (
          <AppText variant="caption" style={styles.globalError}>
            {errors.global}
          </AppText>
        )}

        <AppButton
          title={t('auth.registerBtn')}
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.submitBtn}
        />
      </View>

      <View style={styles.footerRow}>
        <AppText variant="body" color="600">
          {t('auth.hasAccount')}{' '}
        </AppText>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')} accessibilityRole="button">
          <AppText variant="body" weight="bold" style={styles.loginLink}>
            {t('auth.loginBtn')}
          </AppText>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
  },
  form: {
    marginTop: theme.spacing.sm,
  },
  roleLabel: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.neutral[700],
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  roleTouch: {
    width: '48%',
    marginBottom: theme.spacing.xs,
  },
  roleCard: {
    borderRadius: theme.borderRadius.md,
  },
  roleCardSelected: {
    borderColor: theme.colors.primary[800],
    backgroundColor: theme.colors.primary[50],
    borderWidth: 1.5,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleText: {
    color: theme.colors.neutral[700],
  },
  roleTextSelected: {
    color: theme.colors.primary[800],
  },
  globalError: {
    color: theme.colors.status.error,
    marginBottom: theme.spacing.md,
  },
  submitBtn: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  loginLink: {
    color: theme.colors.primary[800],
  },
});
