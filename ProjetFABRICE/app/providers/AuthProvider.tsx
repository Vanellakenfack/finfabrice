'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { setUser, logout, authFailure } from '../Data/slices/authSlice';
import { RootState } from '../Data/index';

// Liste des routes publiques qui ne nécessitent pas de redirection vers /login
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/products',
  '/contact',
  '/about'
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  // 1. Hydratation de la session au chargement de l'application
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getMe();
        const userData = response.data.data || response.data;
        dispatch(setUser(userData));
      } catch (error) {
        // Si l'utilisateur n'est pas connecté (401), on vide Redux
        dispatch(logout());
      }
    };

    fetchUser();
  }, [dispatch]);

  // 2. Protection des routes : Redirection si non authentifié sur une route privée
  useEffect(() => {
    // Si on a fini de charger et qu'on n'est pas connecté
    if (!isLoading && !isAuthenticated) {
      // Vérifier si la route actuelle est protégée
      const isPublicRoute = PUBLIC_ROUTES.some(route => 
        pathname === route || pathname.startsWith(route + '/') && route !== '/'
      );

      if (!isPublicRoute) {
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, pathname, router]);


  return <>{children}</>;
}
