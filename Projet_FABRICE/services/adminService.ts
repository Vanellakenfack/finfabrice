import api from '../lib/axios';

export interface AdminKpis {
  users: number;
  products: number;
  categories: number;
  orders: number;
  revenue: number;
  pending_orders: number;
  low_stock: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  quantity: number;
  category: string | null;
  price: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders_count: number;
}

export interface ActivityItem {
  type: 'order' | 'user';
  at: string;
  // order fields
  reference?: string;
  user?: string;
  amount?: number;
  status?: string;
  // user fields
  name?: string;
  email?: string;
  role?: string;
}

export interface AdminStats {
  kpis: AdminKpis;
  low_stock_products: LowStockProduct[];
  monthly_revenue: MonthlyRevenue[];
  orders_by_status: Record<string, number>;
  recent_activity: ActivityItem[];
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const res = await api.get<AdminStats>('/admin/stats');
    return res.data;
  },

  toggleUser: async (id: number): Promise<{ statut: string }> => {
    const res = await api.patch(`/users/${id}/toggle`);
    return res.data;
  },

  toggleProduct: async (id: number): Promise<{ is_active: boolean }> => {
    const res = await api.patch(`/products/${id}/toggle`);
    return res.data;
  },

  getAdminProducts: async (params: {
    search?: string;
    category_id?: number;
    low_stock?: boolean;
    is_active?: boolean;
    page?: number;
  } = {}): Promise<{ data: any[]; meta: any }> => {
    const res = await api.get('/admin/products', { params });
    return { data: res.data.data ?? res.data, meta: res.data.meta ?? null };
  },
};
