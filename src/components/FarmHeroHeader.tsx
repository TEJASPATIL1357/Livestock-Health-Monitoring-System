import React from 'react';
import { StyleSheet, View, TouchableOpacity, ImageBackground } from 'react-native';
import { MapPin, ChevronDown, ShieldCheck, Droplet, Users } from 'lucide-react-native';
import { AppText } from './AppText';
import { theme } from '../theme/theme';

interface FarmHeroHeaderProps {
  userName: string;
  farmName: string;
  location: string;
  animalCount: number;
  milkTodayLabel?: string;
  statusLabel: string;
  statusType?: 'healthy' | 'noData' | 'attention';
  onSelectFarm?: () => void;
}

export const FarmHeroHeader: React.FC<FarmHeroHeaderProps> = ({
  userName,
  farmName,
  location: _location,
  animalCount,
  milkTodayLabel = '0 L',
  statusLabel,
  statusType = 'noData',
  onSelectFarm,
}) => {
  return (
    <View style={styles.heroCard}>
      <ImageBackground
        source={require('../../assets/images/hero_farm_landscape.jpg')}
        style={styles.imageBg}
        imageStyle={styles.imageStyle}
      >
        {/* Soft Dark Glass Overlay for Landscape Clarity */}
        <View style={styles.greenOverlayGradient}>
          <View style={styles.headerTopRow}>
            <View style={styles.greetingCol}>
              <AppText variant="caption" style={styles.greetingTag}>
                🌾 Good Morning,
              </AppText>
              <AppText variant="h2" weight="bold" style={styles.userNameText}>
                {userName}
              </AppText>

              <TouchableOpacity
                style={styles.farmSelectorBadge}
                onPress={onSelectFarm}
                activeOpacity={0.7}
              >
                <MapPin size={14} color={theme.colors.primary[700]} />
                <AppText variant="label" weight="semibold" style={styles.farmNameText}>
                  {farmName}
                </AppText>
                <ChevronDown size={14} color={theme.colors.neutral[700]} style={styles.chevron} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 3 Metrics Summary Pills */}
          <View style={styles.metricsRow}>
            {/* Metric Pill 1: Animals */}
            <View style={styles.metricPill}>
              <View style={[styles.pillIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Users size={16} color="#059669" />
              </View>
              <View style={styles.pillTextCol}>
                <AppText variant="label" weight="bold" style={styles.pillValue}>
                  {animalCount}
                </AppText>
                <AppText variant="caption" style={styles.pillLabel}>
                  Animals
                </AppText>
              </View>
            </View>

            {/* Metric Pill 2: Milk Today */}
            <View style={styles.metricPill}>
              <View style={[styles.pillIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Droplet size={16} color="#0284C7" />
              </View>
              <View style={styles.pillTextCol}>
                <AppText variant="label" weight="bold" style={styles.pillValue}>
                  {milkTodayLabel}
                </AppText>
                <AppText variant="caption" style={styles.pillLabel}>
                  Milk Today
                </AppText>
              </View>
            </View>

            {/* Metric Pill 3: Status */}
            <View style={styles.metricPill}>
              <View
                style={[
                  styles.pillIconCircle,
                  {
                    backgroundColor:
                      statusType === 'healthy'
                        ? '#DCFCE7'
                        : statusType === 'attention'
                        ? '#FEF3C7'
                        : '#F1F5F9',
                  },
                ]}
              >
                <ShieldCheck
                  size={16}
                  color={
                    statusType === 'healthy'
                      ? '#059669'
                      : statusType === 'attention'
                      ? '#D97706'
                      : '#64748B'
                  }
                />
              </View>
              <View style={styles.pillTextCol}>
                <AppText variant="label" weight="bold" style={styles.pillValue} numberOfLines={1}>
                  {statusLabel}
                </AppText>
                <AppText variant="caption" style={styles.pillLabel}>
                  Status
                </AppText>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    backgroundColor: '#0F2D19',
    ...theme.shadows.md,
  },
  imageBg: {
    width: '100%',
  },
  imageStyle: {
    borderRadius: theme.borderRadius.xl,
    opacity: 0.85,
  },
  greenOverlayGradient: {
    padding: theme.spacing.md,
    backgroundColor: 'rgba(15, 45, 25, 0.55)',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  greetingCol: {
    flex: 1,
  },
  greetingTag: {
    color: '#86EFAC',
    fontWeight: '700',
    marginBottom: 2,
    fontSize: 12,
  },
  userNameText: {
    color: '#FFFFFF',
    fontSize: 22,
    marginBottom: theme.spacing.xs,
  },
  farmSelectorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...theme.shadows.sm,
  },
  farmNameText: {
    color: theme.colors.neutral[900],
    marginLeft: 6,
    marginRight: 4,
    fontSize: 12,
  },
  chevron: {
    marginLeft: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.xs,
  },
  metricPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: theme.spacing.xs + 2,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...theme.shadows.sm,
  },
  pillIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  pillTextCol: {
    flex: 1,
  },
  pillValue: {
    fontSize: 12,
    color: theme.colors.neutral[900],
  },
  pillLabel: {
    fontSize: 10,
    color: theme.colors.neutral[600],
  },
});
