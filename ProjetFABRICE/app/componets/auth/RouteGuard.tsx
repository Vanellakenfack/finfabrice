'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Interface temporaire pour éviter l'erreur
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'acheteur' | 'fournisseur' | 'admin'
  isVerified: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

// Données mockées temporaires - À remplacer par Redux
const mockAuthState: AuthState = {
  user: null, // Changez ceci pour tester différents rôles
  token: null,
  isLoading: false,
  error: null
}

// Exemples pour tester :
// user: { id: '1', email: 'test@test.com', firstName: 'John', lastName: 'Doe', role: 'acheteur', isVerified: true, createdAt: '2024-01-01' }
// user: { id: '2', email: 'vendeur@test.com', firstName: 'Jane', lastName: 'Smith', role: 'fournisseur', isVerified: true, createdAt: '2024-01-01' }
// user: { id: '3', email: 'admin@test.com', firstName: 'Admin', lastName: 'User', role: 'admin', isVerified: true, createdAt: '2024-01-01' }

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: 'acheteur' | 'fournisseur' | 'admin'
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requiredRole 
}) => {
  const router = useRouter()
  const { user, isLoading } = mockAuthState // Temporaire - À remplacer par useSelector

  useEffect(() => {
    if (!isLoading) {
      // Si l'utilisateur n'est pas connecté
      if (!user) {
        router.push('/login')
        return
      }

      // Si un rôle spécifique est requis mais que l'utilisateur ne l'a pas
      if (requiredRole && user.role !== requiredRole) {
        // Rediriger vers le dashboard approprié
        switch (user.role) {
          case 'acheteur':
            router.push('/Acheteur')
            break
          case 'fournisseur':
            router.push('/fournisseur/dashboard')
            break
          case 'admin':
            router.push('/admin/dashboard')
            break
          default:
            router.push('/login')
        }
        return
      }
    }
  }, [user, isLoading, requiredRole, router])

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Si l'utilisateur est connecté et a le bon rôle, afficher les enfants
  if (user && (!requiredRole || user.role === requiredRole)) {
    return <>{children}</>
  }

  // Par défaut, ne rien afficher (la redirection se fera)
  return null
}