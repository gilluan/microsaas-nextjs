/**
 * Central export file for all custom hooks
 * Provides convenient access to all hook utilities
 */

// Authentication hooks
export {
  useAuth,
  useAuthLoading,
  useAuthError,
  useCurrentUser,
  useIsAuthenticated,
  useAuthGuard,
  useGuestGuard
} from './use-auth'

// User hooks
export {
  useUser,
  useUserProfile,
  useUserLoading,
  useUserError,
  useAvatarUpload,
  useUserDisplay
} from './use-user'

// API hooks
export {
  useGraphQLQuery,
  useGraphQLMutation,
  useFileUpload,
  useGraphQLSubscription,
  useRetry,
  useOptimisticUpdate,
  useDebouncedApi
} from './use-api'