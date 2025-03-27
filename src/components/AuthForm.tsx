
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import SocialLoginButtons from './SocialLoginButtons';
import { toast } from "sonner";

type AuthMode = 'login' | 'register' | 'sso';

const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [ssoToken, setSsoToken] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  const { login, register, ssoLogin, isLoading: authLoading } = useAuth();
  
  const isLoading = formLoading || authLoading;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setFormLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setFormLoading(true);
    try {
      await register(name, email, password);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSsoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoToken) {
      toast.error("Please enter an SSO token");
      return;
    }
    
    setFormLoading(true);
    try {
      await ssoLogin(ssoToken);
    } catch (error) {
      console.error('SSO login error:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    // Clear form when switching modes
    setEmail('');
    setPassword('');
    setName('');
    setSsoToken('');
  };

  return (
    <div className="w-full max-w-md p-6 glass-card rounded-xl animate-scale-in">
      <div className="flex mb-6 justify-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => toggleMode('login')}
          className={`${mode === 'login' ? 'text-primary' : 'text-muted-foreground'} relative`}
        >
          Sign In
          {mode === 'login' && (
            <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full" />
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={() => toggleMode('register')}
          className={`${mode === 'register' ? 'text-primary' : 'text-muted-foreground'} relative`}
        >
          Sign Up
          {mode === 'register' && (
            <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full" />
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={() => toggleMode('sso')}
          className={`${mode === 'sso' ? 'text-primary' : 'text-muted-foreground'} relative`}
        >
          SSO
          {mode === 'sso' && (
            <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full" />
          )}
        </Button>
      </div>

      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="input-focus-ring"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button
                variant="link"
                className="px-0 text-xs text-muted-foreground"
                onClick={() => toast.info("Password reset feature would go here")}
              >
                Forgot password?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="input-focus-ring"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-xs text-muted-foreground">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          <SocialLoginButtons isLoading={isLoading} />
        </form>
      )}

      {mode === 'register' && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="input-focus-ring"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="input-focus-ring"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="input-focus-ring"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create Account"
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-xs text-muted-foreground">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          <SocialLoginButtons isLoading={isLoading} />
        </form>
      )}

      {mode === 'sso' && (
        <form onSubmit={handleSsoLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sso-token">SSO Token</Label>
            <Input
              id="sso-token"
              type="text"
              placeholder="Enter your organization's SSO token"
              value={ssoToken}
              onChange={(e) => setSsoToken(e.target.value)}
              disabled={isLoading}
              className="input-focus-ring"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Sign In with SSO"
            )}
          </Button>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Contact your administrator if you need help with SSO access.</p>
          </div>
        </form>
      )}
    </div>
  );
};

export default AuthForm;
