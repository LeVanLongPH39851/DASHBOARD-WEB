import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;