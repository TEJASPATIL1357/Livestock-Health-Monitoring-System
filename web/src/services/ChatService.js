import api from './api.js';

export async function sendChatMessage(message, language = 'en', farmerId = 1, animalId = null) {
  const response = await api.post('/chat/message', {
    farmerId,
    animalId,
    message,
    language
  });
  return {
    response: response.data,
    lang: language
  };
}
