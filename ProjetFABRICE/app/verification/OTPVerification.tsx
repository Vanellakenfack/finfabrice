'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'

import { verifyOTPStart, verifyOTPSuccess, verifyOTPFailure } from '@/Data/slices/authSlice'
import { RootState } from '@/Data'

interface OTPVerificationProps {
  type: 'email' | 'phone'
  contact: string
  onVerify: () => void
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  type,
  contact,
  onVerify,
}) => {
  const dispatch = useDispatch()
  const router = useRouter()
  const { isLoading, error } = useSelector((state: RootState) => state.auth)

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState<number>(60)
  const [canResend, setCanResend] = useState<boolean>(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown pour renvoyer le code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Passer au champ suivant
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Soumettre automatiquement si tous les champs sont remplis
    if (newOtp.every((digit) => digit !== '') && index === 5) {
      handleVerify()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      dispatch(verifyOTPFailure('Veuillez saisir les 6 chiffres du code'))
      return
    }

    try {
      dispatch(verifyOTPStart())

      // Simulation d'appel API (2 secondes)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simuler la validation du code OTP
      console.log('Code OTP soumis:', otpCode, 'pour', contact)

      // Simulation d’une réponse du backend
      const fakeUser = {
        id: '1',
        email: type === 'email' ? contact : 'test@exemple.com',
        firstName: 'Utilisateur',
        lastName: 'Test',
        role: 'acheteur' as const,
        isVerified: true,
        createdAt: new Date().toISOString(),
      }

      const fakeToken = 'fake-jwt-token-12345'

      dispatch(verifyOTPSuccess({ user: fakeUser, token: fakeToken }))

      onVerify()
      router.push('/dashboard')
    } catch (err) {
      dispatch(verifyOTPFailure('Code OTP invalide'))
    }
  }

  const handleResendCode = () => {
    setCountdown(60)
    setCanResend(false)
    setOtp(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()

    // Logique pour renvoyer le code
    console.log('Renvoyer le code à:', contact)
  }

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '0 auto',
        padding: '24px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
        Vérification {type === 'email' ? 'Email' : 'Téléphone'}
      </h2>

      <p style={{ marginBottom: '24px', color: '#6b7280' }}>
        Nous avons envoyé un code à 6 chiffres à {contact}
      </p>

      {/* Champs OTP */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          justifyContent: 'center',
        }}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {inputRefs.current[index] = el}}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            style={{
              width: '40px',
              height: '48px',
              textAlign: 'center',
              fontSize: '18px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              outline: 'none',
            }}
          />
        ))}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div
          style={{
            color: '#ef4444',
            marginBottom: '16px',
            padding: '8px',
            backgroundColor: '#fef2f2',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      {/* Boutons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={handleVerify}
          disabled={isLoading || otp.join('').length !== 6}
          style={{
            padding: '12px 24px',
            backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Vérification...' : 'Vérifier le code'}
        </button>

        <button
          onClick={handleResendCode}
          disabled={!canResend || isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: !canResend ? '#9ca3af' : '#3b82f6',
            border: 'none',
            cursor: !canResend ? 'not-allowed' : 'pointer',
          }}
        >
          {canResend ? 'Renvoyer le code' : `Renvoyer dans ${countdown}s`}
        </button>
      </div>
    </div>
  )
}
