import api from './api.js';

export async function getSensorDataByAnimal(animalId) {
  const response = await api.get(`/sensors/animal/${animalId}`);
  return response.data;
}

export async function getLatestSensorDataByAnimal(animalId) {
  const response = await api.get(`/sensors/animal/${animalId}/latest`);
  return response.data;
}
