import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

export interface DividerProps {
  marginVertical?: keyof typeof theme.spacing | 'none';
  color?: string;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  marginVertical = 'md',
  color = theme.colors.neutral[200],
  style,
}) => {
  const margin = marginVertical === 'none' ? 0 : theme.spacing[marginVertical];

  return (
    <View
      style={[
        styles.divider,
        {
          marginVertical: margin,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});
