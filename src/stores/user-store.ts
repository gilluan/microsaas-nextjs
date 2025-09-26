import { create } from 'zustand'
import { client, storage, handleGraphQLError, formatAvatarS3Key } from '@/lib/amplify'
import type {
  UserStore,
  User,
  UserProfileUpdate,
  AvatarUpload,
  AvatarUploadResponse
} from '@/types/user'
import type {
  GetUserResponse,
  UpdateUserProfileResponse,
  CreateAvatarUploadUrlResponse,
  ConfirmAvatarUploadResponse
} from '@/types/api'

/**
 * User profile Zustand store
 * Manages user profile state and operations
 */
export const useUserStore = create<UserStore>((set, get) => ({
  // State
  profile: null,
  isLoading: false,
  error: null,
  isUploadingAvatar: false,

  // Actions
  updateProfile: async (data: UserProfileUpdate) => {
    set({ isLoading: true, error: null })
    try {
      const response = await client.graphql({
        query: `
          mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
            updateUserProfile(input: $input) {
              id
              email
              name
              avatar
              createdAt
              updatedAt
            }
          }
        `,
        variables: {
          input: data
        }
      }) as { data: UpdateUserProfileResponse }

      const updatedProfile = response.data.updateUserProfile
      set({
        profile: updatedProfile,
        isLoading: false
      })
    } catch (error) {
      const errorMessage = handleGraphQLError(error)
      set({
        isLoading: false,
        error: errorMessage
      })
      throw new Error(errorMessage)
    }
  },

  uploadAvatar: async (file: File) => {
    const currentProfile = get().profile
    if (!currentProfile) {
      throw new Error('No user profile found')
    }

    set({ isUploadingAvatar: true, error: null })

    try {
      // Step 1: Get upload URL from GraphQL
      const uploadResponse = await client.graphql({
        query: `
          mutation CreateAvatarUploadUrl($input: AvatarUploadInput!) {
            createAvatarUploadUrl(input: $input) {
              uploadUrl
              s3Key
            }
          }
        `,
        variables: {
          input: {
            contentType: file.type,
            fileName: file.name
          }
        }
      }) as { data: CreateAvatarUploadUrlResponse }

      const { uploadUrl, s3Key } = uploadResponse.data.createAvatarUploadUrl

      // Step 2: Upload file to S3
      await storage.uploadData({
        key: s3Key,
        data: file,
        options: {
          contentType: file.type
        }
      })

      // Step 3: Confirm upload and update profile
      const confirmResponse = await client.graphql({
        query: `
          mutation ConfirmAvatarUpload($input: ConfirmAvatarUploadInput!) {
            confirmAvatarUpload(input: $input) {
              id
              email
              name
              avatar
              createdAt
              updatedAt
            }
          }
        `,
        variables: {
          input: {
            s3Key
          }
        }
      }) as { data: ConfirmAvatarUploadResponse }

      const updatedProfile = confirmResponse.data.confirmAvatarUpload
      set({
        profile: updatedProfile,
        isUploadingAvatar: false
      })
    } catch (error) {
      const errorMessage = handleGraphQLError(error)
      set({
        isUploadingAvatar: false,
        error: errorMessage
      })
      throw new Error(errorMessage)
    }
  },

  loadProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await client.graphql({
        query: `
          query GetUser {
            getUser {
              id
              email
              name
              avatar
              createdAt
              updatedAt
            }
          }
        `
      }) as { data: GetUserResponse }

      const profile = response.data.getUser
      set({
        profile,
        isLoading: false
      })
    } catch (error) {
      const errorMessage = handleGraphQLError(error)
      set({
        isLoading: false,
        error: errorMessage
      })
      throw new Error(errorMessage)
    }
  },

  clearError: () => {
    set({ error: null })
  }
}))

/**
 * Selector hooks for specific user state
 */
export const useUserProfile = () => useUserStore((state) => state.profile)
export const useUserLoading = () => useUserStore((state) => state.isLoading)
export const useUserError = () => useUserStore((state) => state.error)
export const useIsUploadingAvatar = () => useUserStore((state) => state.isUploadingAvatar)

/**
 * Helper function to validate file for avatar upload
 */
export const validateAvatarFile = (file: File): string | null => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return 'File must be JPEG, PNG, GIF, or WebP format'
  }

  if (file.size > maxSize) {
    return 'File size must be less than 5MB'
  }

  return null
}

/**
 * Helper function to get user display name
 */
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return 'Guest'
  return user.name || user.email || 'User'
}

/**
 * Helper function to get user initials for avatar fallback
 */
export const getUserInitials = (user: User | null): string => {
  if (!user) return '?'

  const name = user.name || user.email
  const parts = name.split(' ')

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return name.charAt(0).toUpperCase()
}