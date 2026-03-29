// src/app/auth/signup/page.tsx
'use client'

import { SignUpForm } from './SignUpForm'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUpPage() {
  const router = useRouter()
  const [verificationData, setVerificationData] = useState<{
    type: 'email' | 'phone'
    contact: string
  } | null>(null)

  const handleSuccess = (data?: { type: 'email' | 'phone'; contact: string }) => {
    console.log('Inscription réussie!')
    
    if (data) {
      // Redirection vers la page de vérification avec les données
      setVerificationData(data)
      router.push('/auth/verification?type=' + data.type + '&contact=' + encodeURIComponent(data.contact))
    } else {
      // Redirection directe vers le dashboard
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Rejoignez notre marketplace
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Créez votre compte en 2 minutes
          </p>
        </div>
        <SignUpForm onSuccess={handleSuccess} />
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte?{' '}
            <a 
              href="/login" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}