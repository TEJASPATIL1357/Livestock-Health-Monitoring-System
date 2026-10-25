import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sparkles, MessageCircleQuestion, Send } from 'lucide-react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { AppHeader } from '../../src/components/AppHeader';
import { AppText } from '../../src/components/AppText';
import { GlassCard } from '../../src/components/GlassCard';
import { StatusBadge } from '../../src/components/StatusBadge';
import { AppInput } from '../../src/components/AppInput';
import { theme } from '../../src/theme/theme';

export default function AIAssistantScreen() {
  const { t } = useTranslation();

  const PROMPTS = [
    t('aiAssistant.prompt1'),
    t('aiAssistant.prompt2'),
    t('aiAssistant.prompt3'),
  ];

  return (
    <ScreenContainer scrollable style={styles.container}>
      <AppHeader title={t('aiAssistant.title')} showBack={false} />

      <View style={styles.content}>
        {/* 3D Mascot Hero Glass Card */}
        <GlassCard variant="glass" padding="lg" style={styles.heroCard}>
          <View style={styles.badgeRow}>
            <StatusBadge status="info" label={t('common.comingSoon')} />
            <View style={styles.sparkleTag}>
              <Sparkles size={14} color="#92400E" />
              <AppText variant="caption" weight="bold" style={styles.sparkleText}>
                {t('aiAssistant.badge')}
              </AppText>
            </View>
          </View>

          <View style={styles.mascotContainer}>
            <Image
              source={require('../../assets/images/ai_robot_mascot.png')}
              style={styles.mascotImg}
              resizeMode="contain"
            />
          </View>

          <AppText variant="h2" align="center" style={styles.title}>
            {t('aiAssistant.title')}
          </AppText>

          <AppText variant="body" align="center" style={styles.desc}>
            {t('aiAssistant.comingSoonDesc')}
          </AppText>
        </GlassCard>

        {/* Suggested Questions Section */}
        <AppText variant="h3" weight="bold" style={styles.sampleTitle}>
          {t('aiAssistant.sampleTitle')}
        </AppText>

        <View style={styles.promptsList}>
          {PROMPTS.map((prompt, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.8}
              onPress={() => {}}
              style={styles.promptTouch}
            >
              <GlassCard variant="tinted" padding="sm" style={styles.promptCard}>
                <View style={styles.promptRow}>
                  <MessageCircleQuestion size={18} color={theme.colors.primary[800]} />
                  <AppText variant="body" weight="medium" style={styles.promptText}>
                    {prompt}
                  </AppText>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chat Prompt Mock Input */}
        <View style={styles.inputContainer}>
          <AppInput
            placeholder={t('aiAssistant.inputPlaceholder')}
            value=""
            onChangeText={() => {}}
            rightIcon={<Send size={20} color={theme.colors.primary[600]} />}
          />
          <AppText variant="caption" align="center" style={styles.disclaimerText}>
            {t('aiAssistant.disclaimer')}
          </AppText>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
  },
  content: {
    marginTop: theme.spacing.xs,
  },
  heroCard: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  sparkleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  sparkleText: {
    color: '#92400E',
    marginLeft: 4,
    fontSize: theme.typography.fontSize.xs,
  },
  mascotContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#86EFAC',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  mascotImg: {
    width: 76,
    height: 76,
  },
  title: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.neutral[900],
  },
  desc: {
    color: theme.colors.neutral[600],
    lineHeight: theme.typography.lineHeight.md,
  },
  sampleTitle: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.neutral[900],
  },
  promptsList: {
    marginBottom: theme.spacing.md,
  },
  promptTouch: {
    marginBottom: theme.spacing.xs,
  },
  promptCard: {
    borderRadius: theme.borderRadius.md,
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.neutral[800],
    flex: 1,
  },
  inputContainer: {
    marginBottom: theme.spacing.xl,
  },
  disclaimerText: {
    color: theme.colors.neutral[500],
    fontSize: 10,
    marginTop: theme.spacing.xs,
  },
});
