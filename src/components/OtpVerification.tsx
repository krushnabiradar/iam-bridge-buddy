
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from '@/components/ui/input-otp';

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
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      await api.auth.verifyPasswordResetOtp(email, otp);
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
    setIsResending(true);
    try {
      await api.auth.requestPasswordReset(email);
      toast.success('A new OTP has been sent to your email');
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          We've sent a 6-digit code to <span className="font-semibold">{email}</span>
        </p>
        <div className="flex justify-center my-6">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, index) => (
                  <React.Fragment key={index}>
                    <InputOTPSlot className="w-10 h-12 text-lg" {...slot} />
                    {index !== slots.length - 1 && <InputOTPSeparator />}
                  </React.Fragment>
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
      </div>

      <Button
        className="w-full"
        onClick={handleVerify}
        disabled={isLoading || otp.length !== 6}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Verify Code
          </>
        )}
      </Button>

      <div className="flex justify-between items-center pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToEmail}
          disabled={isLoading || isResending}
        >
          Change Email
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResendOtp}
          disabled={isLoading || isResending}
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Resending...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-3 w-3" />
              Resend Code
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default OtpVerification;
