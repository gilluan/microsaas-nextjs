import { create } from 'zustand'
import { client, handleGraphQLError } from '@/lib/amplify'
import type {
  ActivityStore,
  UserActivity,
  CreateUserActivityInput,
  ListActivitiesInput
} from '@/types/user'
import type {
  CreateUserActivityResponse,
  ListUserActivitiesResponse,
  UserActivitySubscriptionResponse
} from '@/types/api'

/**
 * Activity feed Zustand store
 * Manages user activity state and operations with real-time updates
 */
export const useActivityStore = create<ActivityStore>((set, get) => ({
  // State
  activities: [],
  isLoading: false,
  error: null,
  hasMore: true,
  nextToken: undefined,

  // Actions
  loadActivities: async (refresh = false) => {
    const currentState = get()

    // If refreshing, reset pagination
    if (refresh) {
      set({
        isLoading: true,
        error: null,
        nextToken: undefined,
        hasMore: true
      })
    } else {
      set({ isLoading: true, error: null })
    }

    try {
      const input: ListActivitiesInput = {
        limit: 20
      }

      // Only include nextToken if we're not refreshing and have a token
      if (!refresh && currentState.nextToken) {
        input.nextToken = currentState.nextToken
      }

      const response = await client.graphql({
        query: `
          query ListUserActivities($input: ListUserActivitiesInput) {
            listUserActivities(input: $input) {
              items {
                id
                userId
                activityType
                description
                metadata
                createdAt
              }
              nextToken
            }
          }
        `,
        variables: { input }
      }) as { data: ListUserActivitiesResponse }

      const { items, nextToken } = response.data.listUserActivities

      set({
        activities: refresh ? items : [...currentState.activities, ...items],
        nextToken,
        hasMore: Boolean(nextToken),
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

  addActivity: async (input: CreateUserActivityInput) => {
    set({ error: null })
    try {
      const response = await client.graphql({
        query: `
          mutation CreateUserActivity($input: CreateUserActivityInput!) {
            createUserActivity(input: $input) {
              id
              userId
              activityType
              description
              metadata
              createdAt
            }
          }
        `,
        variables: { input }
      }) as { data: CreateUserActivityResponse }

      const newActivity = response.data.createUserActivity

      // Add new activity to the beginning of the list
      set((state) => ({
        activities: [newActivity, ...state.activities]
      }))

      return newActivity
    } catch (error) {
      const errorMessage = handleGraphQLError(error)
      set({ error: errorMessage })
      throw new Error(errorMessage)
    }
  },

  loadMoreActivities: async () => {
    const currentState = get()

    if (!currentState.hasMore || currentState.isLoading) {
      return
    }

    await get().loadActivities(false)
  },

  clearError: () => {
    set({ error: null })
  }
}))

/**
 * Real-time activity subscription
 * Subscribes to new activities for the current user
 */
export const subscribeToActivities = () => {
  try {
    const observable = client.graphql({
      query: `
        subscription OnUserActivityCreated {
          onUserActivityCreated {
            id
            userId
            activityType
            description
            metadata
            createdAt
          }
        }
      `
    })

    // Check if it's a subscription (has subscribe method)
    if ('subscribe' in observable && typeof observable.subscribe === 'function') {
      const subscription = observable.subscribe({
        next: (data: any) => {
          const response = data as { data: UserActivitySubscriptionResponse }
          const newActivity = response.data.onUserActivityCreated

          // Add new activity to the store
          useActivityStore.setState((state) => ({
            activities: [newActivity, ...state.activities]
          }))
        },
        error: (error: any) => {
          console.error('Activity subscription error:', error)
          const errorMessage = handleGraphQLError(error)
          useActivityStore.setState({ error: errorMessage })
        }
      })

      return subscription
    } else {
      console.warn('Subscription not supported for activities')
      return null
    }
  } catch (error) {
    console.error('Failed to subscribe to activities:', error)
    return null
  }
}

/**
 * Selector hooks for specific activity state
 */
export const useActivities = () => useActivityStore((state) => state.activities)
export const useActivityLoading = () => useActivityStore((state) => state.isLoading)
export const useActivityError = () => useActivityStore((state) => state.error)
export const useHasMoreActivities = () => useActivityStore((state) => state.hasMore)

/**
 * Helper function to format activity timestamp
 */
export const formatActivityTime = (createdAt: string): string => {
  const date = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) {
    return 'Just now'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

/**
 * Helper function to get activity icon based on type
 */
export const getActivityIcon = (activityType: string): string => {
  switch (activityType) {
    case 'LOGIN':
      return '🔐'
    case 'PROFILE_UPDATE':
      return '✏️'
    case 'AVATAR_UPLOAD':
      return '📸'
    case 'PASSWORD_CHANGE':
      return '🔑'
    case 'EMAIL_VERIFICATION':
      return '✅'
    default:
      return '📝'
  }
}

/**
 * Helper function to get activity color based on type
 */
export const getActivityColor = (activityType: string): string => {
  switch (activityType) {
    case 'LOGIN':
      return 'text-green-600'
    case 'PROFILE_UPDATE':
      return 'text-blue-600'
    case 'AVATAR_UPLOAD':
      return 'text-purple-600'
    case 'PASSWORD_CHANGE':
      return 'text-orange-600'
    case 'EMAIL_VERIFICATION':
      return 'text-green-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * Helper function to group activities by date
 */
export const groupActivitiesByDate = (activities: UserActivity[]) => {
  const groups: Record<string, UserActivity[]> = {}

  activities.forEach((activity) => {
    const date = new Date(activity.createdAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
  })

  return groups
}