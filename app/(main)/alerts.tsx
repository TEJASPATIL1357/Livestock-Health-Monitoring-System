import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, CircleDashed, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { AppHeader } from '../../src/components/AppHeader';
import { AppText } from '../../src/components/AppText';
import { GlassCard } from '../../src/components/GlassCard';
import { EmptyState } from '../../src/components/EmptyState';
import { useAppStore } from '../../src/store/useAppStore';
import { useAlertsQuery } from '../../src/hooks/useLivestockTelemetry';
import { AlertService } from '../../src/services/alertService';
import { useQueryClient } from '@tanstack/react-query';
import { theme } from '../../src/theme/theme';
import { AlertItem } from '../../src/types';

export default function AlertsScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'ALL' | 'URGENT'>('ALL');
  const activeFarm = useAppStore((state) => state.activeFarm);

  const { data: alerts = [], isLoading } = useAlertsQuery(activeFarm?.id);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'URGENT') return alert.severity === 'CRITICAL' || alert.severity === 'WARNING';
    return true;
  });

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await AlertService.markAsRead(alertId);
      queryClient.invalidateQueries({ queryKey: ['alerts', activeFarm?.id] });
    } catch {
      // Ignore
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <AppHeader title={t('alerts.title')} showBack={false} />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          onPress={() => setFilter('ALL')}
          style={[styles.filterChip, filter === 'ALL' && styles.filterChipActive]}
          accessibilityRole="button"
        >
          <AppText
            variant="caption"
            weight="semibold"
            style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}
          >
            {t('alerts.filterAll')} ({alerts.length})
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter('URGENT')}
          style={[styles.filterChip, filter === 'URGENT' && styles.filterChipActive]}
          accessibilityRole="button"
        >
          <AppText
            variant="caption"
            weight="semibold"
            style={[styles.filterText, filter === 'URGENT' && styles.filterTextActive]}
          >
            {t('alerts.filterUrgent')} ({alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'WARNING').length})
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Alerts Content */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        </View>
      ) : filteredAlerts.length > 0 ? (
        <FlatList
          data={filteredAlerts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }: { item: AlertItem }) => (
            <GlassCard variant="solid" padding="sm" style={[styles.alertCard, item.isRead && styles.alertCardRead]}>
              <View style={styles.alertRow}>
                <View style={[styles.iconCircle, item.severity === 'CRITICAL' ? styles.iconCritical : styles.iconWarning]}>
                  <AlertTriangle size={18} color={item.severity === 'CRITICAL' ? '#DC2626' : '#D97706'} />
                </View>

                <View style={styles.alertMeta}>
                  <AppText variant="label" weight="bold" style={styles.alertTitle}>
                    {item.title}
                  </AppText>
                  <AppText variant="caption" style={styles.alertMessage}>
                    {item.message}
                  </AppText>
                  <AppText variant="caption" style={styles.alertTime}>
                    {new Date(item.createdAt).toLocaleString()}
                  </AppText>
                </View>

                {!item.isRead ? (
                  <TouchableOpacity onPress={() => handleMarkAsRead(item.id)} style={styles.markReadBtn}>
                    <CheckCircle2 size={20} color={theme.colors.primary[600]} />
                  </TouchableOpacity>
                ) : (
                  <CheckCircle2 size={18} color={theme.colors.neutral[300]} />
                )}
              </View>
            </GlassCard>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon={<ShieldCheck size={40} color={theme.colors.status.success} />}
            title={t('alerts.monitoredHealthyTitle')}
            description={t('alerts.monitoredHealthyDesc')}
          />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    marginVertical: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.neutral[100],
    marginRight: theme.spacing.sm,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary[800],
  },
  filterText: {
    color: theme.colors.neutral[700],
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  centerContainer: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  alertCard: {
    marginBottom: theme.spacing.xs + 2,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[600],
  },
  alertCardRead: {
    opacity: 0.65,
    borderLeftColor: theme.colors.neutral[300],
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm + 2,
  },
  iconCritical: {
    backgroundColor: '#FEE2E2',
  },
  iconWarning: {
    backgroundColor: '#FEF3C7',
  },
  alertMeta: {
    flex: 1,
  },
  alertTitle: {
    color: theme.colors.neutral[900],
    fontSize: 13,
  },
  alertMessage: {
    color: theme.colors.neutral[600],
    fontSize: 11,
    marginTop: 2,
  },
  alertTime: {
    color: theme.colors.neutral[400],
    fontSize: 10,
    marginTop: 4,
  },
  markReadBtn: {
    padding: theme.spacing.xs,
  },
  emptyContainer: {
    marginTop: theme.spacing.md,
  },
});
