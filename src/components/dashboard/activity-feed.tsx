'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { Loader2, RefreshCw, Activity as ActivityIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  useActivityStore,
  useActivities,
  useActivityLoading,
  useActivityError,
  useHasMoreActivities,
  subscribeToActivities,
  formatActivityTime,
  getActivityIcon,
  getActivityColor,
  groupActivitiesByDate
} from '@/stores/activity-store';
import { useUserProfile, getUserInitials } from '@/stores/user-store';
import { cn } from '@/lib/utils';
import type { UserActivity } from '@/types/user';

interface ActivityFeedProps {
  className?: string;
  showHeader?: boolean;
  limit?: number;
}

interface ActivityItemProps {
  activity: UserActivity;
  userAvatar?: string | null;
  userInitials: string;
}

const ActivityItem = memo(function ActivityItem({ activity, userAvatar, userInitials }: ActivityItemProps) {
  const icon = useMemo(() => getActivityIcon(activity.activityType), [activity.activityType]);
  const colorClass = useMemo(() => getActivityColor(activity.activityType), [activity.activityType]);
  const timeAgo = useMemo(() => formatActivityTime(activity.createdAt), [activity.createdAt]);
  const formattedType = useMemo(() =>
    activity.activityType.replace('_', ' ').toLowerCase(),
    [activity.activityType]
  );
  const hasMetadata = useMemo(() =>
    activity.metadata && Object.keys(activity.metadata).length > 0,
    [activity.metadata]
  );

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={userAvatar || undefined} />
        <AvatarFallback className="text-xs">
          {userInitials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm" role="img" aria-label={activity.activityType}>
            {icon}
          </span>
          <p className="text-sm font-medium truncate">
            {activity.description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cn('font-medium', colorClass)}>
            {formattedType}
          </span>
          <span>•</span>
          <time dateTime={activity.createdAt}>{timeAgo}</time>
        </div>

        {hasMetadata && (
          <div className="mt-2 p-2 bg-muted/30 rounded text-xs text-muted-foreground">
            <pre className="whitespace-pre-wrap overflow-hidden">
              {JSON.stringify(activity.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
});

interface DateGroupProps {
  date: string;
  activities: UserActivity[];
  userAvatar?: string | null;
  userInitials: string;
}

const DateGroup = memo(function DateGroup({ date, activities, userAvatar, userInitials }: DateGroupProps) {
  const displayDate = useMemo(() => {
    const isToday = new Date().toDateString() === date;
    const isYesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString() === date;

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return new Date(date).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }, [date]);

  const activityCountText = useMemo(() =>
    `${activities.length} ${activities.length === 1 ? 'activity' : 'activities'}`,
    [activities.length]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-3 py-2">
        <h3 className="text-sm font-semibold text-muted-foreground">{displayDate}</h3>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">
          {activityCountText}
        </span>
      </div>

      <div className="space-y-1">
        {activities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            userAvatar={userAvatar}
            userInitials={userInitials}
          />
        ))}
      </div>
    </div>
  );
});

export function ActivityFeed({ 
  className, 
  showHeader = true, 
  limit 
}: ActivityFeedProps) {
  const profile = useUserProfile();
  const activities = useActivities();
  const isLoading = useActivityLoading();
  const error = useActivityError();
  const hasMore = useHasMoreActivities();
  const { loadActivities, loadMoreActivities, clearError } = useActivityStore();
  
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [subscription, setSubscription] = React.useState<any>(null);

  // Filter activities if limit is specified
  const displayActivities = limit ? activities.slice(0, limit) : activities;
  const groupedActivities = groupActivitiesByDate(displayActivities);
  const userInitials = getUserInitials(profile);

  // Load activities on mount
  React.useEffect(() => {
    loadActivities(true).catch(console.error);
  }, [loadActivities]);

  // Set up real-time subscription
  React.useEffect(() => {
    const sub = subscribeToActivities();
    setSubscription(sub);

    return () => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadActivities(true);
    } catch (error) {
      console.error('Failed to refresh activities:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadActivities]);

  const handleLoadMore = useCallback(async () => {
    try {
      await loadMoreActivities();
    } catch (error) {
      console.error('Failed to load more activities:', error);
    }
  }, [loadMoreActivities]);

  const handleClearError = useCallback(() => {
    clearError();
  }, [clearError]);

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      {showHeader && (
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ActivityIcon className="h-5 w-5" />
                Activity Feed
                {subscription && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Live
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Real-time updates of your account activity
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', (isRefreshing || isLoading) && 'animate-spin')} />
            </Button>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearError}
              className="h-auto p-1 text-destructive hover:text-destructive"
            >
              ×
            </Button>
          </div>
        )}
        
        {isLoading && activities.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading activities...</p>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <ActivityIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="font-medium text-muted-foreground">No activities yet</h3>
              <p className="text-sm text-muted-foreground">
                Your account activities will appear here as you use the app
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-6">
            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <DateGroup
                key={date}
                date={date}
                activities={dateActivities}
                userAvatar={profile?.avatar}
                userInitials={userInitials}
              />
            ))}
            
            {hasMore && !limit && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Load More Activities
                </Button>
              </div>
            )}
            
            {!hasMore && activities.length > 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  You've reached the end of your activity history
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}