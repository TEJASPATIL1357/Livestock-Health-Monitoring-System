import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Settings,
  Pencil,
  MapPin,
  Users,
  CheckCircle2,
  Calendar,
  Plus,
  BarChart3,
  Sprout,
  ShieldCheck,
} from 'lucide-react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { AppText } from '../../src/components/AppText';
import { GlassCard } from '../../src/components/GlassCard';
import { useAppStore } from '../../src/store/useAppStore';
import { theme } from '../../src/theme/theme';

export default function FarmDetailsScreen() {
  const router = useRouter();
  const activeFarm = useAppStore((state) => state.activeFarm);

  const animalCount = activeFarm?.totalLivestock || 0;
  const farmName = activeFarm?.name || 'No Farm Selected';
  const location = activeFarm?.district
    ? `${activeFarm.district}, ${activeFarm.state}, India`
    : 'Location Unspecified';
  const createdDate = activeFarm?.createdAt
    ? new Date(activeFarm.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  const handleUnimplemented = (action: string) => {
    Alert.alert(action, `${action} management is scheduled for a future release.`);
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      {/* Header bar */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <ArrowLeft size={20} color={theme.colors.neutral[800]} />
        </TouchableOpacity>

        <AppText variant="h3" weight="bold" style={styles.headerTitle}>
          {farmName}
        </AppText>

        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => handleUnimplemented('Farm Settings')}
          hitSlop={12}
        >
          <Settings size={20} color={theme.colors.neutral[800]} />
        </TouchableOpacity>
      </View>

      {/* Hero Farm Visual Header */}
      <View style={styles.heroVisualCard}>
        <Image
          source={require('../../assets/images/hero_farm_landscape.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay} />
        <View style={styles.activeFarmBadge}>
          <CheckCircle2 size={12} color="#FFFFFF" />
          <AppText variant="caption" weight="bold" style={styles.activeBadgeText}>
            Active Farm
          </AppText>
        </View>
      </View>

      {/* Overlapped Farm Information Card */}
      <GlassCard variant="solid" padding="md" style={styles.infoOverlapCard}>
        <View style={styles.farmTitleRow}>
          <AppText variant="h2" weight="bold" style={styles.farmNameText}>
            {farmName}
          </AppText>
          <TouchableOpacity onPress={() => handleUnimplemented('Edit Farm Name')} hitSlop={10}>
            <Pencil size={16} color={theme.colors.primary[600]} />
          </TouchableOpacity>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={14} color={theme.colors.neutral[500]} />
          <AppText variant="caption" style={styles.locationText}>
            {location}
          </AppText>
        </View>

        {/* 2x2 Metadata Grid */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <View style={styles.metaIconCircle}>
              <Users size={16} color={theme.colors.neutral[700]} />
            </View>
            <View>
              <AppText variant="caption" style={styles.metaLabel}>
                Livestock Type
              </AppText>
              <AppText variant="label" weight="bold">
                {activeFarm?.livestockType || 'Dairy'}
              </AppText>
            </View>
          </View>

          <View style={styles.metaItem}>
            <View style={[styles.metaIconCircle, { backgroundColor: '#DCFCE7' }]}>
              <CheckCircle2 size={16} color="#059669" />
            </View>
            <View>
              <AppText variant="caption" style={styles.metaLabel}>
                Status
              </AppText>
              <AppText variant="label" weight="bold" style={{ color: '#059669' }}>
                Active
              </AppText>
            </View>
          </View>

          <View style={styles.metaItem}>
            <View style={styles.metaIconCircle}>
              <Users size={16} color={theme.colors.primary[700]} />
            </View>
            <View>
              <AppText variant="caption" style={styles.metaLabel}>
                Total Animals
              </AppText>
              <AppText variant="label" weight="bold">
                {animalCount}
              </AppText>
            </View>
          </View>

          <View style={styles.metaItem}>
            <View style={styles.metaIconCircle}>
              <Calendar size={16} color={theme.colors.neutral[700]} />
            </View>
            <View>
              <AppText variant="caption" style={styles.metaLabel}>
                Created
              </AppText>
              <AppText variant="label" weight="bold">
                {createdDate}
              </AppText>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Quick Actions */}
      <AppText variant="h3" weight="bold" style={styles.sectionTitle}>
        Quick Actions
      </AppText>

      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.actionBtnCard}
          onPress={() => router.push('/(main)/animals')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionCircle, { backgroundColor: '#DCFCE7' }]}>
            <Plus size={20} color="#059669" />
          </View>
          <AppText variant="caption" weight="bold" align="center">
            Add Animal
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtnCard}
          onPress={() => handleUnimplemented('View Reports')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionCircle, { backgroundColor: '#E0F2FE' }]}>
            <BarChart3 size={20} color="#0284C7" />
          </View>
          <AppText variant="caption" weight="bold" align="center">
            View Reports
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtnCard}
          onPress={() => handleUnimplemented('Farm Settings')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionCircle, { backgroundColor: '#F1F5F9' }]}>
            <Settings size={20} color="#64748B" />
          </View>
          <AppText variant="caption" weight="bold" align="center">
            Farm Settings
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Farm Health Overview */}
      <AppText variant="h3" weight="bold" style={styles.sectionTitle}>
        Farm Health Overview
      </AppText>

      <GlassCard variant="solid" padding="lg" style={styles.healthOverviewCard}>
        <View style={styles.gaugeRow}>
          <View style={styles.circularGauge}>
            <AppText variant="h2" weight="bold" style={styles.gaugePercentText}>
              {animalCount > 0 ? '100%' : '0'}
            </AppText>
          </View>

          <View style={styles.gaugeTextCol}>
            <View style={styles.healthyStatusBadge}>
              <ShieldCheck size={16} color="#059669" />
              <AppText variant="label" weight="bold" style={styles.healthyBadgeText}>
                {animalCount > 0 ? 'Healthy' : 'No Monitored Data'}
              </AppText>
            </View>
            <AppText variant="caption" style={styles.gaugeSubtitle}>
              {animalCount > 0
                ? 'All monitored animals are healthy. Keep up the good work!'
                : 'Add animals and sensors to begin active health monitoring.'}
            </AppText>
          </View>
        </View>
      </GlassCard>

      {/* Farm Recommendation Banner */}
      <View style={styles.recommendationCard}>
        <View style={styles.sproutCircle}>
          <Sprout size={20} color="#059669" />
        </View>
        <View style={styles.recTextCol}>
          <AppText variant="label" weight="bold" style={styles.recTitle}>
            Your farm is ready to grow
          </AppText>
          <AppText variant="caption" style={styles.recDesc}>
            Add more animals and connect smart devices to get deeper insights.
          </AppText>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    ...theme.shadows.sm,
  },
  headerTitle: {
    color: theme.colors.neutral[900],
    fontSize: 16,
  },
  heroVisualCard: {
    height: 150,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 45, 25, 0.45)',
  },
  activeFarmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.9)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    gap: 4,
    zIndex: 2,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  infoOverlapCard: {
    marginTop: -40,
    marginBottom: theme.spacing.lg,
  },
  farmTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  farmNameText: {
    color: theme.colors.neutral[900],
    fontSize: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  locationText: {
    color: theme.colors.neutral[500],
    marginLeft: 4,
    fontSize: 11,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
  },
  metaItem: {
    width: '45%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  metaLabel: {
    fontSize: 10,
    color: theme.colors.neutral[500],
  },
  sectionTitle: {
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.sm,
    fontSize: 15,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  actionBtnCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    ...theme.shadows.sm,
  },
  actionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  healthOverviewCard: {
    marginBottom: theme.spacing.lg,
  },
  gaugeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circularGauge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  gaugePercentText: {
    color: theme.colors.primary[800],
    fontSize: 16,
  },
  gaugeTextCol: {
    flex: 1,
  },
  healthyStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  healthyBadgeText: {
    color: theme.colors.neutral[900],
    fontSize: 14,
  },
  gaugeSubtitle: {
    color: theme.colors.neutral[600],
    fontSize: 11,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: theme.spacing.xl,
  },
  sproutCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  recTextCol: {
    flex: 1,
  },
  recTitle: {
    color: theme.colors.primary[800],
    fontSize: 13,
  },
  recDesc: {
    color: theme.colors.neutral[600],
    fontSize: 11,
  },
});
