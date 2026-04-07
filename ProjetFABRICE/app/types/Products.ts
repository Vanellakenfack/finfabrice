import  {Category} from './Category';

export interface Products {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  quantity: number;
  images: string | null; // URL de l'image (nom pluriel mais une seule valeur)
  category: Category | string;
  seller?: {
    id: number;
    name: string;
  };
  is_active: boolean;
  created_at: string;
}

export interface CreateProductRequest {
  name: string;
  category_id: number;
  description: string;
  price: number;
  quantity: number;
  images?: File; // Fichier image unique pour l'upload (nom pluriel mais une seule valeur)
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}