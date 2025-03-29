
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import OtpVerification from '@/components/OtpVerification';
import PasswordReset from '@/components/PasswordReset';

type ResetStep = 'email' | 'otp' | 'reset';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<ResetStep>('email');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await api.auth.requestPasswordReset(email);
      toast.success('OTP has been sent to your email');
      setCurrentStep('otp');
    } catch (error) {
      console.error('Error requesting password reset:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/auth');
  };

  const handleOtpVerified = () => {
    setCurrentStep('reset');
  };

  const handlePasswordReset = () => {
    toast.success('Password reset successfully!');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="space-y-1">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBackToLogin}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
          </div>
          <CardDescription>
            {currentStep === 'email' && 'Enter your email to receive a one-time password'}
            {currentStep === 'otp' && 'Enter the verification code sent to your email'}
            {currentStep === 'reset' && 'Create a new password for your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 'email' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 input-focus-ring"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </Button>
            </form>
          )}

          {currentStep === 'otp' && (
            <OtpVerification 
              email={email} 
              onVerified={handleOtpVerified}
              onBackToEmail={() => setCurrentStep('email')}
            />
          )}

          {currentStep === 'reset' && (
            <PasswordReset 
              email={email} 
              onReset={handlePasswordReset}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
