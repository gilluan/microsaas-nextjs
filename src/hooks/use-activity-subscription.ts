import { useEffect, useRef, useState } from 'react'
import { generateClient } from 'aws-amplify/api'
import { onCreateUserActivity } from '@/lib/graphql/subscriptions'
import { useActivityStore } from '@/stores/activity-store'
import { useAuthStore } from '@/stores/auth-store'
import type { UserActivity } from '@/types/user'

interface UseActivitySubscriptionReturn {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  connectionCount: number
  lastActivity: UserActivity | null
  retry: () => void
}

interface ConnectionStatusProps {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  onReconnect?: () => void
  className?: string
}

export function useActivitySubscription(): UseActivitySubscriptionReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionCount, setConnectionCount] = useState(0)
  const [lastActivity, setLastActivity] = useState<UserActivity | null>(null)

  const subscriptionRef = useRef<any>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 3
  const user = useAuthStore((state) => state.user)
  const addActivity = useActivityStore((state) => state.addActivity)

  const connect = async () => {
    if (!user?.id) return

    try {
      setIsConnecting(true)
      setError(null)

      const client = generateClient()

      const subscription = client.graphql({
        query: onCreateUserActivity,
        variables: { userId: user.id }
      }).subscribe({
        next: (data) => {
          const activity = data.data?.onCreateUserActivity
          if (activity) {
            addActivity(activity as UserActivity)
            setLastActivity(activity as UserActivity)
          }
        },
        error: (err) => {
          console.error('Subscription error:', err)
          setError(err.message || 'Connection failed')
          setIsConnected(false)
          handleReconnect()
        }
      })

      subscriptionRef.current = subscription
      setIsConnected(true)
      setConnectionCount(prev => prev + 1)
      retryCountRef.current = 0
    } catch (err: any) {
      setError(err.message || 'Failed to connect')
      handleReconnect()
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      subscriptionRef.current = null
    }
    setIsConnected(false)
    setIsConnecting(false)
  }

  const handleReconnect = () => {
    if (retryCountRef.current >= maxRetries) {
      setError('Max retries reached')
      return
    }

    retryCountRef.current++
    const delay = Math.pow(2, retryCountRef.current) * 1000

    setTimeout(() => {
      connect()
    }, delay)
  }

  const retry = () => {
    retryCountRef.current = 0
    setError(null)
    connect()
  }

  useEffect(() => {
    if (user?.id) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [user?.id])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        disconnect()
      } else if (user?.id && !isConnected) {
        connect()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user?.id, isConnected])

  return {
    isConnected,
    isConnecting,
    error,
    connectionCount,
    lastActivity,
    retry
  }
}

export function ConnectionStatus({
  isConnected,
  isConnecting,
  error,
  onReconnect,
  className = ''
}: ConnectionStatusProps) {
  if (isConnecting) {
    return (
      <div className={"flex items-center gap-2 text-sm text-yellow-600 " + className}>
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        <span>Connecting...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={"flex items-center gap-2 text-sm text-red-600 " + className}>
        <div className="w-2 h-2 bg-red-500 rounded-full" />
        <span>Connection error</span>
        {onReconnect && (
          <button
            onClick={onReconnect}
            className="text-xs underline hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  if (isConnected) {
    return (
      <div className={"flex items-center gap-2 text-sm text-green-600 " + className}>
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span>Connected</span>
      </div>
    )
  }

  return (
    <div className={"flex items-center gap-2 text-sm text-gray-500 " + className}>
      <div className="w-2 h-2 bg-gray-400 rounded-full" />
      <span>Disconnected</span>
    </div>
  )
}