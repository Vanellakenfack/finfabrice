
'use client'

import { LoginForm } from './loginForm'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<'buyer' | 'vendor'>('buyer')

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Connectez-vous à votre compte
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Accédez à votre espace personnel
          </p>
        </div>

        {/* Sélecteur de type d'utilisateur */}
<LoginForm userType={userType} />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte?{' '}
            <a 
              href="/register" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              S'inscrire
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}