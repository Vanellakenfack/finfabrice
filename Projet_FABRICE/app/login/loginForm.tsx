'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { authService } from '../../services/auth.service'
import { setCredentials, authStart, authFailure } from '../Data/slices/authSlice'
import { useToast } from '../componets/ui/toast'

export const LoginForm = ({ userType }: { userType?: string }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [credentials, setLocalCredentials] = useState({
    email: '',
    password: '',
  })

  const dispatch = useDispatch()
  const { addToast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    dispatch(authStart())
    
    if (!credentials.email || !credentials.password) {
      const msg = 'Veuillez remplir tous les champs'
      setError(msg)
      dispatch(authFailure(msg))
      setIsLoading(false)
      return
    }

    try {
      // 1. Appel de l'API Laravel
      const loginData = await authService.login(credentials)

      const userData = loginData.user || loginData.data?.user

      if (!userData) {
        throw new Error("Le serveur n'a pas renvoyé les données utilisateur.")
      }

      // Le token est dans un cookie HttpOnly — on stocke uniquement le profil utilisateur.
      dispatch(setCredentials({ user: userData, token: null }))
      
      addToast('Connexion réussie ! Bienvenue sur Fabrice.', 'success')
      
      // 4. Détermination du rôle (vérification dans le tableau roles)
      const userRoles = userData?.roles || []
      const isAdmin = userRoles.includes('admin')
      const isVendeur = userRoles.includes('vendeur') || userRoles.includes('fournisseur')

      if (redirectTo) {
        router.push(redirectTo)
      } else if (isAdmin) {
        router.push('/Dashbord')
      } else if (isVendeur) {
        router.push('/fournisseur')
      } else {
        router.push('/acheteur')
      }
      
    } catch (err: any) {
      const errorMsg = 'Email ou mot de passe incorrect.'
      setError(errorMsg)
      dispatch(authFailure(errorMsg))
      addToast(errorMsg, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLocalCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Connexion</h2>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresse email
          </label>
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="votre@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Votre mot de passe"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold shadow-md active:scale-[0.98]"
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <a href="/register" className="text-blue-600 hover:underline font-medium">
            S'inscrire
          </a>
        </p>
      </div>
    </div>
  )
}