import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
import { GlassCard } from './GlassCard';
import { theme } from '../theme/theme';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionTitle,
  onAction,
}) => {
  return (
    <GlassCard variant="glass" padding="lg" style={styles.cardStyle}>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          {icon || <Inbox size={36} color={theme.colors.primary[800]} />}
        </View>

        <AppText variant="h2" align="center" style={styles.title}>
          {title}
        </AppText>

        <AppText variant="body" align="center" style={styles.description}>
          {description}
        </AppText>

        {actionTitle && onAction && (
          <AppButton
            title={actionTitle}
            onPress={onAction}
            variant="primary"
            fullWidth={false}
            style={styles.actionBtn}
          />
        )}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    marginVertical: theme.spacing.md,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: '#86EFAC',
    ...theme.shadows.sm,
  },
  title: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.neutral[900],
    fontSize: 18,
  },
  description: {
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.lg,
    maxWidth: 290,
    lineHeight: 20,
  },
  actionBtn: {
    minWidth: 180,
    borderRadius: theme.borderRadius.full,
  },
});
