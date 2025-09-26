'use client';

import React from 'react';
import Link from 'next/link';
import {
  Plus,
  Settings,
  User,
  FileText,
  Upload,
  Download,
  BarChart3,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  className?: string;
}

const primaryActions = [
  {
    title: 'Create Project',
    description: 'Start a new project from scratch',
    icon: Plus,
    href: '/dashboard/projects/new',
    color: 'bg-primary text-primary-foreground hover:bg-primary/90'
  },
  {
    title: 'Edit Profile',
    description: 'Update your personal information',
    icon: User,
    href: '/dashboard/profile',
    color: 'bg-blue-600 text-white hover:bg-blue-700'
  },
  {
    title: 'View Analytics',
    description: 'Check your project statistics',
    icon: BarChart3,
    href: '/dashboard/analytics',
    color: 'bg-green-600 text-white hover:bg-green-700'
  },
  {
    title: 'Settings',
    description: 'Configure your preferences',
    icon: Settings,
    href: '/dashboard/settings',
    color: 'bg-purple-600 text-white hover:bg-purple-700'
  }
];

const secondaryActions = [
  {
    title: 'Documentation',
    description: 'Browse the help docs',
    icon: FileText,
    href: '/docs',
    external: false
  },
  {
    title: 'Import Data',
    description: 'Upload your existing data',
    icon: Upload,
    href: '/dashboard/import',
    external: false
  },
  {
    title: 'Export Data',
    description: 'Download your data',
    icon: Download,
    href: '/dashboard/export',
    external: false
  },
  {
    title: 'Get Help',
    description: 'Contact our support team',
    icon: HelpCircle,
    href: '/support',
    external: false
  }
];

export function QuickActions({ className }: QuickActionsProps) {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Primary Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts to get things done faster
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {primaryActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  asChild
                  className={cn(
                    'h-auto p-4 flex flex-col items-center gap-3 text-center',
                    action.color
                  )}
                >
                  <Link href={action.href}>
                    <Icon className="h-6 w-6" />
                    <div>
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs opacity-90 mt-1">
                        {action.description}
                      </div>
                    </div>
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Actions */}
      <Card>
        <CardHeader>
          <CardTitle>More Actions</CardTitle>
          <CardDescription>
            Additional tools and resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {secondaryActions.map((action, index) => {
              const Icon = action.icon;
              const Component = action.external ? 'a' : Link;
              const linkProps = action.external 
                ? { href: action.href, target: '_blank', rel: 'noopener noreferrer' }
                : { href: action.href };

              return (
                <Button
                  key={index}
                  asChild
                  variant="outline"
                  className="h-auto p-4 justify-start"
                >
                  <Component {...linkProps}>
                    <Icon className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </Component>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Account</CardTitle>
          <CardDescription>
            Manage your account and security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/security">
                <Settings className="h-4 w-4 mr-3" />
                Security Settings
              </Link>
            </Button>
            
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Pro Tip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            You can use keyboard shortcuts to navigate quickly. Press{' '}
            <kbd className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 rounded border">
              Cmd + K
            </kbd>{' '}
            to open the command palette.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}