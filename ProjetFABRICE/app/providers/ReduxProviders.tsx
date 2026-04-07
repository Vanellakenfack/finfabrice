'use client'

import { store } from '@/Data/index'
import { Provider } from 'react-redux'

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}