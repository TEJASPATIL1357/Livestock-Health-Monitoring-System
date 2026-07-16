import api from './api.js';

export async function logMilkProduction(milkData) {
  const response = await api.post('/milk', milkData);
  return response.data;
}

export async function getMilkStats(animalId) {
  const response = await api.get(`/milk/animal/${animalId}`);
  return response.data;
}
