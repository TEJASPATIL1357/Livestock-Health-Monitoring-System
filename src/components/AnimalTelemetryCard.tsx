import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Thermometer,
  Cpu,
  Activity,
  Sparkles,
  AlertCircle,
  Clock,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Compass,
  Move,
} from 'lucide-react-native';
import { AppText } from './AppText';
import { GlassCard } from './GlassCard';
import { StatusBadge } from './StatusBadge';
import { theme } from '../theme/theme';
import { Animal, SensorTelemetry, AiAssessment, Device } from '../types';

interface AnimalTelemetryCardProps {
  animal: Animal;
  telemetry?: SensorTelemetry | null;
  assessment?: AiAssessment | null;
  device?: Device | null;
  isLoading?: boolean;
  isError?: boolean;
}

export const AnimalTelemetryCard: React.FC<AnimalTelemetryCardProps> = ({
  animal,
  telemetry,
  assessment,
  device,
  isLoading = false,
  isError = false,
}) => {
  const { t, i18n } = useTranslation();

  const currentLang = (i18n.language || 'en').slice(0, 2);

  const getLocalizedAiSummary = (ai?: AiAssessment | null) => {
    if (!ai) return null;
    if (currentLang === 'hi' && ai.summaryHi) return ai.summaryHi;
    if (currentLang === 'mr' && ai.summaryMr) return ai.summaryMr;
    return ai.summaryEn;
  };

  const [now, setNow] = React.useState<number>(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatMeasuredTime = (timestamp?: string | null) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return null;

    const clockTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const diffMs = now - date.getTime();
    if (diffMs < -5000) {
      return `${clockTime} · ${t('telemetry.justNow')}`;
    }
    const secondsAgo = Math.max(0, Math.floor(diffMs / 1000));

    let relativeStr = t('telemetry.justNow');
    if (secondsAgo >= 1 && secondsAgo < 60) {
      relativeStr = t('telemetry.secondsAgo', { count: secondsAgo });
    } else if (secondsAgo >= 60) {
      const minutesAgo = Math.floor(secondsAgo / 60);
      if (minutesAgo < 60) {
        relativeStr = t('telemetry.minutesAgo', { count: minutesAgo });
      } else {
        const hoursAgo = Math.floor(minutesAgo / 60);
        relativeStr = t('telemetry.hoursAgo', { count: hoursAgo });
      }
    }

    return `${clockTime} · ${relativeStr}`;
  };

  const formattedTime = formatMeasuredTime(telemetry?.measuredAt);

  // Movement status resolution
  const getMovementConfig = (tel?: SensorTelemetry | null) => {
    if (!tel || !tel.movementAvailable) {
      return {
        label: t('telemetry.movementInactive'),
        bgColor: '#FEF3C7',
        textColor: '#92400E',
        dotColor: '#D97706',
      };
    }

    const rawStatus = (tel.movementStatus || '').toUpperCase();
    if (rawStatus === 'ACTIVE') {
      return {
        label: t('telemetry.movementActive'),
        bgColor: '#DCFCE7',
        textColor: '#15803D',
        dotColor: '#16A34A',
      };
    }
    if (rawStatus === 'NORMAL') {
      return {
        label: t('telemetry.movementNormal'),
        bgColor: '#E0F2FE',
        textColor: '#0369A1',
        dotColor: '#0284C7',
      };
    }
    if (rawStatus === 'RESTING') {
      return {
        label: t('telemetry.movementResting'),
        bgColor: '#F3E8FF',
        textColor: '#6B21A8',
        dotColor: '#9333EA',
      };
    }
    if (rawStatus === 'UNKNOWN') {
      return {
        label: t('telemetry.movementUnknown'),
        bgColor: '#F1F5F9',
        textColor: '#475569',
        dotColor: '#64748B',
      };
    }

    // Default to active if movementAvailable is true
    return {
      label: t('telemetry.movementActive'),
      bgColor: '#DCFCE7',
      textColor: '#15803D',
      dotColor: '#16A34A',
    };
  };

  const movementConfig = getMovementConfig(telemetry);

  return (
    <GlassCard variant="solid" padding="md" style={styles.card}>
      {/* 1. Animal Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.avatarCircle}>
          <AppText variant="h2">{animal.species === 'BUFFALO' ? '🐃' : '🐄'}</AppText>
        </View>

        <View style={styles.animalMetaCol}>
          <View style={styles.nameTagRow}>
            <AppText variant="h3" weight="bold" style={styles.animalName}>
              {animal.name}
            </AppText>
            <View style={styles.tagBadge}>
              <Tag size={10} color={theme.colors.primary[700]} />
              <AppText variant="caption" weight="semibold" style={styles.tagText}>
                {animal.tagNumber}
              </AppText>
            </View>
          </View>
          <AppText variant="caption" style={styles.animalSubtext}>
            {animal.breed || 'Cattle'} • {animal.species}
          </AppText>
        </View>

        {telemetry?.isDisconnected ? (
          <StatusBadge status="critical" label={t('telemetry.sensorDisconnected')} />
        ) : telemetry?.isStale ? (
          <StatusBadge status="warning" label={t('telemetry.staleData')} />
        ) : telemetry ? (
          <StatusBadge status="healthy" label="Online" />
        ) : (
          <StatusBadge status="noData" label="No Data" />
        )}
      </View>

      <View style={styles.divider} />

      {/* 2. Temperature Sensor Block */}
      <View style={styles.sensorBlock}>
        <View style={styles.sensorTitleRow}>
          <Thermometer size={18} color={theme.colors.primary[600]} />
          <AppText variant="label" weight="bold" style={styles.sensorTitle}>
            {t('telemetry.currentTemp')}
          </AppText>

          {telemetry && !telemetry.isStale && !telemetry.isDisconnected && (
            <View style={styles.liveAutoBadge}>
              <View style={styles.livePulseDot} />
              <AppText variant="caption" weight="bold" style={styles.liveAutoText}>
                {t('telemetry.liveBadge')}
              </AppText>
            </View>
          )}
        </View>

        {isLoading && !telemetry ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={theme.colors.primary[600]} />
            <AppText variant="caption" style={styles.loadingText}>
              Loading sensor telemetry...
            </AppText>
          </View>
        ) : isError && !telemetry ? (
          <View style={styles.errorBox}>
            <AlertCircle size={16} color={theme.colors.status.error} />
            <AppText variant="caption" style={styles.errorText}>
              Unable to fetch telemetry data.
            </AppText>
          </View>
        ) : telemetry ? (
          <View style={styles.readingRow}>
            <AppText variant="h1" weight="bold" style={styles.tempValue}>
              {telemetry.temperature.toFixed(1)}°C
            </AppText>
            <View style={styles.readingMeta}>
              <View style={styles.timeRow}>
                <Clock size={12} color={theme.colors.neutral[500]} />
                <AppText variant="caption" style={styles.timeText}>
                  {t('telemetry.lastUpdated')}: {formattedTime}
                </AppText>
              </View>
              {telemetry.isStale && (
                <AppText variant="caption" style={styles.staleText}>
                  ⚠️ {t('telemetry.staleData')}
                </AppText>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.noDataBox}>
            <AppText variant="body" style={styles.noDataText}>
              {t('telemetry.noReadings')}
            </AppText>
          </View>
        )}
      </View>

      {/* 3. Movement & Activity Sensor Block */}
      <View style={styles.movementBlock}>
        <View style={styles.sensorTitleRow}>
          <Activity
            size={18}
            color={telemetry?.movementAvailable ? theme.colors.primary[600] : theme.colors.neutral[500]}
          />
          <AppText variant="label" weight="bold" style={styles.sensorTitle}>
            {t('telemetry.movementLabel')}
          </AppText>

          <View style={[styles.movementStatusPill, { backgroundColor: movementConfig.bgColor }]}>
            <View style={[styles.movementStatusDot, { backgroundColor: movementConfig.dotColor }]} />
            <AppText variant="caption" weight="bold" style={{ color: movementConfig.textColor, fontSize: 11 }}>
              {movementConfig.label}
            </AppText>
          </View>
        </View>

        {/* Movement Sensor Availability & Freshness Meta Row */}
        <View style={styles.movementMetaRow}>
          <View style={styles.movementAvailRow}>
            {telemetry?.movementAvailable ? (
              <>
                <CheckCircle2 size={12} color="#16A34A" />
                <AppText variant="caption" style={styles.availTextActive}>
                  {t('telemetry.movementAvailable')}
                </AppText>
              </>
            ) : (
              <>
                <AlertCircle size={12} color="#D97706" />
                <AppText variant="caption" style={styles.availTextInactive}>
                  {t('telemetry.movementUnavailable')}
                </AppText>
              </>
            )}
          </View>

          {formattedTime && (
            <View style={styles.timeRow}>
              <Clock size={11} color={theme.colors.neutral[500]} />
              <AppText variant="caption" style={styles.timeTextMini}>
                {formattedTime}
              </AppText>
            </View>
          )}
        </View>

        {/* 6-DoF Metric Values Grid */}
        {telemetry?.movementAvailable && (telemetry.accelX !== undefined || telemetry.gyroX !== undefined) ? (
          <View style={styles.movementGridContainer}>
            {/* Linear Accelerometer Card */}
            <View style={styles.sensorSubCard}>
              <View style={styles.subCardHeader}>
                <Move size={13} color={theme.colors.primary[700]} />
                <AppText variant="caption" weight="bold" style={styles.subCardTitle}>
                  {t('telemetry.linearAccel')}
                </AppText>
              </View>
              <View style={styles.axisChipsRow}>
                <View style={styles.axisChip}>
                  <AppText variant="caption" style={styles.axisName}>X</AppText>
                  <AppText variant="caption" weight="bold" style={styles.axisVal}>
                    {telemetry.accelX !== undefined ? (telemetry.accelX > 0 ? `+${telemetry.accelX}` : telemetry.accelX) : '--'}
                  </AppText>
                </View>
                <View style={styles.axisChip}>
                  <AppText variant="caption" style={styles.axisName}>Y</AppText>
                  <AppText variant="caption" weight="bold" style={styles.axisVal}>
                    {telemetry.accelY !== undefined ? (telemetry.accelY > 0 ? `+${telemetry.accelY}` : telemetry.accelY) : '--'}
                  </AppText>
                </View>
                <View style={styles.axisChip}>
                  <AppText variant="caption" style={styles.axisName}>Z</AppText>
                  <AppText variant="caption" weight="bold" style={styles.axisVal}>
                    {telemetry.accelZ !== undefined ? (telemetry.accelZ > 0 ? `+${telemetry.accelZ}` : telemetry.accelZ) : '--'}
                  </AppText>
                </View>
              </View>
            </View>

            {/* Angular Gyroscope Card */}
            <View style={styles.sensorSubCard}>
              <View style={styles.subCardHeader}>
                <Compass size={13} color="#0284C7" />
                <AppText variant="caption" weight="bold" style={styles.subCardTitle}>
                  {t('telemetry.angularVelocity')}
                </AppText>
              </View>
              <View style={styles.axisChipsRow}>
                <View style={styles.axisChip}>
                  <AppText variant="caption" style={styles.axisName}>X</AppText>
                  <AppText variant="caption" weight="bold" style={styles.axisVal}>
                    {telemetry.gyroX !== undefined ? (telemetry.gyroX > 0 ? `+${telemetry.gyroX}` : telemetry.gyroX) : '--'}
                  </AppText>
                </View>
                <View style={styles.axisChip}>
                  <AppText variant="caption" style={styles.axisName}>Y</AppText>
                  <AppText variant="caption" weight="bold" style={styles.axisVal}>
                    {telemetry.gyroY !== undefined ? (telemetry.gyroY > 0 ? `+${telemetry.gyroY}` : telemetry.gyroY) : '--'}
                  </AppText>
                </View>
                <View style={styles.axisChip}>
                  <AppText variant="caption" style={styles.axisName}>Z</AppText>
                  <AppText variant="caption" weight="bold" style={styles.axisVal}>
                    {telemetry.gyroZ !== undefined ? (telemetry.gyroZ > 0 ? `+${telemetry.gyroZ}` : telemetry.gyroZ) : '--'}
                  </AppText>
                </View>
              </View>
            </View>

            {/* Honest Scientific Classification Caption */}
            <AppText variant="caption" style={styles.activityNoticeText}>
              ℹ️ {t('telemetry.activityNotice')}
            </AppText>
          </View>
        ) : (
          <View style={styles.movementPendingBox}>
            <AlertCircle size={14} color="#D97706" />
            <AppText variant="caption" style={styles.movementPendingText}>
              {t('telemetry.movementComingSoon')}
            </AppText>
          </View>
        )}
      </View>

      {/* 4. ESP32 Device Info Block */}
      <View style={styles.deviceBlock}>
        <View style={styles.deviceTitleRow}>
          <Cpu size={15} color={theme.colors.neutral[600]} />
          <AppText variant="caption" weight="bold" style={styles.deviceTitle}>
            {t('telemetry.deviceLabel')}:
          </AppText>
          <AppText variant="caption" weight="semibold" style={styles.deviceValue}>
            {device ? device.deviceIdentifier : (telemetry?.deviceIdentifier || t('telemetry.deviceUnassigned'))}
          </AppText>
          <View style={styles.deviceStatusDot} />
          <AppText variant="caption" style={styles.deviceStatusSub}>
            {device ? device.status : (telemetry ? 'ACTIVE' : 'OFFLINE')}
          </AppText>
        </View>
      </View>

      {/* 5. AI Health Intelligence Summary Block */}
      {assessment && (
        <View style={styles.aiBlock}>
          <View style={styles.aiHeaderRow}>
            <Sparkles size={16} color="#92400E" />
            <AppText variant="label" weight="bold" style={styles.aiTitle}>
              {t('telemetry.aiSummaryTitle')}
            </AppText>
            {assessment.healthStatus === 'HEALTHY' ? (
              <ShieldCheck size={16} color="#059669" />
            ) : (
              <AlertCircle size={16} color="#D97706" />
            )}
          </View>

          <AppText variant="body" style={styles.aiSummaryText}>
            {getLocalizedAiSummary(assessment)}
          </AppText>

          <AppText variant="caption" style={styles.aiDisclaimerText}>
            {t('telemetry.aiDisclaimer')}
          </AppText>
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  animalMetaCol: {
    flex: 1,
  },
  nameTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  animalName: {
    color: theme.colors.neutral[900],
    fontSize: 16,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    gap: 3,
  },
  tagText: {
    color: theme.colors.primary[800],
    fontSize: 11,
  },
  animalSubtext: {
    color: theme.colors.neutral[500],
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.neutral[200],
    marginVertical: theme.spacing.sm + 2,
  },
  sensorBlock: {
    marginBottom: theme.spacing.sm,
  },
  sensorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    gap: 6,
  },
  sensorTitle: {
    color: theme.colors.neutral[800],
    fontSize: 13,
  },
  liveAutoBadge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveAutoText: {
    color: '#15803D',
    fontSize: 10,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  loadingText: {
    color: theme.colors.neutral[500],
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: theme.spacing.xs,
  },
  errorText: {
    color: theme.colors.status.error,
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  tempValue: {
    color: theme.colors.primary[800],
    fontSize: 28,
  },
  readingMeta: {
    alignItems: 'flex-end',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: theme.colors.neutral[600],
    fontSize: 11,
  },
  timeTextMini: {
    color: theme.colors.neutral[500],
    fontSize: 10,
  },
  staleText: {
    color: theme.colors.status.warning,
    fontSize: 11,
    marginTop: 2,
  },
  noDataBox: {
    backgroundColor: '#F8FAFC',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  noDataText: {
    color: theme.colors.neutral[500],
    fontSize: 12,
    fontStyle: 'italic',
  },
  movementBlock: {
    marginBottom: theme.spacing.sm,
    backgroundColor: '#F8FAFC',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  movementStatusPill: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  movementStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  movementMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  movementAvailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  availTextActive: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '600',
  },
  availTextInactive: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '600',
  },
  movementGridContainer: {
    gap: 6,
  },
  sensorSubCard: {
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  subCardTitle: {
    color: theme.colors.neutral[700],
    fontSize: 11,
  },
  axisChipsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  axisChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  axisName: {
    color: theme.colors.neutral[500],
    fontSize: 10,
    fontWeight: '700',
  },
  axisVal: {
    color: theme.colors.neutral[900],
    fontSize: 11,
  },
  activityNoticeText: {
    color: theme.colors.neutral[400],
    fontSize: 9.5,
    marginTop: 2,
    fontStyle: 'italic',
  },
  movementPendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: theme.borderRadius.sm,
    gap: 6,
  },
  movementPendingText: {
    color: '#92400E',
    fontSize: 11,
  },
  deviceBlock: {
    marginBottom: theme.spacing.sm,
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  deviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deviceTitle: {
    color: theme.colors.neutral[600],
    fontSize: 11,
  },
  deviceValue: {
    color: theme.colors.neutral[900],
    fontSize: 11,
  },
  deviceStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
    marginLeft: 'auto',
  },
  deviceStatusSub: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '700',
  },
  aiBlock: {
    backgroundColor: '#FEFCE8',
    padding: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.xs,
  },
  aiTitle: {
    color: '#854D0E',
    fontSize: 13,
    flex: 1,
  },
  aiSummaryText: {
    color: theme.colors.neutral[800],
    fontSize: 12,
    lineHeight: 18,
  },
  aiDisclaimerText: {
    color: theme.colors.neutral[500],
    fontSize: 10,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
});
