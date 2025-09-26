'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RegisterForm } from '@/components/forms/register-form';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRegisterSuccess = () => {
    // Get redirect URL from search params, default to dashboard
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    
    // Show success message
    alert('Registration successful! Welcome to MicroSaaS.');
    
    // Redirect to dashboard or specified URL
    router.push(redirectTo);
  };

  const handleLoginClick = () => {
    // Preserve redirect URL when navigating to login
    const redirectTo = searchParams.get('redirect');
    const loginUrl = redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login';
    router.push(loginUrl);
  };

  return (
    <RegisterForm
      onSuccess={handleRegisterSuccess}
      onLoginClick={handleLoginClick}
    />
  );
}