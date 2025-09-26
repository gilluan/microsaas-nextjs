/**
 * Central export file for all TypeScript types
 * Provides convenient access to all type definitions
 */

// Authentication types
export type {
  AuthState,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordResetConfirmation,
  EmailVerification,
  ChangePassword,
  AuthActions,
  AuthStore,
  AuthProviderProps,
  OAuthProvider,
  OAuthSignIn
} from './auth'

// User types
export type {
  User,
  UserProfileUpdate,
  AvatarUpload,
  AvatarUploadResponse,
  ActivityType,
  UserActivity,
  CreateUserActivityInput,
  UserState,
  UserActions,
  UserStore,
  ActivityState,
  ActivityActions,
  ActivityStore,
  ListActivitiesInput,
  ListActivitiesResponse
} from './user'

// API types
export type {
  BaseApiResponse,
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiResponse,
  GraphQLError,
  GraphQLResponse,
  GetUserResponse,
  UpdateUserProfileResponse,
  CreateAvatarUploadUrlResponse,
  ConfirmAvatarUploadResponse,
  CreateUserActivityResponse,
  ListUserActivitiesResponse,
  UserActivitySubscriptionResponse,
  ApiRequestConfig,
  UploadProgress,
  UploadConfig,
  PaginationInput,
  PaginationResponse,
  Subscription,
  ApiHookResult,
  MutationHookResult,
  UploadHookResult
} from './api'