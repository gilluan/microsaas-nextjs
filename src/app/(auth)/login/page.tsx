'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/forms/login-form';
import { PasswordResetForm } from '@/components/forms/password-reset-form';

type LoginView = 'login' | 'reset';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = React.useState<LoginView>('login');
  
  // Check if we should show password reset form from URL params
  React.useEffect(() => {
    if (searchParams.get('reset') === 'true') {
      setView('reset');
    }
  }, [searchParams]);

  const handleLoginSuccess = () => {
    // Get redirect URL from search params, default to dashboard
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    router.push(redirectTo);
  };

  const handleRegisterClick = () => {
    // Preserve redirect URL when navigating to register
    const redirectTo = searchParams.get('redirect');
    const registerUrl = redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : '/register';
    router.push(registerUrl);
  };

  const handleForgotPasswordClick = () => {
    setView('reset');
    // Update URL to reflect the current view
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('reset', 'true');
    window.history.replaceState({}, '', newUrl.toString());
  };

  const handleBackToLogin = () => {
    setView('login');
    // Remove reset param from URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('reset');
    window.history.replaceState({}, '', newUrl.toString());
  };

  const handleResetSuccess = () => {
    // Show success message and redirect to login
    alert('Password reset successful! Please sign in with your new password.');
    handleBackToLogin();
  };

  if (view === 'reset') {
    return (
      <PasswordResetForm
        onSuccess={handleResetSuccess}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  return (
    <LoginForm
      onSuccess={handleLoginSuccess}
      onRegisterClick={handleRegisterClick}
      onForgotPasswordClick={handleForgotPasswordClick}
    />
  );
}