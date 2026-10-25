import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export interface AppTextProps extends TextProps {
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: keyof typeof theme.colors.neutral | string;
  align?: 'left' | 'center' | 'right';
  weight?: keyof typeof theme.typography.fontWeight;
}

export const AppText: React.FC<AppTextProps> = ({
  children,
  variant = 'body',
  color,
  align = 'left',
  weight,
  style,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'display':
        return styles.display;
      case 'h1':
        return styles.h1;
      case 'h2':
        return styles.h2;
      case 'h3':
        return styles.h3;
      case 'caption':
        return styles.caption;
      case 'label':
        return styles.label;
      case 'body':
      default:
        return styles.body;
    }
  };

  const getTextColor = (): string => {
    if (!color) return theme.colors.neutral[900];
    const keyStr = String(color);
    if (keyStr in theme.colors.neutral) {
      return String((theme.colors.neutral as Record<string, string>)[keyStr]);
    }
    return String(color);
  };

  return (
    <Text
      style={[
        getVariantStyle(),
        { color: getTextColor(), textAlign: align },
        weight && { fontWeight: theme.typography.fontWeight[weight] },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  display: {
    fontSize: theme.typography.fontSize.display,
    lineHeight: theme.typography.lineHeight.display,
    fontWeight: theme.typography.fontWeight.bold,
  },
  h1: {
    fontSize: theme.typography.fontSize.xxl,
    lineHeight: theme.typography.lineHeight.xxl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  h2: {
    fontSize: theme.typography.fontSize.xl,
    lineHeight: theme.typography.lineHeight.xl,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  h3: {
    fontSize: theme.typography.fontSize.lg,
    lineHeight: theme.typography.lineHeight.lg,
    fontWeight: theme.typography.fontWeight.medium,
  },
  body: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.lineHeight.md,
    fontWeight: theme.typography.fontWeight.regular,
  },
  caption: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.sm,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.neutral[600],
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
