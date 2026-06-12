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
  async login(credentials: LoginCredentials) {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await api.post('/register', data);
    return response.data;
  },

  async logout() {
    await api.post('/logout');
    // Le backend supprime le cookie auth_token.
    window.location.href = '/login';
  },

  async getMe() {
    // L'intercepteur dans lib/axios.ts s'occupera d'ajouter le Bearer Token
    return api.get('/me');
  }
};