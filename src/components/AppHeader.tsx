import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { AppText } from './AppText';
import { AppIconButton } from './AppIconButton';
import { theme } from '../theme/theme';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBackPress,
  rightAction,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {showBack ? (
          <AppIconButton
            icon={<ArrowLeft size={22} color={theme.colors.neutral[800]} />}
            onPress={handleBack}
            variant="ghost"
            accessibilityLabel="Go back"
          />
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.titleContainer}>
          <AppText variant="h2" align="center" weight="semibold">
            {title}
          </AppText>
        </View>

        {rightAction ? (
          <View style={styles.rightActionWrapper}>{rightAction}</View>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {subtitle && (
        <AppText variant="caption" align="center" style={styles.subtitle}>
          {subtitle}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'transparent',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.neutral[600],
  },
  rightActionWrapper: {
    minWidth: 48,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 48,
  },
});
