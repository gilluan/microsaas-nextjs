import type { User, UserActivity, ListActivitiesResponse } from './user'

/**
 * Base API response interface
 * Common structure for all API responses
 */
export interface BaseApiResponse {
  success: boolean
  message?: string
  timestamp: string
}

/**
 * API error response interface
 * Structure for error responses from the API
 */
export interface ApiErrorResponse extends BaseApiResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

/**
 * Successful API response interface
 * Generic structure for successful API responses
 */
export interface ApiSuccessResponse<T = unknown> extends BaseApiResponse {
  success: true
  data: T
}

/**
 * API response union type
 * Can be either success or error response
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * GraphQL error interface
 * Structure for GraphQL specific errors
 */
export interface GraphQLError {
  message: string
  locations?: Array<{
    line: number
    column: number
  }>
  path?: Array<string | number>
  extensions?: Record<string, unknown>
}

/**
 * GraphQL response interface
 * Standard GraphQL response structure
 */
export interface GraphQLResponse<T = unknown> {
  data?: T
  errors?: GraphQLError[]
  extensions?: Record<string, unknown>
}

/**
 * Get user response interface
 */
export interface GetUserResponse {
  getUser: User
}

/**
 * Update user profile response interface
 */
export interface UpdateUserProfileResponse {
  updateUserProfile: User
}

/**
 * Create avatar upload URL response interface
 */
export interface CreateAvatarUploadUrlResponse {
  createAvatarUploadUrl: {
    uploadUrl: string
    s3Key: string
  }
}

/**
 * Confirm avatar upload response interface
 */
export interface ConfirmAvatarUploadResponse {
  confirmAvatarUpload: User
}

/**
 * Create user activity response interface
 */
export interface CreateUserActivityResponse {
  createUserActivity: UserActivity
}

/**
 * List user activities response interface
 */
export interface ListUserActivitiesResponse {
  listUserActivities: ListActivitiesResponse
}

/**
 * User activity subscription response interface
 */
export interface UserActivitySubscriptionResponse {
  onUserActivityCreated: UserActivity
}

/**
 * API request configuration interface
 */
export interface ApiRequestConfig {
  retries?: number
  timeout?: number
  headers?: Record<string, string>
}

/**
 * File upload progress interface
 */
export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

/**
 * File upload configuration interface
 */
export interface UploadConfig {
  onProgress?: (progress: UploadProgress) => void
  signal?: AbortSignal
}

/**
 * Pagination input interface
 */
export interface PaginationInput {
  limit?: number
  nextToken?: string
}

/**
 * Pagination response interface
 */
export interface PaginationResponse<T> {
  items: T[]
  nextToken?: string
  hasMore: boolean
}

/**
 * Real-time subscription interface
 */
export interface Subscription<T> {
  subscribe: (callback: (data: T) => void) => () => void
  unsubscribe: () => void
}

/**
 * API hook return type interface
 * Common structure for API hooks
 */
export interface ApiHookResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Mutation hook return type interface
 * Structure for mutation hooks
 */
export interface MutationHookResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>
  isLoading: boolean
  error: string | null
  reset: () => void
}

/**
 * Upload hook return type interface
 * Structure for file upload hooks
 */
export interface UploadHookResult {
  upload: (file: File, config?: UploadConfig) => Promise<string>
  isUploading: boolean
  progress: number
  error: string | null
  cancel: () => void
  reset: () => void
}