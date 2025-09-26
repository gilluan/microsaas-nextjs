import { type AuthUser } from 'aws-amplify/auth'

/**
 * Authentication state interface
 * Tracks current authentication status and user session
 */
export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  error: string | null
}

/**
 * Login credentials interface
 * For email/password authentication
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Registration data interface
 * For new user registration
 */
export interface RegisterData {
  email: string
  password: string
  name: string
}

/**
 * Password reset request interface
 */
export interface PasswordResetRequest {
  email: string
}

/**
 * Password reset confirmation interface
 */
export interface PasswordResetConfirmation {
  email: string
  confirmationCode: string
  newPassword: string
}

/**
 * Email verification interface
 */
export interface EmailVerification {
  email: string
  verificationCode: string
}

/**
 * Change password interface
 */
export interface ChangePassword {
  currentPassword: string
  newPassword: string
}

/**
 * Authentication actions interface
 * Defines all authentication operations
 */
export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<void>
  requestPasswordReset: (data: PasswordResetRequest) => Promise<void>
  confirmPasswordReset: (data: PasswordResetConfirmation) => Promise<void>
  verifyEmail: (data: EmailVerification) => Promise<void>
  changePassword: (data: ChangePassword) => Promise<void>
  refreshSession: () => Promise<void>
  clearError: () => void
}

/**
 * Complete authentication store interface
 */
export interface AuthStore extends AuthState, AuthActions {}

/**
 * Authentication provider props interface
 */
export interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * OAuth provider types
 */
export type OAuthProvider = 'Google' | 'Facebook' | 'Amazon'

/**
 * OAuth sign-in interface
 */
export interface OAuthSignIn {
  provider: OAuthProvider
  customState?: string
}