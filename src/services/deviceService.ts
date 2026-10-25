import { HttpClient } from './httpClient';
import { Device } from '../types';

export class DeviceService {
  public static async getDevicesByFarm(farmId: string): Promise<Device[]> {
    const response = await HttpClient.get<Device[]>(`/devices/farm/${farmId}`);
    return response.data || [];
  }

  public static async getDeviceForAnimal(animalId: string): Promise<Device | null> {
    try {
      const response = await HttpClient.get<Device>(`/devices/animal/${animalId}`);
      if (response.status === 204 || !response.data || !response.data.id) {
        return null;
      }
      return response.data;
    } catch (err: any) {
      if (err.status === 204) return null;
      throw err;
    }
  }

  public static async registerDevice(payload: {
    deviceIdentifier: string;
    apiKey: string;
    farmId: string;
    animalId?: string;
  }): Promise<Device> {
    const response = await HttpClient.post<Device>('/devices/register', payload);
    return response.data;
  }

  public static async assignDevice(deviceId: string, animalId: string | null): Promise<Device> {
    const response = await HttpClient.put<Device>(`/devices/${deviceId}/assign`, { animalId });
    return response.data;
  }
}
