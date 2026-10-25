import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export interface AppCardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: keyof typeof theme.spacing | 'none';
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  style,
  ...props
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'outlined':
        return styles.outlined;
      case 'flat':
        return styles.flat;
      case 'elevated':
      default:
        return styles.elevated;
    }
  };

  const cardPadding = padding === 'none' ? 0 : theme.spacing[padding];

  return (
    <View
      style={[
        styles.card,
        getCardStyle(),
        { padding: cardPadding },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
  },
  elevated: {
    ...theme.shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  flat: {
    backgroundColor: theme.colors.neutral[100],
  },
});
