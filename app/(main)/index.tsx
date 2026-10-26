import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  Users,
  Heart,
  Droplet,
  Cpu,
  BarChart3,
  Grid,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { AppText } from '../../src/components/AppText';
import { FarmHeroHeader } from '../../src/components/FarmHeroHeader';
import { GridNavCard } from '../../src/components/GridNavCard';
import { AiAssistantBanner } from '../../src/components/AiAssistantBanner';
import { FarmSelector } from '../../src/components/FarmSelector';
import { AnimalTelemetryCard } from '../../src/components/AnimalTelemetryCard';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useAppStore } from '../../src/store/useAppStore';
import {
  useAnimalsQuery,
  useUnreadAlertsCountQuery,
  useAlertsQuery,
  useTelemetryQuery,
  useAiAssessmentQuery,
  useDeviceForAnimalQuery,
} from '../../src/hooks/useLivestockTelemetry';
import { theme } from '../../src/theme/theme';
import { Farm, Animal } from '../../src/types';

// Child component rendering an animal card with 1-second auto-refreshing telemetry hooks
const LiveAnimalTelemetryItem: React.FC<{ animal: Animal }> = ({ animal }) => {
  const { data: telemetry, isLoading: isTelemetryLoading, isError } = useTelemetryQuery(animal.id);
  const { data: assessment } = useAiAssessmentQuery(animal.id);
  const { data: device } = useDeviceForAnimalQuery(animal.id);

  return (
    <AnimalTelemetryCard
      animal={animal}
      telemetry={telemetry}
      assessment={assessment}
      device={device}
      isLoading={isTelemetryLoading}
      isError={isError}
    />
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const activeFarm = useAppStore((state) => state.activeFarm);
  const activeFarmId = useAppStore((state) => state.activeFarmId);
  const setActiveFarm = useAppStore((state) => state.setActiveFarm);

  const [farmSelectorVisible, setFarmSelectorVisible] = useState(false);

  const { data: animals = [] } = useAnimalsQuery(activeFarm?.id);
  const { data: unreadAlertsCount = 0 } = useUnreadAlertsCountQuery(activeFarm?.id);
  const { data: alerts = [] } = useAlertsQuery(activeFarm?.id);

  const animalCount = animals.length || activeFarm?.totalLivestock || 0;
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '--';

  const userFarmsList: Farm[] = activeFarm ? [activeFarm] : [];
  const latestAlert = alerts.length > 0 ? alerts[0] : null;

  const handleUnimplemented = (featureName: string) => {
    Alert.alert(
      `${featureName} (Coming Soon)`,
      `The ${featureName} telemetry integration is scheduled for a future platform release.`
    );
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      {/* Top App Header */}
      <View style={styles.topBarRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <AppText variant="label" weight="bold" style={styles.logoBadgeText}>
              🐄 SLH
            </AppText>
          </View>
          <AppText variant="h3" weight="bold" style={styles.brandTitle}>
            Smart Livestock <AppText variant="h3" weight="bold" style={styles.brandHighlight}>Health</AppText>
          </AppText>
        </View>

        <View style={styles.headerActionsRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(main)/alerts')}
            activeOpacity={0.7}
          >
            <Bell size={20} color={theme.colors.neutral[800]} />
            {unreadAlertsCount > 0 && <View style={styles.badgeDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => router.push('/(main)/more')}
            activeOpacity={0.8}
          >
            <AppText variant="label" weight="bold" style={styles.avatarInitials}>
              {userInitials}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Farm Greeting Card */}
      <FarmHeroHeader
        userName={user?.name || 'Farmer'}
        farmName={activeFarm?.name || 'No Farm Selected'}
        location={activeFarm?.district ? `${activeFarm.district}, ${activeFarm.state}` : 'Location Unspecified'}
        animalCount={animalCount}
        milkTodayLabel={animalCount > 0 ? '85 L' : '0 L'}
        statusLabel={animalCount > 0 ? 'Herd Monitored' : 'No Data'}
        statusType={animalCount > 0 ? 'healthy' : 'noData'}
        onSelectFarm={() => setFarmSelectorVisible(true)}
      />

      {/* Live Monitored Livestock Card (1-second auto-updating telemetry) */}
      {animals.length > 0 && (
        <View style={styles.liveSectionContainer}>
          <View style={styles.liveSectionHeader}>
            <View style={styles.liveBadgeHeader}>
              <View style={styles.livePulsingDot} />
              <AppText variant="h3" weight="bold" style={styles.liveSectionTitle}>
                Live Monitored Telemetry
              </AppText>
            </View>
            <TouchableOpacity onPress={() => router.push('/(main)/animals')}>
              <AppText variant="label" weight="semibold" style={styles.viewAllText}>
                All Livestock ({animals.length})
              </AppText>
            </TouchableOpacity>
          </View>
          <LiveAnimalTelemetryItem animal={animals[0]} />
        </View>
      )}

      {/* 2x3 Feature Navigation Grid */}
      <AppText variant="h3" weight="bold" style={styles.sectionTitle}>
        Farm Navigation
      </AppText>

      <View style={styles.gridRow}>
        <GridNavCard
          title="Animals"
          subtitle="Manage livestock"
          icon={<Users size={22} color={theme.colors.gridBadges.animalsIcon} />}
          iconBgColor={theme.colors.gridBadges.animalsBg}
          onPress={() => router.push('/(main)/animals')}
        />
        <GridNavCard
          title="Health"
          subtitle="AI health assistant"
          icon={<Heart size={22} color={theme.colors.gridBadges.healthIcon} />}
          iconBgColor={theme.colors.gridBadges.healthBg}
          onPress={() => router.push('/(main)/ai-assistant')}
        />
        <GridNavCard
          title="Milk"
          subtitle="Track production"
          icon={<Droplet size={22} color={theme.colors.gridBadges.milkIcon} />}
          iconBgColor={theme.colors.gridBadges.milkBg}
          onPress={() => handleUnimplemented('Milk Production Tracking')}
        />
        <GridNavCard
          title="Devices"
          subtitle="Connected sensors"
          icon={<Cpu size={22} color={theme.colors.gridBadges.devicesIcon} />}
          iconBgColor={theme.colors.gridBadges.devicesBg}
          onPress={() => handleUnimplemented('IoT Devices & Telemetry')}
        />
        <GridNavCard
          title="Reports"
          subtitle="View insights"
          icon={<BarChart3 size={22} color={theme.colors.gridBadges.reportsIcon} />}
          iconBgColor={theme.colors.gridBadges.reportsBg}
          onPress={() => handleUnimplemented('Farm Reports & Analytics')}
        />
        <GridNavCard
          title="More"
          subtitle="Settings & help"
          icon={<Grid size={22} color={theme.colors.gridBadges.moreIcon} />}
          iconBgColor={theme.colors.gridBadges.moreBg}
          onPress={() => router.push('/(main)/more')}
        />
      </View>

      {/* AI Health Assistant Callout Banner */}
      <AiAssistantBanner
        onAskAI={() => router.push('/(main)/ai-assistant')}
      />

      {/* Recent Alerts Section */}
      <View style={styles.sectionHeaderRow}>
        <AppText variant="h3" weight="bold" style={styles.sectionTitle}>
          Recent Alerts
        </AppText>
        <TouchableOpacity onPress={() => router.push('/(main)/alerts')}>
          <AppText variant="label" weight="semibold" style={styles.viewAllText}>
            View All
          </AppText>
        </TouchableOpacity>
      </View>

      {latestAlert ? (
        <TouchableOpacity
          style={styles.alertCard}
          onPress={() => router.push('/(main)/alerts')}
          activeOpacity={0.8}
        >
          <View style={styles.alertIconCircle}>
            <AlertTriangle size={18} color={latestAlert.severity === 'CRITICAL' ? '#DC2626' : '#D97706'} />
          </View>
          <View style={styles.alertInfoCol}>
            <AppText variant="label" weight="bold" style={styles.alertTitle}>
              {latestAlert.title}
            </AppText>
            <AppText variant="caption" style={styles.alertDesc}>
              {latestAlert.message}
            </AppText>
          </View>
          <ChevronRight size={18} color={theme.colors.neutral[400]} />
        </TouchableOpacity>
      ) : (
        <View style={styles.noAlertCard}>
          <ShieldCheck size={28} color={theme.colors.primary[500]} />
          <AppText variant="label" weight="semibold" style={styles.noAlertTitle}>
            No Active Health Alerts
          </AppText>
          <AppText variant="caption" style={styles.noAlertDesc}>
            Your farm has zero active alerts. Add animals and sensors to track health events.
          </AppText>
        </View>
      )}

      {/* Multi-Farm Selector Modal */}
      <FarmSelector
        visible={farmSelectorVisible}
        farms={userFarmsList}
        activeFarmId={activeFarmId}
        onSelectFarm={(farm) => setActiveFarm(farm)}
        onAddFarm={() => router.push('/(onboarding)/farm-setup')}
        onClose={() => setFarmSelectorVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
  },
  topBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: theme.spacing.xs + 2,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs + 2,
  },
  logoBadgeText: {
    fontSize: 12,
  },
  brandTitle: {
    color: theme.colors.neutral[900],
    fontSize: 16,
  },
  brandHighlight: {
    color: theme.colors.primary[600],
  },
  headerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    ...theme.shadows.sm,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.primary[500],
  },
  avatarInitials: {
    color: theme.colors.primary[800],
    fontSize: 14,
  },
  sectionTitle: {
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.sm,
    fontSize: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  viewAllText: {
    color: theme.colors.primary[600],
    fontSize: 12,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  alertIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  alertInfoCol: {
    flex: 1,
  },
  alertTitle: {
    color: theme.colors.neutral[900],
    fontSize: 13,
  },
  alertDesc: {
    color: theme.colors.neutral[500],
    fontSize: 11,
  },
  noAlertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  noAlertTitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.neutral[800],
  },
  noAlertDesc: {
    marginTop: 2,
    color: theme.colors.neutral[500],
    textAlign: 'center',
    fontSize: 11,
  },
  liveSectionContainer: {
    marginBottom: theme.spacing.md,
  },
  liveSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs + 2,
    marginTop: theme.spacing.xs,
  },
  liveBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  livePulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  liveSectionTitle: {
    color: theme.colors.neutral[900],
    fontSize: 16,
  },
});
