import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { X, Tag, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { AppText } from './AppText';
import { AppInput } from './AppInput';
import { GlassButton } from './GlassButton';
import { GlassCard } from './GlassCard';
import {
  useCreateAnimalMutation,
  useUnassignedDevicesQuery,
  useAssignDeviceMutation,
} from '../hooks/useLivestockTelemetry';
import { theme } from '../theme/theme';

interface AddAnimalModalProps {
  visible: boolean;
  onClose: () => void;
  farmId?: string;
}

export const AddAnimalModal: React.FC<AddAnimalModalProps> = ({
  visible,
  onClose,
  farmId,
}) => {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [tagNumber, setTagNumber] = useState('');
  const [species, setSpecies] = useState<'CATTLE' | 'BUFFALO'>('CATTLE');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<'FEMALE' | 'MALES' | 'FEMALE' | 'MALE'>('FEMALE');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Recovery state if animal is created but collar assignment fails
  const [createdAnimalId, setCreatedAnimalId] = useState<string | null>(null);
  const [collarAssignFailed, setCollarAssignFailed] = useState(false);

  const createAnimalMutation = useCreateAnimalMutation();
  const assignDeviceMutation = useAssignDeviceMutation();
  const { data: unassignedDevices = [], isLoading: isLoadingDevices } = useUnassignedDevicesQuery(farmId);

  const resetForm = () => {
    setName('');
    setTagNumber('');
    setSpecies('CATTLE');
    setBreed('');
    setGender('FEMALE');
    setDateOfBirth('');
    setSelectedDeviceId(null);
    setFieldError(null);
    setApiError(null);
    setCreatedAnimalId(null);
    setCollarAssignFailed(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleRetryAssignCollar = async () => {
    if (!createdAnimalId || !selectedDeviceId) return;
    setApiError(null);
    try {
      await assignDeviceMutation.mutateAsync({
        deviceId: selectedDeviceId,
        animalId: createdAnimalId,
      });
      handleClose();
    } catch (err: any) {
      setCollarAssignFailed(true);
      setApiError(t('animals.collarAssignFailed'));
    }
  };

  const handleSubmit = async () => {
    setFieldError(null);
    setApiError(null);

    if (!name.trim()) {
      setFieldError(t('animals.nameRequired'));
      return;
    }

    if (!farmId) {
      setApiError('No active farm selected. Please select a farm first.');
      return;
    }

    try {
      // Step 1: Create Animal Record
      const createdAnimal = await createAnimalMutation.mutateAsync({
        farmId,
        name: name.trim(),
        tagNumber: tagNumber.trim() || undefined,
        species,
        breed: breed.trim() || undefined,
        gender: gender as 'FEMALE' | 'MALE',
        dateOfBirth: dateOfBirth.trim() || undefined,
      });

      // Step 2: Assign Smart Collar if selected
      if (selectedDeviceId && createdAnimal?.id) {
        try {
          await assignDeviceMutation.mutateAsync({
            deviceId: selectedDeviceId,
            animalId: createdAnimal.id,
          });
        } catch {
          // Animal created successfully, but collar pairing failed
          setCreatedAnimalId(createdAnimal.id);
          setCollarAssignFailed(true);
          setApiError(t('animals.collarAssignFailed'));
          return;
        }
      }

      // Success for both steps
      handleClose();
    } catch (err: any) {
      if (err?.status === 409 || err?.code === 'DUPLICATE_RESOURCE') {
        setApiError(t('animals.duplicateTagError'));
      } else {
        setApiError(err?.message || t('auth.errors.unexpectedError'));
      }
    }
  };

  const isSubmitting = createAnimalMutation.isPending || assignDeviceMutation.isPending;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleCol}>
              <AppText variant="h2" weight="bold" style={styles.headerTitle}>
                {t('animals.registerTitle')}
              </AppText>
              <AppText variant="caption" style={styles.headerSubtitle}>
                {t('animals.registerSubtitle')}
              </AppText>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose} hitSlop={12}>
              <X size={20} color={theme.colors.neutral[700]} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Error Banners */}
            {fieldError && (
              <GlassCard variant="tinted" padding="sm" style={styles.errorBanner}>
                <View style={styles.errorRow}>
                  <AlertTriangle size={16} color={theme.colors.status.error} />
                  <AppText variant="caption" style={styles.errorText}>
                    {fieldError}
                  </AppText>
                </View>
              </GlassCard>
            )}

            {apiError && (
              <GlassCard variant="tinted" padding="sm" style={styles.errorBanner}>
                <View style={styles.errorRow}>
                  <AlertTriangle size={16} color={theme.colors.status.error} />
                  <AppText variant="caption" style={styles.errorText}>
                    {apiError}
                  </AppText>
                </View>
              </GlassCard>
            )}

            {/* Collar Assignment Failure Recovery View */}
            {collarAssignFailed ? (
              <GlassCard variant="tinted" padding="md" style={styles.recoveryCard}>
                <View style={styles.recoveryRow}>
                  <CheckCircle2 size={24} color={theme.colors.status.success} />
                  <View style={styles.recoveryTextCol}>
                    <AppText variant="label" weight="bold" style={{ color: theme.colors.primary[900] }}>
                      {t('animals.createdSuccess')}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.colors.neutral[700], marginTop: 2 }}>
                      {t('animals.collarAssignFailed')}
                    </AppText>
                  </View>
                </View>
                <GlassButton
                  title={t('animals.retryAssignCollar')}
                  onPress={handleRetryAssignCollar}
                  loading={isSubmitting}
                  variant="primary"
                  style={{ marginTop: theme.spacing.md }}
                />
              </GlassCard>
            ) : (
              <>
                {/* Animal Name (Required) */}
                <AppInput
                  label={`${t('animals.nameLabel')} *`}
                  placeholder={t('animals.namePlaceholder')}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />

                {/* Species Selector */}
                <View style={styles.fieldGroup}>
                  <AppText variant="caption" weight="semibold" style={styles.fieldLabel}>
                    {t('animals.speciesLabel')}
                  </AppText>
                  <View style={styles.segmentedRow}>
                    <TouchableOpacity
                      style={[styles.segmentBtn, species === 'CATTLE' && styles.segmentBtnActive]}
                      onPress={() => setSpecies('CATTLE')}
                    >
                      <AppText
                        variant="caption"
                        weight="bold"
                        style={[styles.segmentText, species === 'CATTLE' && styles.segmentTextActive]}
                      >
                        🐄 {t('animals.speciesCattle')}
                      </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.segmentBtn, species === 'BUFFALO' && styles.segmentBtnActive]}
                      onPress={() => setSpecies('BUFFALO')}
                    >
                      <AppText
                        variant="caption"
                        weight="bold"
                        style={[styles.segmentText, species === 'BUFFALO' && styles.segmentTextActive]}
                      >
                        🐃 {t('animals.speciesBuffalo')}
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Tag Number / Ear Tag (Optional) */}
                <AppInput
                  label={t('animals.tagLabel')}
                  placeholder={t('animals.tagPlaceholder')}
                  value={tagNumber}
                  onChangeText={setTagNumber}
                  autoCapitalize="characters"
                  leftIcon={<Tag size={16} color={theme.colors.neutral[400]} />}
                />

                {/* Breed & Gender Row */}
                <View style={styles.twoColRow}>
                  <View style={styles.col}>
                    <AppInput
                      label={t('animals.breedLabel')}
                      placeholder={t('animals.breedPlaceholder')}
                      value={breed}
                      onChangeText={setBreed}
                    />
                  </View>
                  <View style={styles.col}>
                    <AppText variant="caption" weight="semibold" style={styles.fieldLabel}>
                      {t('animals.genderLabel')}
                    </AppText>
                    <View style={styles.genderRow}>
                      <TouchableOpacity
                        style={[styles.genderBtn, gender === 'FEMALE' && styles.genderBtnActive]}
                        onPress={() => setGender('FEMALE')}
                      >
                        <AppText
                          variant="caption"
                          weight="bold"
                          style={[styles.genderText, gender === 'FEMALE' && styles.genderTextActive]}
                        >
                          {t('animals.genderFemale')}
                        </AppText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.genderBtn, gender === 'MALE' && styles.genderBtnActive]}
                        onPress={() => setGender('MALE')}
                      >
                        <AppText
                          variant="caption"
                          weight="bold"
                          style={[styles.genderText, gender === 'MALE' && styles.genderTextActive]}
                        >
                          {t('animals.genderMale')}
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Date of Birth (Optional) */}
                <AppInput
                  label={t('animals.dobLabel')}
                  placeholder={t('animals.dobPlaceholder')}
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                />

                {/* Smart Collar Pairing Section (Optional) */}
                <View style={styles.fieldGroup}>
                  <View style={styles.labelWithIcon}>
                    <Cpu size={16} color={theme.colors.primary[700]} />
                    <AppText variant="caption" weight="semibold" style={[styles.fieldLabel, { marginBottom: 0 }]}>
                      {t('animals.collarLabel')}
                    </AppText>
                  </View>

                  {isLoadingDevices ? (
                    <ActivityIndicator size="small" color={theme.colors.primary[600]} style={{ marginVertical: 8 }} />
                  ) : (
                    <View style={styles.collarPillsContainer}>
                      {/* No Collar Pill */}
                      <TouchableOpacity
                        style={[styles.collarPill, selectedDeviceId === null && styles.collarPillActive]}
                        onPress={() => setSelectedDeviceId(null)}
                      >
                        <AppText
                          variant="caption"
                          weight="medium"
                          style={[styles.collarPillText, selectedDeviceId === null && styles.collarPillTextActive]}
                        >
                          {t('animals.noCollar')}
                        </AppText>
                      </TouchableOpacity>

                      {/* Unassigned Devices List */}
                      {unassignedDevices.map((dev) => (
                        <TouchableOpacity
                          key={dev.id}
                          style={[styles.collarPill, selectedDeviceId === dev.id && styles.collarPillActive]}
                          onPress={() => setSelectedDeviceId(selectedDeviceId === dev.id ? null : dev.id)}
                        >
                          <AppText
                            variant="caption"
                            weight="bold"
                            style={[styles.collarPillText, selectedDeviceId === dev.id && styles.collarPillTextActive]}
                          >
                            📡 {dev.deviceIdentifier}
                          </AppText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Submit Action Button */}
                <GlassButton
                  title={t('animals.submitBtn')}
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  variant="primary"
                  size="lg"
                  style={styles.submitBtn}
                />
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: theme.borderRadius.xl * 1.5,
    borderTopRightRadius: theme.borderRadius.xl * 1.5,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    maxHeight: '90%',
    ...theme.shadows.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  headerTitleCol: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    color: theme.colors.neutral[900],
    fontSize: 20,
  },
  headerSubtitle: {
    color: theme.colors.neutral[500],
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    marginBottom: theme.spacing.sm,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  errorText: {
    color: theme.colors.status.error,
    fontSize: 12,
    flex: 1,
  },
  recoveryCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  recoveryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  recoveryTextCol: {
    flex: 1,
  },
  fieldGroup: {
    marginBottom: theme.spacing.md,
  },
  fieldLabel: {
    color: theme.colors.neutral[700],
    marginBottom: 6,
    fontSize: 12,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.neutral[100],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  segmentBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: theme.colors.primary[500],
  },
  segmentText: {
    color: theme.colors.neutral[600],
  },
  segmentTextActive: {
    color: theme.colors.primary[800],
  },
  twoColRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  col: {
    flex: 1,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 4,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.neutral[100],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  genderBtnActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  genderText: {
    color: theme.colors.neutral[600],
    fontSize: 11,
  },
  genderTextActive: {
    color: '#FFFFFF',
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  collarPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  collarPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.neutral[100],
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  collarPillActive: {
    backgroundColor: theme.colors.primary[800],
    borderColor: theme.colors.primary[800],
  },
  collarPillText: {
    color: theme.colors.neutral[700],
    fontSize: 12,
  },
  collarPillTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
});
