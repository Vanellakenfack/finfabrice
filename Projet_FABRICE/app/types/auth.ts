export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'acheteur' | 'fournisseur' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'acheteur' | 'fournisseur';
  companyName?: string;
}