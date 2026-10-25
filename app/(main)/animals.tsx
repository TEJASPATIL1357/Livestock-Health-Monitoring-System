import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Contact,
} from 'lucide-react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { AppText } from '../../src/components/AppText';
import { GlassButton } from '../../src/components/GlassButton';
import { EmptyState } from '../../src/components/EmptyState';
import { AnimalTelemetryCard } from '../../src/components/AnimalTelemetryCard';
import { AddAnimalModal } from '../../src/components/AddAnimalModal';
import { useAppStore } from '../../src/store/useAppStore';
import {
  useAnimalsQuery,
  useTelemetryQuery,
  useAiAssessmentQuery,
  useDeviceForAnimalQuery,
} from '../../src/hooks/useLivestockTelemetry';
import { theme } from '../../src/theme/theme';
import { Animal } from '../../src/types';

// Child component rendering an animal card with telemetry hooks
const AnimalCardItem: React.FC<{ animal: Animal }> = ({ animal }) => {
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

export default function AnimalsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const activeFarm = useAppStore((state) => state.activeFarm);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'HEALTHY' | 'ATTENTION'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: animals = [], isLoading } = useAnimalsQuery(activeFarm?.id);

  const filteredAnimals = animals.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tagNumber && item.tagNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedFilter === 'HEALTHY') return matchesSearch && item.status === 'HEALTHY';
    if (selectedFilter === 'ATTENTION') return matchesSearch && (item.status === 'ATTENTION' || item.status === 'CRITICAL');
    return matchesSearch;
  });

  const handleAddAnimal = () => {
    setIsAddModalOpen(true);
  };

  const renderHeader = () => (
    <View>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={20} color={theme.colors.neutral[800]} />
        </TouchableOpacity>
        <AppText variant="h2" weight="bold" style={styles.headerTitle}>
          {t('animals.title')}
        </AppText>
        <TouchableOpacity style={styles.filterToggleBtn} onPress={() => Alert.alert('Filter', 'Filter options')}>
          <SlidersHorizontal size={18} color={theme.colors.neutral[700]} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Search size={18} color={theme.colors.neutral[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('common.search')}
          placeholderTextColor={theme.colors.neutral[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Category Pills */}
      <View style={styles.categoryPillsRow}>
        <TouchableOpacity
          style={[styles.catPill, selectedFilter === 'ALL' && styles.catPillActive]}
          onPress={() => setSelectedFilter('ALL')}
        >
          <AppText variant="label" weight="bold" style={[styles.catPillText, selectedFilter === 'ALL' && styles.catPillTextActive]}>
            {t('animals.filterAll')} ({animals.length})
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.catPill, selectedFilter === 'HEALTHY' && styles.catPillActive]}
          onPress={() => setSelectedFilter('HEALTHY')}
        >
          <AppText variant="label" weight="bold" style={[styles.catPillText, selectedFilter === 'HEALTHY' && styles.catPillTextActive]}>
            {t('animals.filterHealthy')} ({animals.filter((a) => a.status === 'HEALTHY').length})
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.catPill, selectedFilter === 'ATTENTION' && styles.catPillActive]}
          onPress={() => setSelectedFilter('ATTENTION')}
        >
          <AppText variant="label" weight="bold" style={[styles.catPillText, selectedFilter === 'ATTENTION' && styles.catPillTextActive]}>
            {t('animals.filterAttention')} ({animals.filter((a) => a.status !== 'HEALTHY').length})
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      <FlatList
        data={filteredAnimals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              icon={<Contact size={40} color={theme.colors.primary[800]} />}
              title={t('animals.emptyTitle')}
              description={t('animals.emptyDesc')}
              actionTitle={t('animals.addBtn')}
              onAction={handleAddAnimal}
            />
          </View>
        }
        renderItem={({ item }) => <AnimalCardItem animal={item} />}
      />

      {/* Bottom CTA Button */}
      <View style={styles.bottomCtaContainer}>
        <GlassButton
          title={`+ ${t('animals.addBtn')}`}
          onPress={handleAddAnimal}
          variant="primary"
          size="lg"
          style={styles.fullWidthBtn}
        />
      </View>

      <AddAnimalModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        farmId={activeFarm?.id}
      />
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
  backBtn: {
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
    fontSize: 18,
  },
  filterToggleBtn: {
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    height: 46,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.neutral[900],
  },
  categoryPillsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs + 2,
    marginBottom: theme.spacing.md,
  },
  catPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  catPillActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  catPillText: {
    color: theme.colors.neutral[700],
    fontSize: 12,
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 90,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  bottomCtaContainer: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.md,
    right: theme.spacing.md,
  },
  fullWidthBtn: {
    width: '100%',
  },
});
