import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { uploadData, getUrl, remove } from 'aws-amplify/storage'
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  updatePassword,
  fetchAuthSession,
  signInWithRedirect
} from 'aws-amplify/auth'
import outputs from '../../amplify_outputs.json'

/**
 * Configure Amplify with backend outputs
 * This sets up authentication, API, and storage clients
 */
Amplify.configure(outputs)

/**
 * GraphQL client instance
 * Pre-configured with authentication and authorization
 */
export const client = generateClient()

/**
 * Authentication utilities
 * Exported for use throughout the application
 */
export const auth = {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  updatePassword,
  fetchAuthSession,
  signInWithRedirect
}

/**
 * Storage utilities
 * For file uploads and management
 */
export const storage = {
  uploadData,
  getUrl,
  remove
}

/**
 * Amplify configuration object
 * Exported for provider setup
 */
export const amplifyConfig = outputs

/**
 * Helper function to check if Amplify is configured
 */
export const isAmplifyConfigured = (): boolean => {
  try {
    return Boolean(outputs.auth?.user_pool_id && outputs.data?.url)
  } catch {
    return false
  }
}

/**
 * Helper function to get the current authentication state
 */
export const getCurrentAuthState = async () => {
  try {
    const user = await getCurrentUser()
    const session = await fetchAuthSession()
    return {
      isAuthenticated: true,
      user,
      session,
      tokens: session.tokens
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      user: null,
      session: null,
      tokens: null,
      error
    }
  }
}

/**
 * Helper function to handle authentication errors
 */
export const handleAuthError = (error: unknown): string => {
  if (error instanceof Error) {
    switch (error.name) {
      case 'UserNotConfirmedException':
        return 'Please verify your email address before signing in.'
      case 'NotAuthorizedException':
        return 'Invalid email or password.'
      case 'UserNotFoundException':
        return 'User not found. Please check your email address.'
      case 'InvalidPasswordException':
        return 'Password does not meet requirements.'
      case 'UsernameExistsException':
        return 'An account with this email already exists.'
      case 'CodeMismatchException':
        return 'Invalid verification code.'
      case 'ExpiredCodeException':
        return 'Verification code has expired.'
      case 'LimitExceededException':
        return 'Too many attempts. Please try again later.'
      case 'TooManyRequestsException':
        return 'Too many requests. Please try again later.'
      default:
        return error.message || 'An unexpected error occurred.'
    }
  }
  return 'An unexpected error occurred.'
}

/**
 * Helper function to handle GraphQL errors
 */
export const handleGraphQLError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'errors' in error) {
    const graphqlError = error as { errors: Array<{ message: string }> }
    return graphqlError.errors[0]?.message || 'GraphQL operation failed.'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred.'
}

/**
 * Helper function to format S3 key for avatar uploads
 */
export const formatAvatarS3Key = (userId: string, fileName: string): string => {
  const timestamp = Date.now()
  const fileExtension = fileName.split('.').pop()
  return `avatars/${userId}/${timestamp}.${fileExtension}`
}

/**
 * Helper function to get public URL for S3 objects
 */
export const getPublicUrl = async (key: string): Promise<string> => {
  try {
    const result = await getUrl({ key })
    return result.url.toString()
  } catch (error) {
    console.error('Error getting public URL:', error)
    throw new Error('Failed to get file URL')
  }
}

export default Amplify