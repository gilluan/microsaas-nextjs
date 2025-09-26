'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProfileForm } from '@/components/forms/profile-form';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useIsAuthenticated } from '@/stores/auth-store';
import { useUserProfile } from '@/stores/user-store';
import { useActivityStore } from '@/stores/activity-store';
import { formatActivityTime } from '@/stores/activity-store';
import {
  User,
  Mail,
  Calendar,
  Clock,
  Activity,
  Settings,
  Shield
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const profile = useUserProfile();
  const { addActivity } = useActivityStore();

  // Redirect unauthenticated users to login
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/profile');
      return;
    }
  }, [isAuthenticated, router]);

  // Log profile page visit
  React.useEffect(() => {
    if (isAuthenticated) {
      addActivity({
        activityType: 'PROFILE_UPDATE',
        description: 'Visited profile page',
        metadata: {
          page: '/dashboard/profile',
          timestamp: new Date().toISOString()
        }
      }).catch(console.error);
    }
  }, [isAuthenticated, addActivity]);

  const handleProfileUpdateSuccess = () => {
    // Log successful profile update
    addActivity({
      activityType: 'PROFILE_UPDATE',
      description: 'Updated profile information',
      metadata: {
        timestamp: new Date().toISOString()
      }
    }).catch(console.error);
  };

  // Don't render profile if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Verified Account
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile form */}
            <div className="lg:col-span-2">
              <ProfileForm onSuccess={handleProfileUpdateSuccess} />
            </div>
            
            {/* Profile stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Information</CardTitle>
                  <CardDescription>
                    Your account details and status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.email || 'Not set'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Member since</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.createdAt 
                          ? new Date(profile.createdAt).toLocaleDateString()
                          : 'Unknown'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last updated</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.updatedAt 
                          ? formatActivityTime(profile.updatedAt)
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Completion</CardTitle>
                  <CardDescription>
                    Complete your profile to unlock all features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Profile completion</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Add a bio and social links to reach 100%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent account activity and changes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ActivityFeed showHeader={false} className="border-0" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Badge variant="secondary">Not enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Login Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone signs into your account
                    </p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Data Export</h4>
                    <p className="text-sm text-muted-foreground">
                      Download a copy of your account data
                    </p>
                  </div>
                  <Badge variant="outline">Available</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}