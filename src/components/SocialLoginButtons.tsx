
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Github } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/api';
import { toast } from "sonner";

interface SocialLoginButtonsProps {
  isLoading: boolean;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ isLoading }) => {
  const { socialLogin } = useAuth();

  // Server-side OAuth flow
  const handleGoogleLoginServerFlow = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const handleGitHubLoginServerFlow = () => {
    window.location.href = `${API_BASE_URL}/auth/github`;
  };

  // Client-side OAuth flow - examples for development/testing
  const handleGoogleLoginClientFlow = async () => {
    try {
      // In a real implementation, this would use something like Google Sign-In API
      // to get an auth token and then pass that to the backend
      console.log("This would normally trigger Google's OAuth popup");
      
      // Mock implementation for development
      if (process.env.NODE_ENV !== 'production') {
        const mockUserData = {
          id: '123456789',
          name: 'Google Test User',
          email: 'google-user@example.com',
          avatar: 'https://ui-avatars.com/api/?name=Google+User&background=random'
        };
        
        await socialLogin('Google', mockUserData);
      }
    } catch (error) {
      console.error('Google login failed:', error);
      toast.error('Google login failed. Please try again.');
    }
  };

  const handleGitHubLoginClientFlow = async () => {
    try {
      // In a real implementation, this would use GitHub's OAuth libraries
      // to get an auth token and then pass that to the backend
      console.log("This would normally trigger GitHub's OAuth popup");
      
      // Mock implementation for development
      if (process.env.NODE_ENV !== 'production') {
        const mockUserData = {
          id: '987654321',
          name: 'GitHub Test User',
          email: 'github-user@example.com',
          avatar: 'https://ui-avatars.com/api/?name=GitHub+User&background=random'
        };
        
        await socialLogin('GitHub', mockUserData);
      }
    } catch (error) {
      console.error('GitHub login failed:', error);
      toast.error('GitHub login failed. Please try again.');
    }
  };

  // Use server-side flow for production, client-side flow for development
  const handleGoogleLogin = process.env.NODE_ENV === 'production' 
    ? handleGoogleLoginServerFlow 
    : handleGoogleLoginClientFlow;

  const handleGitHubLogin = process.env.NODE_ENV === 'production' 
    ? handleGitHubLoginServerFlow 
    : handleGitHubLoginClientFlow;

  return (
    <div className="flex flex-col gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 hover-lift"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </>
        )}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={handleGitHubLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 hover-lift"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Github className="h-4 w-4" />
            Continue with GitHub
          </>
        )}
      </Button>
    </div>
  );
};

export default SocialLoginButtons;
