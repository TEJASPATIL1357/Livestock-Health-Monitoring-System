import { HttpClient } from './httpClient';
import { AlertItem } from '../types';

export class AlertService {
  public static async getAlertsByFarm(farmId: string): Promise<AlertItem[]> {
    const response = await HttpClient.get<AlertItem[]>(`/alerts/farm/${farmId}`);
    return response.data || [];
  }

  public static async getUnreadCount(farmId: string): Promise<number> {
    const response = await HttpClient.get<{ unreadCount: number }>(`/alerts/farm/${farmId}/unread-count`);
    return response.data?.unreadCount || 0;
  }

  public static async markAsRead(alertId: string): Promise<AlertItem> {
    const response = await HttpClient.request<AlertItem>(`/alerts/${alertId}/read`, 'PATCH');
    return response.data;
  }
}
