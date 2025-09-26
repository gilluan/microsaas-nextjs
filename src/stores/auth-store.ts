import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, handleAuthError } from '@/lib/amplify'
import type {
  AuthStore,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordResetConfirmation,
  EmailVerification,
  ChangePassword,
  OAuthProvider
} from '@/types/auth'
import type { AuthUser } from 'aws-amplify/auth'

/**
 * Authentication Zustand store
 * Manages authentication state and operations
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        try {
          const result = await auth.signIn({
            username: credentials.email,
            password: credentials.password
          })

          if (result.isSignedIn) {
            const user = await auth.getCurrentUser()
            set({
              isAuthenticated: true,
              user,
              isLoading: false
            })
          } else {
            // Handle additional sign-in steps (MFA, password reset, etc.)
            set({
              isLoading: false,
              error: 'Additional verification required'
            })
          }
        } catch (error) {
          const errorMessage = handleAuthError(error)
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null
          })
          throw new Error(errorMessage)
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null })
        try {
          await auth.signOut()
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null
          })
        } catch (error) {
          const errorMessage = handleAuthError(error)
          set({
            isLoading: false,
            error: errorMessage
          })
          throw new Error(errorMessage)
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null })
        try {
          const result = await auth.signUp({
            username: data.email,
            password: data.password,
            options: {
              userAttributes: {
                email: data.email,
                name: data.name
              }
            }
          })

          if (result.isSignUpComplete) {
            // Auto sign in after successful registration
            await get().login({
              email: data.email,
              password: data.password
            })
          } else {
            set({
              isLoading: false,
              error: 'Please verify your email address to complete registration'
            })
          }
        } catch (error) {
          const errorMessage = handleAuthError(error)
          set({
            isLoading: false,
            error: errorMessage
          })
          throw new Error(errorMessage)
        }
      },

      requestPasswordReset: async (data: PasswordResetRequest) => {
        set({ isLoading: true, error: null })
        try {
          await auth.resetPassword({
            username: data.email
          })
          set({ isLoading: false })
        } catch (error) {
          const errorMessage = handleAuthError(error)
          set({
            isLoading: false,
            error: errorMessage
          })
          throw new Error(errorMessage)
        }
      },

      confirmPasswordReset: async (data: PasswordResetConfirmation) => {
        set({ isLoading: true, error: null })
        try {
          await auth.confirmResetPassword({
            username: data.email,
            confirmationCode: data.confirmationCode,
            newPassword: data.newPassword
          })
          set({ isLoading: false })
        } catch (error) {
          const errorMessage = handleAuthError(error)
          set({
            isLoading: false,
            error: errorMessage
          })
          throw new Error(errorMessage)
        }
      },

      verifyEmail: async (data: EmailVerification) => {
        set({ isLoading: true, error: null })
        try {
          await auth.confirmSignUp({
            username: data.email,
            confirmationCode: data.verificationCode
          })
          set({ isLoading: false })
        } catch (error) {
          const errorMessage = handleAuthError(error)
          set({
            isLoading: false,
            error: errorMessage
          })
          throw new Error(errorMessage)
        }
      },

      changePassword: async (data: ChangePassword) => {
        set({ isLoading: true, error: null })
        try {
          await auth.updatePassword({
            oldPassword: data.currentPassword,
            newPassword: data.newPassword
          })
          set({ isLoading: false })
        } catch (error) {
          const errorMessage = handleAuthError(error)
          set({
            isLoading: false,
            error: errorMessage
          })
          throw new Error(errorMessage)
        }
      },

      refreshSession: async () => {
        set({ isLoading: true, error: null })
        try {
          const user = await auth.getCurrentUser()
          set({
            isAuthenticated: true,
            user,
            isLoading: false
          })
        } catch (error) {
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null
          })
        }
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user
      })
    }
  )
)

/**
 * OAuth sign-in helper
 * Handles OAuth authentication flows
 */
export const signInWithOAuth = async (provider: OAuthProvider) => {
  try {
    await auth.signInWithRedirect({
      provider
    })
  } catch (error) {
    const errorMessage = handleAuthError(error)
    useAuthStore.getState().clearError()
    useAuthStore.setState({ error: errorMessage })
    throw new Error(errorMessage)
  }
}

/**
 * Initialize authentication state
 * Should be called when the app starts
 */
export const initializeAuth = async () => {
  try {
    const user = await auth.getCurrentUser()
    useAuthStore.setState({
      isAuthenticated: true,
      user,
      isLoading: false
    })
  } catch {
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    })
  }
}

/**
 * Selector hooks for specific auth state
 */
export const useAuthUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)