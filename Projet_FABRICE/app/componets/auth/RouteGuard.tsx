'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '../../Data/store'

// Interface temporaire pour éviter l'erreur
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: ('acheteur' | 'fournisseur' | 'admin')[]
  isVerified: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: 'acheteur' | 'fournisseur' | 'admin'
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requiredRole 
}) => {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!isLoading) {
      // Si l'utilisateur n'est pas connecté
      if (!isAuthenticated || !user) {
        router.push('/login')
        return
      }

      // Si un rôle spécifique est requis mais que l'utilisateur ne l'a pas
      if (requiredRole && user.roles && !user.roles.includes(requiredRole)) {
        // Rediriger vers le dashboard approprié selon le rôle
        if (user.roles.includes('admin')) {
          router.push('/Dashbord')
        } else if (user.roles.includes('fournisseur')) {
          router.push('/fournisseur/dashboard')
        } else if (user.roles.includes('acheteur')) {
          router.push('/Acheteur')
        } else {
          router.push('/login')
        }
        return
      }
    }
  }, [user, isAuthenticated, isLoading, requiredRole, router])

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Si l'utilisateur est connecté et a le bon rôle, afficher les enfants
  if (isAuthenticated && user && (!requiredRole || (user.roles && user.roles.includes(requiredRole)))) {
    return <>{children}</>
  }

  // Par défaut, ne rien afficher (la redirection se fera)
  return null
}