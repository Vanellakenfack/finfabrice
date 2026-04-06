import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
});

// --- AJOUT DE L'INTERCEPTEUR ---
api.interceptors.request.use((config) => {
  // On récupère le token stocké lors du login
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (token) {
    // On l'ajoute au format Bearer Token attendu par Laravel
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;