/**
 * User profile interface
 * Core user information stored in the system
 */
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

/**
 * User profile update interface
 * Partial update for user profile information
 */
export interface UserProfileUpdate {
  name?: string
  email?: string
}

/**
 * Avatar upload interface
 * For managing user avatar uploads
 */
export interface AvatarUpload {
  contentType: string
  fileName: string
}

/**
 * Avatar upload response interface
 */
export interface AvatarUploadResponse {
  uploadUrl: string
  s3Key: string
}

/**
 * User activity types
 * Enum for different types of user activities
 */
export type ActivityType =
  | 'LOGIN'
  | 'PROFILE_UPDATE'
  | 'AVATAR_UPLOAD'
  | 'PASSWORD_CHANGE'
  | 'EMAIL_VERIFICATION'

/**
 * User activity interface
 * Tracks user actions and events
 */
export interface UserActivity {
  id: string
  userId: string
  activityType: ActivityType
  description: string
  metadata?: Record<string, unknown>
  createdAt: string
}

/**
 * Create user activity input interface
 */
export interface CreateUserActivityInput {
  activityType: ActivityType
  description: string
  metadata?: Record<string, unknown>
}

/**
 * User state interface
 * State management for user profile data
 */
export interface UserState {
  profile: User | null
  isLoading: boolean
  error: string | null
  isUploadingAvatar: boolean
}

/**
 * User actions interface
 * Operations for user profile management
 */
export interface UserActions {
  updateProfile: (data: UserProfileUpdate) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
  loadProfile: () => Promise<void>
  clearError: () => void
}

/**
 * Complete user store interface
 */
export interface UserStore extends UserState, UserActions {}

/**
 * Activity state interface
 * State management for user activities
 */
export interface ActivityState {
  activities: UserActivity[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  nextToken?: string
}

/**
 * Activity actions interface
 * Operations for activity management
 */
export interface ActivityActions {
  loadActivities: (refresh?: boolean) => Promise<void>
  addActivity: (input: CreateUserActivityInput) => Promise<UserActivity>
  loadMoreActivities: () => Promise<void>
  clearError: () => void
}

/**
 * Complete activity store interface
 */
export interface ActivityStore extends ActivityState, ActivityActions {}

/**
 * List activities input interface
 */
export interface ListActivitiesInput {
  limit?: number
  nextToken?: string
}

/**
 * List activities response interface
 */
export interface ListActivitiesResponse {
  items: UserActivity[]
  nextToken?: string
}