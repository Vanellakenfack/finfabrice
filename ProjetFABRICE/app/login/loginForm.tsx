'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { authService } from '../../services/auth.service'
import { setCredentials, authStart, authFailure } from '../Data/slices/authSlice'

export const LoginForm = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [credentials, setLocalCredentials] = useState({
    email: '',
    password: '',
  })

  const dispatch = useDispatch()

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
      console.log("LoginData reçu:", loginData)
      
      // Extraction sécurisée du token et de l'user
      // On gère les deux cas : si c'est directement dans l'objet ou dans .data
      const token = loginData.access_token || loginData.data?.access_token
      const userData = loginData.user || loginData.data?.user
      
      if (!token) {
        throw new Error("Le serveur n'a pas renvoyé de jeton d'accès.")
      }

      // 2. Stockage du token
      localStorage.setItem('token', token)
      
      // 3. Mise à jour de Redux
      dispatch(setCredentials({ user: userData, token }))
      
      // 4. Détermination du rôle
      const role = userData?.role || 'acheteur'
      console.log('Rôle détecté:', role)

      // 5. Redirection selon le rôle
      switch (role) {
        case 'acheteur':
          router.push('/acheteur')
          break
        // case 'vendeur':
        // case 'fournisseur':
        //   router.push('/fournisseur')
        //   break

        case 'admin':
          router.push('/Dashbord')
          break
        default:
          console.warn('Rôle non reconnu, redirection vers /acheteur')
          router.push('/acheteur')
      }
      
    } catch (err: any) {
      console.error("Erreur de connexion détaillée:", err)
      
      // CORRECTION SYNTAXE ICI
      const errorMsg = err.response?.data?.message || 'Email ou mot de passe incorrect'
      setError(errorMsg)
      dispatch(authFailure(errorMsg))
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center tracking-wide">Connexion</h2>
      
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

      
      </div>
    
  )
}