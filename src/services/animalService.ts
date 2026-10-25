import { HttpClient } from './httpClient';
import { Animal, CreateAnimalPayload } from '../types';

export class AnimalService {
  public static async getAnimalsByFarm(farmId: string): Promise<Animal[]> {
    const response = await HttpClient.get<Animal[]>(`/animals/farm/${farmId}`);
    return response.data;
  }

  public static async getAnimalById(id: string): Promise<Animal> {
    const response = await HttpClient.get<Animal>(`/animals/${id}`);
    return response.data;
  }

  public static async createAnimal(payload: CreateAnimalPayload): Promise<Animal> {
    const response = await HttpClient.post<Animal>('/animals', payload);
    return response.data;
  }
}
