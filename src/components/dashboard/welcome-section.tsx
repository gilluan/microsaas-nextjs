'use client';

import React from 'react';
import { Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserProfile, getUserDisplayName, getUserInitials } from '@/stores/user-store';
import { useIsAuthenticated } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

interface WelcomeSectionProps {
  className?: string;
}

// Mock stats data - in a real app this would come from an API
const stats = [
  {
    title: 'Total Projects',
    value: '12',
    change: '+2 this week',
    icon: Zap,
    color: 'text-blue-600'
  },
  {
    title: 'Active Users',
    value: '1,234',
    change: '+12% this month',
    icon: Users,
    color: 'text-green-600'
  },
  {
    title: 'Performance',
    value: '98.5%',
    change: '+0.3% uptime',
    icon: TrendingUp,
    color: 'text-purple-600'
  }
];

export function WelcomeSection({ className }: WelcomeSectionProps) {
  const profile = useUserProfile();
  const isAuthenticated = useIsAuthenticated();
  
  // Get current time of day for personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = getUserDisplayName(profile);
  const greeting = getGreeting();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar || undefined} />
              <AvatarFallback className="text-lg bg-primary/10">
                {getUserInitials(profile)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl sm:text-3xl mb-2">
                {greeting}, {displayName}! 
                <Sparkles className="inline-block ml-2 h-6 w-6 text-primary" />
              </CardTitle>
              <CardDescription className="text-base">
                Welcome back to your dashboard. Here's what's happening with your projects today.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={cn('h-4 w-4', stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Today's Insights
          </CardTitle>
          <CardDescription>
            Key metrics and updates for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">All systems operational</p>
                <p className="text-xs text-muted-foreground">99.9% uptime in the last 30 days</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">Profile completion: 85%</p>
                <p className="text-xs text-muted-foreground">Add a bio and social links to complete your profile</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">New features available</p>
                <p className="text-xs text-muted-foreground">Check out the latest updates in your settings</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}