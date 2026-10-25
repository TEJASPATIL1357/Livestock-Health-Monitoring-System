import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export interface AppIconButtonProps extends TouchableOpacityProps {
  icon: React.ReactNode;
  variant?: 'flat' | 'outline' | 'ghost';
  size?: number;
}

export const AppIconButton: React.FC<AppIconButtonProps> = ({
  icon,
  variant = 'flat',
  size = 48,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        variant === 'flat' && styles.flat,
        style,
      ]}
      {...props}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: theme.touchTarget.minWidth,
    minHeight: theme.touchTarget.minHeight,
  },
  flat: {
    backgroundColor: theme.colors.neutral[100],
  },
  outline: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.surface.card,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
});
