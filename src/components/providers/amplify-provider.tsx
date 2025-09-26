'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Amplify } from 'aws-amplify'
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'
import { initializeAuth } from '@/stores/auth-store'
import { amplifyConfig, isAmplifyConfigured } from '@/lib/amplify'
import type { AuthProviderProps } from '@/types/auth'

/**
 * Amplify context interface
 */
interface AmplifyContextType {
  isConfigured: boolean
  isInitialized: boolean
  error: string | null
}

/**
 * Amplify context
 */
const AmplifyContext = createContext<AmplifyContextType>({
  isConfigured: false,
  isInitialized: false,
  error: null
})

/**
 * Hook to use Amplify context
 */
export const useAmplify = () => {
  const context = useContext(AmplifyContext)
  if (!context) {
    throw new Error('useAmplify must be used within AmplifyProvider')
  }
  return context
}

/**
 * Amplify Provider Component
 * Configures Amplify and initializes authentication state
 */
export const AmplifyProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeAmplify = async () => {
      try {
        // Check if Amplify is properly configured
        if (!isAmplifyConfigured()) {
          throw new Error('Amplify configuration is incomplete')
        }

        // Configure Amplify
        Amplify.configure(amplifyConfig)
        setIsConfigured(true)

        // Initialize authentication state
        await initializeAuth()
        setIsInitialized(true)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Amplify'
        setError(errorMessage)
        console.error('Amplify initialization error:', err)
      }
    }

    initializeAmplify()
  }, [])

  // Show error if initialization failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-4 p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Configuration Error
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">
              Please check your Amplify configuration and try again.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show loading spinner while initializing
  if (!isConfigured || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Initializing Application
            </h2>
            <p className="text-sm text-gray-600">
              {!isConfigured ? 'Configuring Amplify...' : 'Loading authentication...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const contextValue: AmplifyContextType = {
    isConfigured,
    isInitialized,
    error
  }

  return (
    <AmplifyContext.Provider value={contextValue}>
      {children}
    </AmplifyContext.Provider>
  )
}

/**
 * Higher-order component for Amplify configuration
 */
export const withAmplify = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <AmplifyProvider>
        <Component {...props} />
      </AmplifyProvider>
    )
  }

  WrappedComponent.displayName = `withAmplify(${Component.displayName || Component.name})`

  return WrappedComponent
}

/**
 * Authentication status checker component
 * Provides visual feedback for authentication state
 */
export const AuthStatusChecker: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<{
    isChecking: boolean
    isAuthenticated: boolean
    user: any
    error: string | null
  }>({
    isChecking: true,
    isAuthenticated: false,
    user: null,
    error: null
  })

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await getCurrentUser()
        const session = await fetchAuthSession()

        setAuthStatus({
          isChecking: false,
          isAuthenticated: true,
          user,
          error: null
        })
      } catch (error) {
        setAuthStatus({
          isChecking: false,
          isAuthenticated: false,
          user: null,
          error: error instanceof Error ? error.message : 'Authentication check failed'
        })
      }
    }

    checkAuthStatus()
  }, [])

  if (authStatus.isChecking) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        <span>Checking authentication...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div
        className={`w-2 h-2 rounded-full ${
          authStatus.isAuthenticated ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className={authStatus.isAuthenticated ? 'text-green-700' : 'text-red-700'}>
        {authStatus.isAuthenticated ? 'Authenticated' : 'Not authenticated'}
      </span>
      {authStatus.user && (
        <span className="text-gray-600">
          ({authStatus.user.username})
        </span>
      )}
    </div>
  )
}

export default AmplifyProvider