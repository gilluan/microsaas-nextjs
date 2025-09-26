import { useCallback } from 'react'
import { useUserStore, validateAvatarFile, getUserDisplayName, getUserInitials } from '@/stores/user-store'
import { useActivityStore } from '@/stores/activity-store'
import type { UserProfileUpdate } from '@/types/user'

/**
 * User profile management hook
 * Provides user profile state and operations
 */
export const useUser = () => {
  const userStore = useUserStore()
  const addActivity = useActivityStore((state) => state.addActivity)

  // Wrapped actions with activity logging
  const updateProfile = useCallback(async (data: UserProfileUpdate) => {
    try {
      await userStore.updateProfile(data)

      // Log activity
      await addActivity({
        activityType: 'PROFILE_UPDATE',
        description: 'Updated profile information',
        metadata: { fields: Object.keys(data) }
      })
    } catch (error) {
      console.error('Profile update failed:', error)
      throw error
    }
  }, [userStore, addActivity])

  const uploadAvatar = useCallback(async (file: File) => {
    // Validate file before upload
    const validationError = validateAvatarFile(file)
    if (validationError) {
      throw new Error(validationError)
    }

    try {
      await userStore.uploadAvatar(file)

      // Log activity
      await addActivity({
        activityType: 'AVATAR_UPLOAD',
        description: 'Uploaded new profile picture',
        metadata: { fileName: file.name, fileSize: file.size }
      })
    } catch (error) {
      console.error('Avatar upload failed:', error)
      throw error
    }
  }, [userStore, addActivity])

  const loadProfile = useCallback(async () => {
    try {
      await userStore.loadProfile()
    } catch (error) {
      console.error('Profile load failed:', error)
      throw error
    }
  }, [userStore])

  return {
    // State
    profile: userStore.profile,
    isLoading: userStore.isLoading,
    isUploadingAvatar: userStore.isUploadingAvatar,
    error: userStore.error,

    // Actions
    updateProfile,
    uploadAvatar,
    loadProfile,
    clearError: userStore.clearError,

    // Computed values
    displayName: getUserDisplayName(userStore.profile),
    initials: getUserInitials(userStore.profile)
  }
}

/**
 * Hook for user profile data only
 */
export const useUserProfile = () => {
  return useUserStore((state) => state.profile)
}

/**
 * Hook for user loading states
 */
export const useUserLoading = () => {
  const isLoading = useUserStore((state) => state.isLoading)
  const isUploadingAvatar = useUserStore((state) => state.isUploadingAvatar)

  return {
    isLoading,
    isUploadingAvatar,
    isAnyLoading: isLoading || isUploadingAvatar
  }
}

/**
 * Hook for user error state
 */
export const useUserError = () => {
  return useUserStore((state) => state.error)
}

/**
 * Hook for avatar upload functionality
 */
export const useAvatarUpload = () => {
  const uploadAvatar = useUserStore((state) => state.uploadAvatar)
  const isUploadingAvatar = useUserStore((state) => state.isUploadingAvatar)
  const error = useUserStore((state) => state.error)
  const clearError = useUserStore((state) => state.clearError)

  const handleAvatarUpload = useCallback(async (file: File) => {
    const validationError = validateAvatarFile(file)
    if (validationError) {
      throw new Error(validationError)
    }

    return uploadAvatar(file)
  }, [uploadAvatar])

  return {
    uploadAvatar: handleAvatarUpload,
    isUploading: isUploadingAvatar,
    error,
    clearError,
    validateFile: validateAvatarFile
  }
}

/**
 * Hook for user display information
 */
export const useUserDisplay = () => {
  const profile = useUserProfile()

  return {
    profile,
    displayName: getUserDisplayName(profile),
    initials: getUserInitials(profile),
    hasAvatar: Boolean(profile?.avatar)
  }
}