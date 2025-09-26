/**
 * Central export file for all Zustand stores
 * Provides convenient access to all store hooks and utilities
 */

// Authentication store
export {
  useAuthStore,
  signInWithOAuth,
  initializeAuth,
  useAuthUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError
} from './auth-store'

// User store
export {
  useUserStore,
  useUserProfile,
  useUserLoading,
  useUserError,
  useIsUploadingAvatar,
  validateAvatarFile,
  getUserDisplayName,
  getUserInitials
} from './user-store'

// Activity store
export {
  useActivityStore,
  subscribeToActivities,
  useActivities,
  useActivityLoading,
  useActivityError,
  useHasMoreActivities,
  formatActivityTime,
  getActivityIcon,
  getActivityColor,
  groupActivitiesByDate
} from './activity-store'