import { AnimalDataState, HealthState, UserRole } from '../types';

/**
 * State Semantics Helper
 *
 * CRITICAL DIRECTIVE:
 * Never infer a positive health state from the existence or count of animals.
 * Never fabricate telemetry, health readings, alerts, device connectivity,
 * or veterinary validation for UI demonstration.
 * If actual data is unavailable, render an explicit no-data/waiting state.
 */

export const getAnimalDataState = (animalCount: number, hasTelemetry = false): AnimalDataState => {
  if (animalCount === 0) {
    return 'NO_ANIMALS';
  }
  if (!hasTelemetry) {
    return 'ANIMALS_NO_DATA';
  }
  return 'RECEIVING_DATA';
};

export const getHealthState = (
  animalCount: number,
  hasTelemetry = false,
  activeAlertCount = 0
): HealthState => {
  if (animalCount === 0) {
    return 'NO_DATA';
  }
  if (!hasTelemetry) {
    return 'AWAITING_TELEMETRY';
  }
  if (activeAlertCount > 0) {
    return 'ATTENTION';
  }
  return 'HEALTHY';
};

export const formatUserRoleKey = (role?: UserRole): string => {
  switch (role) {
    case 'FARM_MANAGER':
      return 'auth.roleManager';
    case 'VETERINARIAN':
      return 'auth.roleVet';
    case 'FARMER':
      return 'auth.roleFarmer';
    case 'FARM_OWNER':
    default:
      return 'auth.roleOwner';
  }
};
