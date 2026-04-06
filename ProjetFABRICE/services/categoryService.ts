import api from '../lib/axios';
import { Category } from '@/types/Category';

export const  categoryService ={

      getAll: async (): Promise<Category[]> => {
        const reponse = await api.get<{data:Category[]}>('/categories');
        
        // Si l'API retourne { data: [...] } ou directement [...]
        const data = reponse.data.data || reponse.data;
        return Array.isArray(data) ? data : [];
    },

    getOne : async (id:number | string ):Promise  <Category> =>{
        const response=await api.get <{data:Category}>(`/categories/${id}`)
        return response.data.data;
    },

    // Dans categoryService.ts
    create: async (data: Partial<Category>): Promise<Category> => {
        const reponse = await api.post('/categories', data);
        // Ton contrôleur Laravel renvoie { message: "...", data: {...} }
        // Donc on retourne reponse.data.data
        return reponse.data.data;
    },

    update: async (id: number | string, data: Partial<Category>): Promise<Category> => {
        const response = await api.put(`/categories/${id}`, data);
        return response.data.data;
    },

    delete: async (id:number): Promise <void> =>{
        await api.delete (`/categories/${id}`)
    }
}