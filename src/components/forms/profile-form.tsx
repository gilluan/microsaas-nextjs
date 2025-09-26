'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, X, User, Mail, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  useUserStore,
  useUserProfile,
  useUserLoading,
  useUserError,
  useIsUploadingAvatar,
  validateAvatarFile,
  getUserInitials
} from '@/stores/user-store';
import { UserProfileSchema, type UserProfile } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface ProfileFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function ProfileForm({ onSuccess, className }: ProfileFormProps) {
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const profile = useUserProfile();
  const isLoading = useUserLoading();
  const error = useUserError();
  const isUploadingAvatar = useIsUploadingAvatar();
  const { updateProfile, uploadAvatar, clearError } = useUserStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
    watch
  } = useForm<UserProfile>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || ''
    }
  });

  // Watch form values for real-time preview
  const watchedName = watch('name');
  const watchedEmail = watch('email');

  // Reset form when profile changes
  React.useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        email: profile.email || ''
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: UserProfile) => {
    try {
      clearError();
      await updateProfile({
        name: data.name || undefined,
        email: data.email || undefined
      });
      onSuccess?.();
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateAvatarFile(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setUploadDialogOpen(true);
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;

    try {
      clearError();
      await uploadAvatar(selectedFile);
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Avatar upload failed:', error);
    }
  };

  const handleCancelUpload = () => {
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isFormLoading = isLoading || isSubmitting;
  const hasChanges = isDirty || selectedFile;

  // Real-time preview data
  const previewData = {
    name: watchedName || profile?.name || '',
    email: watchedEmail || profile?.email || '',
    avatar: avatarPreview || profile?.avatar || null
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Profile Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Preview</CardTitle>
          <CardDescription>
            See how your profile will look with your changes
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={previewData.avatar || undefined} />
            <AvatarFallback className="text-lg">
              {getUserInitials({ name: previewData.name, email: previewData.email } as any)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">
              {previewData.name || 'Your Name'}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {previewData.email || 'your.email@example.com'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your personal information and avatar
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar || undefined} />
              <AvatarFallback className="text-xl">
                {getUserInitials(profile)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium">Profile Picture</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Upload a new avatar (max 5MB, JPEG/PNG/GIF/WebP)
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isFormLoading || isUploadingAvatar}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {isUploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  disabled={isFormLoading}
                  className={cn(errors.name && 'border-destructive', 'pl-10')}
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  disabled={isFormLoading}
                  className={cn(errors.email && 'border-destructive', 'pl-10')}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isFormLoading || !hasChanges}
                className="flex-1"
              >
                {isFormLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isFormLoading || !isDirty}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Avatar Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload New Avatar</DialogTitle>
            <DialogDescription>
              Preview your new avatar before uploading
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4">
            {avatarPreview && (
              <Avatar className="h-32 w-32">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback>
                  <Upload className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
            )}
            
            {selectedFile && (
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
            
            <div className="flex gap-3 w-full">
              <Button
                onClick={handleAvatarUpload}
                disabled={!selectedFile || isUploadingAvatar}
                className="flex-1"
              >
                {isUploadingAvatar && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload Avatar
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelUpload}
                disabled={isUploadingAvatar}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}