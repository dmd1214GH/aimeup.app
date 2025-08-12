import React from 'react'
import { QueryProvider } from './QueryProvider'
import { ReduxProvider } from './ReduxProvider'

interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReduxProvider>
      <QueryProvider>
        {children}
      </QueryProvider>
    </ReduxProvider>
  )
}