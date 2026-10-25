import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, CircleDashed, Clock } from 'lucide-react-native';
import { AppText } from './AppText';
import { theme } from '../theme/theme';

export interface StatusBadgeProps {
  status: 'healthy' | 'warning' | 'critical' | 'info' | 'noData' | 'awaitingTelemetry';
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'warning':
        return {
          bg: theme.colors.status.warningBg,
          text: theme.colors.status.warning,
          icon: <AlertTriangle size={14} color={theme.colors.status.warning} />,
        };
      case 'critical':
        return {
          bg: theme.colors.status.errorBg,
          text: theme.colors.status.error,
          icon: <AlertOctagon size={14} color={theme.colors.status.error} />,
        };
      case 'info':
        return {
          bg: theme.colors.status.infoBg,
          text: theme.colors.status.info,
          icon: <Info size={14} color={theme.colors.status.info} />,
        };
      case 'noData':
        return {
          bg: theme.colors.neutral[100],
          text: theme.colors.neutral[600],
          icon: <CircleDashed size={14} color={theme.colors.neutral[600]} />,
        };
      case 'awaitingTelemetry':
        return {
          bg: theme.colors.status.infoBg,
          text: theme.colors.status.info,
          icon: <Clock size={14} color={theme.colors.status.info} />,
        };
      case 'healthy':
      default:
        return {
          bg: theme.colors.status.successBg,
          text: theme.colors.status.success,
          icon: <CheckCircle2 size={14} color={theme.colors.status.success} />,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={styles.iconMargin}>{config.icon}</View>
      <AppText
        variant="caption"
        weight="semibold"
        style={{ color: config.text }}
      >
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  iconMargin: {
    marginRight: 4,
  },
});
