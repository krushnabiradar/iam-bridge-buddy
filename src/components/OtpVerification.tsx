
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { OTP_LENGTH } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface OtpVerificationProps {
  email: string;
  onVerified: () => void;
  onBackToEmail: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({
  email,
  onVerified,
  onBackToEmail
}) => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Auto focus first input on mount
    const input = document.getElementById(`otp-input-0`);
    if (input) {
      input.focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (value === '' || /^[0-9]$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Move to next input if value is entered
      if (value !== '' && index < OTP_LENGTH - 1) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  const renderInput = (index: number) => {
    const isActive = index === activeIndex;
    const char = otp[index];
    const hasFakeCaret = isActive && !char;
    
    return (
      <div key={index} className="relative w-10 h-12">
        <Input
          id={`otp-input-${index}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={char}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={() => handleFocus(index)}
          className={cn(
            "w-full h-full text-center text-xl font-semibold bg-background border rounded-md focus:ring-2 focus:ring-primary focus:border-primary",
            isActive && "border-primary"
          )}
          disabled={isLoading}
        />
        {hasFakeCaret && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary animate-caret" />
        )}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) {
      toast.error(`Please enter all ${OTP_LENGTH} digits`);
      return;
    }
    
    setIsLoading(true);
    try {
      // Fix: Use the correct method name verifyPasswordResetOtp instead of verifyOtp
      await api.auth.verifyPasswordResetOtp(email, otpString);
      toast.success('OTP verified successfully');
      onVerified();
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await api.auth.requestPasswordReset(email);
      toast.success('New OTP has been sent to your email');
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-4 text-muted-foreground hover:text-foreground"
          onClick={onBackToEmail}
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Email
        </Button>
        
        <p className="text-sm text-center mb-6">
          We've sent a verification code to<br />
          <span className="font-medium">{email}</span>
        </p>
        
        <div className="flex justify-center space-x-2 mb-2">
          {Array.from({ length: OTP_LENGTH }).map((_, index) => renderInput(index))}
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify OTP'
        )}
      </Button>
      
      <p className="text-center text-sm">
        Didn't receive the code?{' '}
        <Button 
          type="button" 
          variant="link" 
          className="p-0 h-auto font-normal"
          onClick={handleResendOtp}
          disabled={isLoading}
        >
          Resend
        </Button>
      </p>
    </form>
  );
};

export default OtpVerification;
