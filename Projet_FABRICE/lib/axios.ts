import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Indispensable pour que le navigateur envoie le cookie auth_token HttpOnly
  withCredentials: true,
});

export default api;