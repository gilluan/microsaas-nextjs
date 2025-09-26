import { useState, useCallback, useRef, useEffect } from 'react'
import { client, storage, handleGraphQLError } from '@/lib/amplify'
import type {
  ApiHookResult,
  MutationHookResult,
  UploadHookResult,
  UploadConfig,
  UploadProgress
} from '@/types/api'

/**
 * Generic GraphQL query hook
 * Provides data fetching with loading and error states
 */
export const useGraphQLQuery = <T>(
  query: string,
  variables?: Record<string, any>
): ApiHookResult<T> => {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await client.graphql({
        query,
        variables: variables as any
      }) as { data: T }

      setData(response.data)
    } catch (err) {
      const errorMessage = handleGraphQLError(err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [query, variables])

  // Initial fetch
  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    data,
    isLoading,
    error,
    refetch
  }
}

/**
 * Generic GraphQL mutation hook
 * Provides mutation function with loading and error states
 */
export const useGraphQLMutation = <TData, TVariables>(
  mutation: string
): MutationHookResult<TData, TVariables> => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await client.graphql({
        query: mutation,
        variables: variables as any
      }) as { data: TData }

      return response.data
    } catch (err) {
      const errorMessage = handleGraphQLError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [mutation])

  const reset = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    mutate,
    isLoading,
    error,
    reset
  }
}

/**
 * File upload hook
 * Handles S3 file uploads with progress tracking
 */
export const useFileUpload = (): UploadHookResult => {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const upload = useCallback(async (
    file: File,
    config?: UploadConfig
  ): Promise<string> => {
    setIsUploading(true)
    setProgress(0)
    setError(null)

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController()
    const signal = config?.signal || abortControllerRef.current.signal

    try {
      // Generate unique key for the file
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const key = `uploads/${timestamp}.${fileExtension}`

      // Upload to S3 with progress tracking
      const result = await storage.uploadData({
        key,
        data: file,
        options: {
          contentType: file.type,
          onProgress: (event: any) => {
            if (event.total && event.loaded) {
              const percentage = Math.round((event.loaded / event.total) * 100)
              setProgress(percentage)

              if (config?.onProgress) {
                config.onProgress({
                  loaded: event.loaded,
                  total: event.total,
                  percentage
                })
              }
            }
          }
        }
      })

      setProgress(100)
      return key
    } catch (err) {
      if (signal.aborted) {
        setError('Upload cancelled')
        throw new Error('Upload cancelled')
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    } finally {
      setIsUploading(false)
      abortControllerRef.current = null
    }
  }, [])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setProgress(0)
    setIsUploading(false)
  }, [])

  return {
    upload,
    isUploading,
    progress,
    error,
    cancel,
    reset
  }
}

/**
 * Real-time subscription hook
 * Manages GraphQL subscriptions with automatic cleanup
 */
export const useGraphQLSubscription = <T>(
  subscription: string,
  onData: (data: T) => void,
  variables?: Record<string, unknown>
) => {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const subscriptionRef = useRef<any>(null)

  const subscribe = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }

    setError(null)
    setIsConnected(false)

    try {
      const observable = client.graphql({
        query: subscription,
        variables: variables as any
      })

      // Check if it's a subscription (has subscribe method)
      if ('subscribe' in observable && typeof observable.subscribe === 'function') {
        subscriptionRef.current = observable.subscribe({
          next: (data: any) => {
            setIsConnected(true)
            onData(data.data as T)
          },
          error: (err: any) => {
            const errorMessage = handleGraphQLError(err)
            setError(errorMessage)
            setIsConnected(false)
          }
        })
      } else {
        setError('Subscription not supported')
      }
    } catch (err) {
      const errorMessage = handleGraphQLError(err)
      setError(errorMessage)
    }
  }, [subscription, variables, onData])

  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      subscriptionRef.current = null
    }
    setIsConnected(false)
  }, [])

  // Auto subscribe on mount
  useEffect(() => {
    subscribe()
    return unsubscribe
  }, [subscribe, unsubscribe])

  return {
    isConnected,
    error,
    subscribe,
    unsubscribe
  }
}

/**
 * Retry hook for failed operations
 * Provides retry functionality with exponential backoff
 */
export const useRetry = () => {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const retry = useCallback(async (
    operation: () => Promise<void>,
    maxRetries = 3,
    baseDelay = 1000
  ) => {
    if (retryCount >= maxRetries) {
      throw new Error('Maximum retry attempts reached')
    }

    setIsRetrying(true)

    try {
      await operation()
      setRetryCount(0) // Reset on success
    } catch (error) {
      const delay = baseDelay * Math.pow(2, retryCount)

      await new Promise(resolve => setTimeout(resolve, delay))

      setRetryCount(prev => prev + 1)
      throw error
    } finally {
      setIsRetrying(false)
    }
  }, [retryCount])

  const reset = useCallback(() => {
    setRetryCount(0)
    setIsRetrying(false)
  }, [])

  return {
    retry,
    retryCount,
    isRetrying,
    reset
  }
}

/**
 * Optimistic updates hook
 * Provides optimistic UI updates for mutations
 */
export const useOptimisticUpdate = <T>(initialData: T) => {
  const [optimisticData, setOptimisticData] = useState<T>(initialData)
  const [actualData, setActualData] = useState<T>(initialData)

  const updateOptimistic = useCallback((updater: (current: T) => T) => {
    setOptimisticData(updater)
  }, [])

  const updateActual = useCallback((data: T) => {
    setActualData(data)
    setOptimisticData(data)
  }, [])

  const rollback = useCallback(() => {
    setOptimisticData(actualData)
  }, [actualData])

  return {
    data: optimisticData,
    updateOptimistic,
    updateActual,
    rollback
  }
}

/**
 * Debounced API call hook
 * Debounces API calls to prevent excessive requests
 */
export const useDebouncedApi = <T>(
  apiCall: () => Promise<T>,
  delay = 500
) => {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const debouncedCall = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setIsLoading(true)
    setError(null)

    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await apiCall()
        setData(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'API call failed'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }, delay)
  }, [apiCall, delay])

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    data,
    isLoading,
    error,
    call: debouncedCall,
    cancel
  }
}