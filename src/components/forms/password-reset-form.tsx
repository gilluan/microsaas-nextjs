'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  type ForgotPasswordFormData,
  type ResetPasswordFormData
} from '@/lib/schemas/auth';
import { cn } from '@/lib/utils';

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
  className?: string;
}

type ResetStep = 'request' | 'confirm';

export function PasswordResetForm({
  onSuccess,
  onBackToLogin,
  className
}: PasswordResetFormProps) {
  const [step, setStep] = React.useState<ResetStep>('request');
  const [resetEmail, setResetEmail] = React.useState('');
  const { requestPasswordReset, confirmPasswordReset, isLoading, error, clearError } = useAuthStore();

  const requestForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const confirmForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      code: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onRequestSubmit = async (data: ForgotPasswordFormData) => {
    try {
      clearError();
      await requestPasswordReset(data);
      setResetEmail(data.email);
      setStep('confirm');
      requestForm.reset();
    } catch (error) {
      console.error('Password reset request failed:', error);
    }
  };

  const onConfirmSubmit = async (data: ResetPasswordFormData) => {
    try {
      clearError();
      await confirmPasswordReset({
        email: resetEmail,
        confirmationCode: data.code,
        newPassword: data.newPassword
      });
      confirmForm.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Password reset confirmation failed:', error);
    }
  };

  const handleBackToRequest = () => {
    setStep('request');
    setResetEmail('');
    confirmForm.reset();
    clearError();
  };

  const isFormLoading = isLoading || requestForm.formState.isSubmitting || confirmForm.formState.isSubmitting;

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          {step === 'confirm' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToRequest}
              disabled={isFormLoading}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold text-center">
              {step === 'request' ? 'Reset Password' : 'Enter New Password'}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 'request'
                ? 'Enter your email to receive a reset code'
                : `Enter the code sent to ${resetEmail}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  disabled={isFormLoading}
                  className={cn(
                    requestForm.formState.errors.email && 'border-destructive',
                    'pl-10'
                  )}
                  {...requestForm.register('email')}
                />
              </div>
              {requestForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {requestForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isFormLoading}
            >
              {isFormLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Code
            </Button>
          </form>
        ) : (
          <form onSubmit={confirmForm.handleSubmit(onConfirmSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Verification Code
              </label>
              <Input
                id="code"
                type="text"
                placeholder="Enter the 6-digit code"
                disabled={isFormLoading}
                maxLength={6}
                className={cn(
                  confirmForm.formState.errors.code && 'border-destructive',
                  'text-center text-lg tracking-widest'
                )}
                {...confirmForm.register('code')}
              />
              {confirmForm.formState.errors.code && (
                <p className="text-sm text-destructive">
                  {confirmForm.formState.errors.code.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  disabled={isFormLoading}
                  className={cn(
                    confirmForm.formState.errors.newPassword && 'border-destructive',
                    'pl-10'
                  )}
                  {...confirmForm.register('newPassword')}
                />
              </div>
              {confirmForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {confirmForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  disabled={isFormLoading}
                  className={cn(
                    confirmForm.formState.errors.confirmPassword && 'border-destructive',
                    'pl-10'
                  )}
                  {...confirmForm.register('confirmPassword')}
                />
              </div>
              {confirmForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {confirmForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isFormLoading}
            >
              {isFormLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </form>
        )}

        {step === 'request' && (
          <div className="text-center">
            <Button
              variant="link"
              onClick={onBackToLogin}
              disabled={isFormLoading}
              className="text-sm"
            >
              Back to Sign In
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <Button
              variant="link"
              onClick={() => {
                if (resetEmail) {
                  requestPasswordReset({ email: resetEmail });
                }
              }}
              disabled={isFormLoading}
              className="text-sm"
            >
              Resend code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}