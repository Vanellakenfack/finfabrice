import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  roles?: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true, // true par défaut pour l'hydratation
  error: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Démarrage d'une requête d'authentification
    authStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    // Succès de la connexion ou récupération du profil
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload
    },
    authFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    // Déconnexion
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
    },
    // Clear errors
    clearError: (state) => {
      state.error = null
    },
    
    // Mise à jour du profil
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
})

export const {
  authStart,
  setCredentials,
  setUser,
  authFailure,
  logout,
  clearError,
  updateProfile,
} = authSlice.actions

export default authSlice.reducer