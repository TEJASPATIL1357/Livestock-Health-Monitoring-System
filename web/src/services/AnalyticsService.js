import api from './api.js';
import { mockAnimals, mockAlerts } from '../../../shared/mockData.js';

export async function getDashboardAnalytics() {
  try {
    const response = await api.get('/analytics/dashboard');
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.warn('Failed to fetch dashboard analytics from backend, computing local fallback:', error);
  }

  // Calculate stats locally from mock data
  const totalAnimals = mockAnimals.length;
  const healthyCount = mockAnimals.filter(a => a.healthStatus === 'healthy').length;
  const atRiskCount = mockAnimals.filter(a => a.healthStatus !== 'healthy').length;
  const avgMilkYield = totalAnimals > 0
    ? +(mockAnimals.reduce((sum, a) => sum + a.milkYield, 0) / totalAnimals).toFixed(1)
    : 0;
  const unreadAlerts = mockAlerts.filter(a => !a.read).length;

  return {
    status: 'Running (Mock Mode)',
    totalAnimals,
    healthyCount,
    atRiskCount,
    avgMilkYield,
    unreadAlerts,
  };
}
