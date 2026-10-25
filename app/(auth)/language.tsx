import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Globe } from 'lucide-react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { AppHeader } from '../../src/components/AppHeader';
import { AppText } from '../../src/components/AppText';
import { AppCard } from '../../src/components/AppCard';
import { AppButton } from '../../src/components/AppButton';
import { useAppStore } from '../../src/store/useAppStore';
import { LanguageCode } from '../../src/types';
import { theme } from '../../src/theme/theme';

export default function LanguageScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, setLanguage } = useAppStore();

  const LANGUAGES: { code: LanguageCode; nativeName: string; englishName: string; region: string }[] = [
    {
      code: 'en',
      nativeName: 'English',
      englishName: 'English',
      region: 'International / Standard',
    },
    {
      code: 'hi',
      nativeName: 'हिंदी',
      englishName: 'Hindi',
      region: 'भारत (North / Central India)',
    },
    {
      code: 'mr',
      nativeName: 'मराठी',
      englishName: 'Marathi',
      region: 'महाराष्ट्र (Maharashtra)',
    },
  ];

  const handleSelectLanguage = async (code: LanguageCode) => {
    await setLanguage(code);
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      <AppHeader
        title={t('language.title')}
        subtitle={t('language.subtitle')}
        showBack
      />

      <View style={styles.listContainer}>
        {LANGUAGES.map((item) => {
          const isSelected = language === item.code;
          return (
            <TouchableOpacity
              key={item.code}
              activeOpacity={0.8}
              onPress={() => handleSelectLanguage(item.code)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              style={styles.touchableCard}
            >
              <AppCard
                variant={isSelected ? 'elevated' : 'outlined'}
                padding="md"
                style={[
                  styles.card,
                  isSelected && styles.selectedCard,
                ]}
              >
                <View style={styles.cardRow}>
                  <View style={styles.leftGroup}>
                    <View
                      style={[
                        styles.iconContainer,
                        isSelected && styles.selectedIconContainer,
                      ]}
                    >
                      <Globe
                        size={24}
                        color={
                          isSelected
                            ? theme.colors.primary[800]
                            : theme.colors.neutral[500]
                        }
                      />
                    </View>
                    <View style={styles.textContainer}>
                      <AppText variant="h2" weight="bold">
                        {item.nativeName}
                      </AppText>
                      <AppText variant="caption" style={styles.regionText}>
                        {item.englishName} • {item.region}
                      </AppText>
                    </View>
                  </View>

                  {isSelected && (
                    <CheckCircle2
                      size={24}
                      color={theme.colors.primary[500]}
                    />
                  )}
                </View>
              </AppCard>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <AppButton
          title={t('common.continue')}
          onPress={() => router.back()}
          variant="primary"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
  },
  listContainer: {
    marginTop: theme.spacing.md,
  },
  touchableCard: {
    marginBottom: theme.spacing.md,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
  },
  selectedCard: {
    borderColor: theme.colors.primary[800],
    borderWidth: 2,
    backgroundColor: theme.colors.primary[50],
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  selectedIconContainer: {
    backgroundColor: theme.colors.primary[200],
  },
  textContainer: {
    flex: 1,
  },
  regionText: {
    marginTop: 2,
    color: theme.colors.neutral[600],
  },
  footer: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
});
