import {Products, CreateProductRequest} from '../app/types/Products'


import api from '../lib/axios';

type Paginated <T> = {data:T[]; meta?: any;links:any}
export const productService ={

    getAll: async ():Promise <Products[]> =>{
        const reponse = await api.get <Paginated <Products> | Products[] >('/products');
        const result = Array.isArray( reponse.data)? reponse.data:reponse.data.data ?? [];
        return result;
    },

    getOne : async (id:number | string ):Promise  <Products> =>{
        const response=await api.get <Products>(`/products/${id}`)
        return response.data
    },

    create: async (data: CreateProductRequest): Promise<Products> => {
        // Pour l'upload d'images, on utilise FormData
        const formData = new FormData();
        
        // DEBUG
        
        // Ajouter les champs texte
        formData.append('name', data.name);
        formData.append('category_id', data.category_id.toString());
        formData.append('description', data.description);
        formData.append('price', data.price.toString());
        formData.append('quantity', data.quantity.toString());
        
        // Ajouter une seule image si présente
        if (data.images) {
            formData.append('images', data.images);
        } 
        
        const response = await api.post('/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        
        
        return response.data.product;
    },

    update: async (id: number | string, data: Partial<Products> & { images?: File }): Promise<Products> => {
        // Si une image est présente, utiliser FormData
        if (data.images) {
            const formData = new FormData();
            formData.append('name', data.name || '');
            formData.append('category_id', data.category_id?.toString() || '');
            formData.append('description', data.description || '');
            formData.append('price', data.price?.toString() || '');
            formData.append('quantity', data.quantity?.toString() || '');
            formData.append('images', data.images);
            
            const response = await api.post(`/products/${id}?_method=PUT`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            return response.data.product;
        }
        
        // Sinon, utiliser JSON standard
        const response = await api.put(`/products/${id}`, data);
        return response.data.product;
    },

    delete: async (id:number): Promise <void> =>{
        await api.delete (`/products/${id}`)
    }
}