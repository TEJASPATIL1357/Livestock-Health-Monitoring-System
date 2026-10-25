import { HttpClient } from './httpClient';
import { CreateFarmPayload, Farm, FarmMembership } from '../types';

export interface FarmServiceContract {
  createFarm(payload: CreateFarmPayload): Promise<Farm>;
  getMyFarms(): Promise<FarmMembership[]>;
  getFarm(id: string): Promise<Farm>;
}

class FarmServiceAdapter implements FarmServiceContract {
  async createFarm(payload: CreateFarmPayload): Promise<Farm> {
    const response = await HttpClient.post<Farm>('/farms', {
      name: payload.name.trim(),
      district: payload.district?.trim() || undefined,
      state: payload.state?.trim() || undefined,
      country: payload.country?.trim() || 'India',
      livestockType: payload.livestockType || 'DAIRY',
    });
    return response.data;
  }

  async getMyFarms(): Promise<FarmMembership[]> {
    const response = await HttpClient.get<FarmMembership[]>('/farms/me');
    return response.data;
  }

  async getFarm(id: string): Promise<Farm> {
    const response = await HttpClient.get<Farm>(`/farms/${id}`);
    return response.data;
  }
}

export const FarmService: FarmServiceContract = new FarmServiceAdapter();
