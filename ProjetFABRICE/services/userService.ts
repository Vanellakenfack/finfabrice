import api from '../lib/axios';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  statut: 'Actif' | 'Inactif';
  date_inscription: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  statut?: 'Actif' | 'Inactif';
}

export const userService = {
  // Récupérer tous les utilisateurs
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data.users;
  },

  // Récupérer un utilisateur par ID
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data.user;
  },

  // Créer un utilisateur
  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data.user;
  },

  // Mettre à jour un utilisateur
  update: async (id: number, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data.user;
  },

  // Supprimer un utilisateur
  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};
