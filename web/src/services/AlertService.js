import api from './api.js';

export async function getAlerts(farmerId = 1) {
  const response = await api.get(`/alerts/farmer/${farmerId}`);
  return response.data;
}

export async function markAlertAsRead(alertId) {
  await api.put(`/alerts/${alertId}/read`);
  return true;
}
