import api from './api.js';

export async function getReportsByAnimal(animalId) {
  const response = await api.get(`/reports/animal/${animalId}`);
  return response.data;
}
