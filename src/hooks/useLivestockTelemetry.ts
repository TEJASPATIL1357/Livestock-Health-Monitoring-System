import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimalService } from '../services/animalService';
import { TelemetryService } from '../services/telemetryService';
import { AiService } from '../services/aiService';
import { AlertService } from '../services/alertService';
import { DeviceService } from '../services/deviceService';
import { CreateAnimalPayload } from '../types';

export const useAnimalsQuery = (farmId?: string) => {
  return useQuery({
    queryKey: ['animals', farmId],
    queryFn: async () => {
      if (!farmId) return [];
      return AnimalService.getAnimalsByFarm(farmId);
    },
    enabled: Boolean(farmId),
  });
};

export const TELEMETRY_REFETCH_INTERVAL = 1000;

export const useTelemetryQuery = (animalId?: string) => {
  return useQuery({
    queryKey: ['telemetry', animalId],
    queryFn: async () => {
      if (!animalId) return null;
      return TelemetryService.getLatestTelemetry(animalId);
    },
    enabled: Boolean(animalId),
    refetchInterval: TELEMETRY_REFETCH_INTERVAL, // Refetch every 1 second (1000ms) while active on screen
    refetchIntervalInBackground: false,
    placeholderData: (previousData) => previousData,
    staleTime: 500,
  });
};

export const useAiAssessmentQuery = (animalId?: string) => {
  return useQuery({
    queryKey: ['aiAssessment', animalId],
    queryFn: async () => {
      if (!animalId) return null;
      return AiService.getLatestAssessment(animalId);
    },
    enabled: Boolean(animalId),
  });
};

export const useAlertsQuery = (farmId?: string) => {
  return useQuery({
    queryKey: ['alerts', farmId],
    queryFn: async () => {
      if (!farmId) return [];
      return AlertService.getAlertsByFarm(farmId);
    },
    enabled: Boolean(farmId),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useUnreadAlertsCountQuery = (farmId?: string) => {
  return useQuery({
    queryKey: ['alerts', 'unreadCount', farmId],
    queryFn: async () => {
      if (!farmId) return 0;
      return AlertService.getUnreadCount(farmId);
    },
    enabled: Boolean(farmId),
    refetchInterval: 30000,
  });
};

export const useDeviceForAnimalQuery = (animalId?: string) => {
  return useQuery({
    queryKey: ['device', 'animal', animalId],
    queryFn: async () => {
      if (!animalId) return null;
      return DeviceService.getDeviceForAnimal(animalId);
    },
    enabled: Boolean(animalId),
  });
};

export const useFarmDevicesQuery = (farmId?: string) => {
  return useQuery({
    queryKey: ['devices', farmId],
    queryFn: async () => {
      if (!farmId) return [];
      return DeviceService.getDevicesByFarm(farmId);
    },
    enabled: Boolean(farmId),
  });
};

export const useUnassignedDevicesQuery = (farmId?: string) => {
  return useQuery({
    queryKey: ['devices', 'unassigned', farmId],
    queryFn: async () => {
      if (!farmId) return [];
      const devices = await DeviceService.getDevicesByFarm(farmId);
      // Offer only eligible, active, unassigned collars
      return devices.filter(
        (d) =>
          (!d.animalId || d.animalId === '' || d.animalId === 'null') &&
          d.status !== 'REVOKED'
      );
    },
    enabled: Boolean(farmId),
  });
};

export const useCreateAnimalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAnimalPayload) => AnimalService.createAnimal(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['animals', variables.farmId] });
    },
  });
};

export const useAssignDeviceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deviceId, animalId }: { deviceId: string; animalId: string | null }) =>
      DeviceService.assignDevice(deviceId, animalId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device'] });
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      if (data?.farmId) {
        queryClient.invalidateQueries({ queryKey: ['devices', data.farmId] });
        queryClient.invalidateQueries({ queryKey: ['devices', 'unassigned', data.farmId] });
        queryClient.invalidateQueries({ queryKey: ['animals', data.farmId] });
      }
      if (variables.animalId) {
        queryClient.invalidateQueries({ queryKey: ['device', 'animal', variables.animalId] });
      }
    },
  });
};
