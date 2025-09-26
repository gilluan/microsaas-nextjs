import { useCallback, useEffect } from 'react'
import { useAuthStore, initializeAuth } from '@/stores/auth-store'
import { useUserStore } from '@/stores/user-store'
import { useActivityStore, subscribeToActivities } from '@/stores/activity-store'
import type {
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordResetConfirmation,
  EmailVerification,
  ChangePassword
} from '@/types/auth'

/**
 * Main authentication hook
 * Provides authentication state and operations
 */
export const useAuth = () => {
  const authStore = useAuthStore()
  const loadProfile = useUserStore((state) => state.loadProfile)
  const loadActivities = useActivityStore((state) => state.loadActivities)

  // Initialize authentication on mount
  useEffect(() => {
    initializeAuth()
  }, [])

  // Load user data when authenticated
  useEffect(() => {
    if (authStore.isAuthenticated && authStore.user) {
      // Load user profile and activities
      loadProfile().catch(console.error)
      loadActivities(true).catch(console.error)

      // Subscribe to real-time activities
      const subscription = subscribeToActivities()

      return () => {
        subscription?.unsubscribe()
      }
    }
  }, [authStore.isAuthenticated, authStore.user, loadProfile, loadActivities])

  // Wrapped actions with proper error handling
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      await authStore.login(credentials)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }, [authStore])

  const logout = useCallback(async () => {
    try {
      await authStore.logout()
      // Clear user stores on logout
      useUserStore.setState({ profile: null, error: null })
      useActivityStore.setState({ activities: [], error: null, nextToken: undefined, hasMore: true })
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }, [authStore])

  const register = useCallback(async (data: RegisterData) => {
    try {
      await authStore.register(data)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }, [authStore])

  const requestPasswordReset = useCallback(async (data: PasswordResetRequest) => {
    try {
      await authStore.requestPasswordReset(data)
    } catch (error) {
      console.error('Password reset request failed:', error)
      throw error
    }
  }, [authStore])

  const confirmPasswordReset = useCallback(async (data: PasswordResetConfirmation) => {
    try {
      await authStore.confirmPasswordReset(data)
    } catch (error) {
      console.error('Password reset confirmation failed:', error)
      throw error
    }
  }, [authStore])

  const verifyEmail = useCallback(async (data: EmailVerification) => {
    try {
      await authStore.verifyEmail(data)
    } catch (error) {
      console.error('Email verification failed:', error)
      throw error
    }
  }, [authStore])

  const changePassword = useCallback(async (data: ChangePassword) => {
    try {
      await authStore.changePassword(data)
    } catch (error) {
      console.error('Password change failed:', error)
      throw error
    }
  }, [authStore])

  const refreshSession = useCallback(async () => {
    try {
      await authStore.refreshSession()
    } catch (error) {
      console.error('Session refresh failed:', error)
      throw error
    }
  }, [authStore])

  return {
    // State
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    user: authStore.user,
    error: authStore.error,

    // Actions
    login,
    logout,
    register,
    requestPasswordReset,
    confirmPasswordReset,
    verifyEmail,
    changePassword,
    refreshSession,
    clearError: authStore.clearError
  }
}

/**
 * Hook for authentication loading state
 */
export const useAuthLoading = () => {
  return useAuthStore((state) => state.isLoading)
}

/**
 * Hook for authentication error state
 */
export const useAuthError = () => {
  return useAuthStore((state) => state.error)
}

/**
 * Hook for current authenticated user
 */
export const useCurrentUser = () => {
  return useAuthStore((state) => state.user)
}

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  return useAuthStore((state) => state.isAuthenticated)
}

/**
 * Hook for authentication guards
 * Returns redirect path if user is not authenticated
 */
export const useAuthGuard = (redirectPath = '/login') => {
  const isAuthenticated = useIsAuthenticated()
  const isLoading = useAuthLoading()

  return {
    isAuthenticated,
    isLoading,
    shouldRedirect: !isLoading && !isAuthenticated,
    redirectPath
  }
}

/**
 * Hook for guest guards (redirect if authenticated)
 * Returns redirect path if user is authenticated
 */
export const useGuestGuard = (redirectPath = '/dashboard') => {
  const isAuthenticated = useIsAuthenticated()
  const isLoading = useAuthLoading()

  return {
    isAuthenticated,
    isLoading,
    shouldRedirect: !isLoading && isAuthenticated,
    redirectPath
  }
}