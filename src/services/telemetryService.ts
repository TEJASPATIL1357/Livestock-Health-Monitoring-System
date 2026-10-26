import { HttpClient } from './httpClient';
import { SensorTelemetry } from '../types';

export class TelemetryService {
  private static latestTimestamps: Map<string, number> = new Map();
  private static latestCache: Map<string, SensorTelemetry> = new Map();

  public static async getLatestTelemetry(animalId: string): Promise<SensorTelemetry | null> {
    try {
      const response = await HttpClient.get<SensorTelemetry>(`/telemetry/latest/${animalId}`);
      if (response.status === 204 || !response.data || !response.data.id) {
        return null;
      }

      const incoming = response.data;
      const incomingTime = incoming.measuredAt ? new Date(incoming.measuredAt).getTime() : 0;
      const previousTime = TelemetryService.latestTimestamps.get(animalId) || 0;

      // Monotonicity guard: never allow older out-of-order telemetry to overwrite newer data
      if (incomingTime < previousTime) {
        const cached = TelemetryService.latestCache.get(animalId);
        if (cached) return cached;
      }

      if (incomingTime > 0) {
        TelemetryService.latestTimestamps.set(animalId, incomingTime);
      }
      TelemetryService.latestCache.set(animalId, incoming);
      return incoming;
    } catch (err: unknown) {
      const status = typeof err === 'object' && err !== null && 'status' in err ? (err as { status: number }).status : 0;
      if (status === 204) return null;

      // Preserve previous valid reading across transient polling hiccups
      const cached = TelemetryService.latestCache.get(animalId);
      if (cached) {
        return cached;
      }
      throw err;
    }
  }

  public static async getTelemetryHistory(animalId: string, limit = 20): Promise<SensorTelemetry[]> {
    const response = await HttpClient.get<SensorTelemetry[]>(`/telemetry/history/${animalId}?limit=${limit}`);
    return response.data || [];
  }
}

