import axios from 'axios';

const chatbotClient = axios.create({
  baseURL: import.meta.env.VITE_CHATBOT_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default chatbotClient;