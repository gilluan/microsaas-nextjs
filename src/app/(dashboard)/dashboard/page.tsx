'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeSection } from '@/components/dashboard/welcome-section';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { useIsAuthenticated } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';
import { useActivityStore } from '@/stores/activity-store';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Loading skeleton components
function WelcomeSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/3 mb-1" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function QuickActionsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { loadProfile } = useUserStore();
  const { addActivity } = useActivityStore();
  
  const [isInitializing, setIsInitializing] = React.useState(true);

  // Redirect unauthenticated users to login
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard');
      return;
    }
  }, [isAuthenticated, router]);

  // Initialize dashboard data on mount
  React.useEffect(() => {
    const initializeDashboard = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsInitializing(true);
        
        // Load user profile
        await loadProfile();
        
        // Log dashboard visit activity
        await addActivity({
          activityType: 'LOGIN',
          description: 'Visited dashboard',
          metadata: {
            page: '/dashboard',
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
      } finally {
        // Add a small delay to show loading states
        setTimeout(() => {
          setIsInitializing(false);
        }, 1000);
      }
    };

    initializeDashboard();
  }, [isAuthenticated, loadProfile, addActivity]);

  // Don't render dashboard if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Welcome section */}
          {isInitializing ? (
            <WelcomeSkeleton />
          ) : (
            <WelcomeSection />
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-8">
          {/* Quick actions */}
          {isInitializing ? (
            <QuickActionsSkeleton />
          ) : (
            <QuickActions />
          )}
        </div>
      </div>
      
      {/* Activity feed - full width */}
      <div>
        {isInitializing ? (
          <ActivitySkeleton />
        ) : (
          <ActivityFeed />
        )}
      </div>
    </div>
  );
}