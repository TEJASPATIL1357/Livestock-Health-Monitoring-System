import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
import { theme } from '../theme/theme';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Please check your connection and try again.',
  onRetry,
  retryText = 'Try Again',
}) => {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <View style={styles.iconCircle} importantForAccessibility="no-hide-descendants">
        <AlertCircle size={32} color={theme.colors.status.error} />
      </View>
      <AppText variant="h2" align="center" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="body" align="center" style={styles.message}>
        {message}
      </AppText>
      {onRetry && (
        <AppButton
          title={retryText}
          onPress={onRetry}
          variant="outline"
          fullWidth={false}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
    marginVertical: theme.spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.status.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.neutral[900],
  },
  message: {
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.lg,
  },
  button: {
    minWidth: 160,
  },
});
