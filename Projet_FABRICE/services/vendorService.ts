import api from '../lib/axios';

export interface VendorKpis {
  total_products: number;
  active_products: number;
  low_stock: number;
  monthly_sales: number;
  monthly_revenue: number;
  pending_orders: number;
}

export interface TopProduct {
  id: number;
  name: string;
  stock: number;
  price: number;
  total_sold: number;
  total_revenue: number;
}

export interface RecentOrder {
  id: number;
  reference: string;
  client: string;
  montant: number;
  statut: string;
  date: string;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  sales: number;
}

export interface VendorStats {
  kpis: VendorKpis;
  top_products: TopProduct[];
  recent_orders: RecentOrder[];
  monthly_revenue: MonthlyData[];
}

export const vendorService = {
  getStats: async (): Promise<VendorStats> => {
    const res = await api.get<VendorStats>('/vendor/stats');
    return res.data;
  },

  getMyProducts: async (params: {
    search?: string;
    category_id?: number | string;
    low_stock?: boolean;
    page?: number;
  } = {}): Promise<{ data: any[]; meta: any }> => {
    const res = await api.get('/vendor/products', { params });
    return { data: res.data.data ?? res.data, meta: res.data.meta ?? null };
  },
};
