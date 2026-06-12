
'use client'

import { Suspense, useState } from 'react'
import { LoginForm } from './loginForm'

export default function LoginPage() {
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
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setUserType('buyer')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === 'buyer'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Acheteur
          </button>
          <button
            type="button"
            onClick={() => setUserType('vendor')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === 'vendor'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Fournisseur
          </button>
        </div>

        <Suspense fallback={<div className="h-48 bg-gray-50 rounded-xl animate-pulse" />}>
          <LoginForm userType={userType} />
        </Suspense>

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