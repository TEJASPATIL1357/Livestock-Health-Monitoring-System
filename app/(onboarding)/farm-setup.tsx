import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Home as HomeIcon, MapPin, Check } from 'lucide-react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { AppHeader } from '../../src/components/AppHeader';
import { AppText } from '../../src/components/AppText';
import { AppInput } from '../../src/components/AppInput';
import { AppButton } from '../../src/components/AppButton';
import { AppCard } from '../../src/components/AppCard';
import { useAppStore } from '../../src/store/useAppStore';
import { theme } from '../../src/theme/theme';

import { FarmService } from '../../src/services/farmService';
import { getAuthErrorMessageKey } from '../../src/utils/errorMapper';

export default function FarmSetupScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setFarmSetupCompleted, setActiveFarm } = useAppStore();

  const [farmName, setFarmName] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [country] = useState('India');
  const [livestockType, setLivestockType] = useState<'DAIRY' | 'BEEF' | 'MIXED'>('DAIRY');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const TYPES: { id: 'DAIRY' | 'BEEF' | 'MIXED'; labelKey: string }[] = [
    { id: 'DAIRY', labelKey: 'farm.typeDairy' },
    { id: 'BEEF', labelKey: 'farm.typeBeef' },
    { id: 'MIXED', labelKey: 'farm.typeMixed' },
  ];

  const handleSaveFarm = async () => {
    if (!farmName.trim()) {
      setErrors({ farmName: t('auth.nameRequired') || 'Farm name is required' });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const realFarm = await FarmService.createFarm({
        name: farmName.trim(),
        district: district.trim() || undefined,
        state: state.trim() || undefined,
        country: country.trim() || 'India',
        livestockType,
      });

      setActiveFarm(realFarm);
      await setFarmSetupCompleted(true);
      router.replace('/(main)');
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
        title={t('farm.setupTitle')}
        subtitle={t('farm.setupSubtitle')}
        showBack={false}
      />

      <View style={styles.form}>
        <AppInput
          label={t('farm.nameLabel')}
          placeholder={t('farm.namePlaceholder')}
          value={farmName}
          onChangeText={setFarmName}
          error={errors.farmName}
          leftIcon={<HomeIcon size={20} color={theme.colors.neutral[500]} />}
        />

        <AppInput
          label={t('farm.districtLabel') || 'District'}
          placeholder={t('farm.districtPlaceholder') || 'e.g. Kolhapur'}
          value={district}
          onChangeText={setDistrict}
          leftIcon={<MapPin size={20} color={theme.colors.neutral[500]} />}
        />

        <AppInput
          label={t('farm.stateLabel') || 'State'}
          placeholder={t('farm.statePlaceholder') || 'e.g. Maharashtra'}
          value={state}
          onChangeText={setState}
          leftIcon={<MapPin size={20} color={theme.colors.neutral[500]} />}
        />

        <AppText variant="label" style={styles.typeLabel}>
          {t('farm.livestockTypeLabel')}
        </AppText>

        <View style={styles.typeGrid}>
          {TYPES.map((tItem) => {
            const isSelected = livestockType === tItem.id;
            return (
              <TouchableOpacity
                key={tItem.id}
                onPress={() => setLivestockType(tItem.id)}
                activeOpacity={0.8}
                style={styles.typeTouch}
              >
                <AppCard
                  variant={isSelected ? 'elevated' : 'outlined'}
                  padding="sm"
                  style={[
                    styles.typeCard,
                    isSelected && styles.typeCardSelected,
                  ]}
                >
                  <View style={styles.typeRow}>
                    <AppText
                      variant="caption"
                      weight="semibold"
                      style={[
                        styles.typeText,
                        isSelected && styles.typeTextSelected,
                      ]}
                    >
                      {t(tItem.labelKey)}
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

        {errors.global && (
          <AppText variant="caption" style={styles.globalError}>
            {errors.global}
          </AppText>
        )}

        <AppButton
          title={t('farm.setupBtn')}
          onPress={handleSaveFarm}
          loading={loading}
          disabled={loading}
          style={styles.submitBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
  },
  form: {
    marginTop: theme.spacing.md,
  },
  typeLabel: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.neutral[700],
  },
  typeGrid: {
    marginBottom: theme.spacing.lg,
  },
  typeTouch: {
    marginBottom: theme.spacing.xs,
  },
  typeCard: {
    borderRadius: theme.borderRadius.md,
  },
  typeCardSelected: {
    borderColor: theme.colors.primary[800],
    backgroundColor: theme.colors.primary[50],
    borderWidth: 1.5,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeText: {
    color: theme.colors.neutral[700],
  },
  typeTextSelected: {
    color: theme.colors.primary[800],
  },
  submitBtn: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  globalError: {
    color: theme.colors.status.error,
    marginBottom: theme.spacing.md,
  },
});
