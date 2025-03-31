
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthFormEnhanced from '@/components/AuthFormEnhanced';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const Auth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <div className="w-full max-w-md text-center mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Identity & Access</h1>
        <p className="text-muted-foreground">Secure authentication and authorization system</p>
      </div>
      
      {isLoading ? (
        <div className="w-full max-w-md">
          <Skeleton className="h-[480px] w-full rounded-lg" />
        </div>
      ) : (
        <AuthFormEnhanced />
      )}
      
      <p className="mt-8 text-center text-sm text-muted-foreground animate-fade-in">
        By continuing, you agree to our{' '}
        <a href="#" className="underline underline-offset-2 hover:text-primary transition-colors">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="underline underline-offset-2 hover:text-primary transition-colors">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
};

export default Auth;
