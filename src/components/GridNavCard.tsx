import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { AppText } from './AppText';
import { theme } from '../theme/theme';

interface GridNavCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
  onPress: () => void;
}

export const GridNavCard: React.FC<GridNavCardProps> = ({
  title,
  subtitle,
  icon,
  iconBgColor,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardInner}>
        <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
          {icon}
        </View>
        <AppText variant="label" weight="bold" style={styles.titleText}>
          {title}
        </AppText>
        <AppText variant="caption" style={styles.subtitleText} numberOfLines={1}>
          {subtitle}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '31%', // 3 column grid with gaps
    marginBottom: theme.spacing.sm,
  },
  cardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.sm + 2,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    minHeight: 110,
    ...theme.shadows.sm,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs + 2,
  },
  titleText: {
    color: theme.colors.neutral[900],
    fontSize: 13,
    marginBottom: 2,
  },
  subtitleText: {
    color: theme.colors.neutral[500],
    fontSize: 10,
  },
});
