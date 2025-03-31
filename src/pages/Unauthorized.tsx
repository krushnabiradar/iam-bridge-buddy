
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useAuthorization } from '@/hooks/useAuthorization';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user } = useAuthorization();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10 text-red-600 dark:text-red-200"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-bold">Access Denied</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          You don't have permission to access this page.
        </p>
        
        {user && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You are logged in as: <span className="font-semibold">{user.name}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your role: <span className="font-semibold capitalize">{user.role}</span>
            </p>
          </div>
        )}
        
        <div className="mt-6 flex gap-2">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
          >
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
          <Button 
            onClick={logout}
            variant="destructive"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
