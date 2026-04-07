import api from '../lib/axios';

// Types pour l'autocomplétion (à adapter selon les besoins exacts du backend)
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  role: 'acheteur' | 'vendeur';
}

export const authService = {
  async csrf() {
    return api.get('http://localhost:8000/sanctum/csrf-cookie');
  },

  async login(credentials: LoginCredentials) {
    await this.csrf();
    const response = await api.post('/login', credentials);
    
    // Si le backend renvoie access_token, on le stocke
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
    return response.data;
  },

  async register(data: RegisterData) {
    await this.csrf();
    const response = await api.post('/register', data);
    
    // Souvent, l'inscription connecte aussi l'utilisateur
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
    return response.data;
  },

  async logout() {
    await api.post('/logout');
    localStorage.removeItem('token'); // On nettoie le token
    window.location.href = '/login';   // Redirection propre
  },

  async getMe() {
    // L'intercepteur dans lib/axios.ts s'occupera d'ajouter le Bearer Token
    return api.get('/me');
  }
};