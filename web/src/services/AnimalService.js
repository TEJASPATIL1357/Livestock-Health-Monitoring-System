import api from './api.js';

export async function getAnimals(farmerId = 1) {
  const response = await api.get(`/animals/farmer/${farmerId}`);
  return response.data;
}

export async function getAnimalById(id) {
  const response = await api.get(`/animals/${id}`);
  return response.data;
}

export async function createAnimal(animalDto) {
  const response = await api.post('/animals', animalDto);
  return response.data;
}
