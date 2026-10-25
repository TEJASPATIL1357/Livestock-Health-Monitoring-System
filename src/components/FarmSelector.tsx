import React from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, FlatList } from 'react-native';
import { Check, X, Plus, MapPin } from 'lucide-react-native';
import { AppText } from './AppText';
import { GlassButton } from './GlassButton';
import { Farm } from '../types';
import { theme } from '../theme/theme';

interface FarmSelectorProps {
  visible: boolean;
  farms: Farm[];
  activeFarmId: string | null;
  onSelectFarm: (farm: Farm) => void;
  onAddFarm: () => void;
  onClose: () => void;
}

export const FarmSelector: React.FC<FarmSelectorProps> = ({
  visible,
  farms,
  activeFarmId,
  onSelectFarm,
  onAddFarm,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.sheetContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.sheetHeader}>
            <AppText variant="h3" weight="bold">
              Select Active Farm
            </AppText>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <X size={20} color={theme.colors.neutral[500]} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={farms}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = item.id === activeFarmId;
              return (
                <TouchableOpacity
                  style={[styles.farmItem, isSelected && styles.selectedFarmItem]}
                  onPress={() => {
                    onSelectFarm(item);
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.farmIconCircle}>
                    <MapPin size={18} color={isSelected ? theme.colors.primary[600] : theme.colors.neutral[500]} />
                  </View>
                  <View style={styles.farmInfo}>
                    <AppText variant="label" weight="bold">
                      {item.name}
                    </AppText>
                    <AppText variant="caption" style={styles.locationText}>
                      {item.district ? `${item.district}, ${item.state}` : item.state || 'Maharashtra'}
                    </AppText>
                  </View>
                  {isSelected && (
                    <View style={styles.checkCircle}>
                      <Check size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />

          <GlassButton
            title="Create New Farm"
            onPress={() => {
              onClose();
              onAddFarm();
            }}
            variant="outline"
            icon={<Plus size={18} color={theme.colors.primary[700]} />}
            style={styles.addFarmBtn}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.surface.overlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: '60%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingVertical: theme.spacing.xs,
  },
  farmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.neutral[50],
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  selectedFarmItem: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  farmIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  farmInfo: {
    flex: 1,
  },
  locationText: {
    color: theme.colors.neutral[500],
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFarmBtn: {
    marginTop: theme.spacing.md,
  },
});
