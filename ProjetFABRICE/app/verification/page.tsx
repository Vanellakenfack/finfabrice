// src/app/auth/verification/page.tsx
'use client'

import { OTPVerification } from './OTPVerification'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerificationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const type = searchParams.get('type') as 'email' | 'phone' | null
  const contact = searchParams.get('contact')

  const handleVerificationSuccess = () => {
    console.log('Vérification OTP réussie!')
    // Redirection vers le dashboard
    router.push('/dashboard')
  }

  // Si les paramètres sont manquants, rediriger vers l'inscription
  if (!type || !contact) {
    router.push('/auth/signup')
    return null
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <OTPVerification 
          type={type}
          contact={contact}
          onVerify={handleVerificationSuccess}
        />
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Vous n'avez pas reçu le code?{' '}
            <a 
              href="/auth/signup" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Retour à l'inscription
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}