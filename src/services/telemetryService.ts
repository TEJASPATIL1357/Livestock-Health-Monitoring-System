import { HttpClient } from './httpClient';
import { SensorTelemetry } from '../types';

export class TelemetryService {
  public static async getLatestTelemetry(animalId: string): Promise<SensorTelemetry | null> {
    try {
      const response = await HttpClient.get<SensorTelemetry>(`/telemetry/latest/${animalId}`);
      if (response.status === 204 || !response.data || !response.data.id) {
        return null;
      }
      return response.data;
    } catch (err: any) {
      if (err.status === 204) return null;
      throw err;
    }
  }

  public static async getTelemetryHistory(animalId: string, limit = 20): Promise<SensorTelemetry[]> {
    const response = await HttpClient.get<SensorTelemetry[]>(`/telemetry/history/${animalId}?limit=${limit}`);
    return response.data || [];
  }
}
