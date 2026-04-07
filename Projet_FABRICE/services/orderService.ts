import api from '../lib/axios';

export interface OrderItem {
  product_id: number;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  shipping_address: string;
  payment_method: string;
}

export interface Order {
  id: number;
  reference: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  shipping_address: string;
  payment_method: string;
  created_at: string;
  items: {
    id: number;
    product_id: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
      images: string[];
    };
  }[];
}

export const orderService = {
  getAll: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data.data || response.data;
  },

  getOne: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (data: CreateOrderRequest): Promise<{ message: string; order: Order }> => {
    const response = await api.post('/orders', data);
    return response.data;
  },
};
