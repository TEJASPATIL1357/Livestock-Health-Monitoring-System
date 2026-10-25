import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { AppText } from './AppText';
import { theme } from '../theme/theme';

export interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
  ...props
}) => {
  const isInteractive = !disabled && !loading;

  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'ghost':
        return styles.ghost;
      case 'danger':
        return styles.danger;
      case 'primary':
      default:
        return styles.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.neutral[400];
    switch (variant) {
      case 'secondary':
        return theme.colors.primary[800];
      case 'outline':
        return theme.colors.primary[800];
      case 'ghost':
        return theme.colors.primary[800];
      case 'danger':
        return '#FFFFFF';
      case 'primary':
      default:
        return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={[
        styles.base,
        getContainerStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.iconMarginRight}>{leftIcon}</View>}
          <AppText
            variant="body"
            weight="semibold"
            style={{ color: getTextColor() }}
          >
            {title}
          </AppText>
          {rightIcon && <View style={styles.iconMarginLeft}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: theme.touchTarget.minHeight,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md - 2,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMarginRight: {
    marginRight: theme.spacing.sm,
  },
  iconMarginLeft: {
    marginLeft: theme.spacing.sm,
  },
  primary: {
    backgroundColor: theme.colors.primary[800], // Nature Forest Green
    ...theme.shadows.sm,
  },
  secondary: {
    backgroundColor: theme.colors.primary[100],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary[800],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: theme.colors.status.error,
  },
  disabled: {
    backgroundColor: theme.colors.surface.disabled,
    borderColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
});
