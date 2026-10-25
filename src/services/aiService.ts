import { HttpClient } from './httpClient';
import { AiAssessment } from '../types';

export class AiService {
  public static async getLatestAssessment(animalId: string): Promise<AiAssessment> {
    const response = await HttpClient.get<AiAssessment>(`/ai/assessment/animal/${animalId}`);
    return response.data;
  }
}
