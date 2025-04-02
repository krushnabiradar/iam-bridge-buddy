
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import OTPDigitInput from '@/components/ui/otp-input';
import { useOtp } from '@/hooks/use-otp';

interface MfaVerificationProps {
  email: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

const MfaVerification: React.FC<MfaVerificationProps> = ({ 
  email, 
  onSuccess, 
  onCancel 
}) => {
  const [isVerifying, setIsVerifying] = React.useState(false);
  const {
    otpCode,
    activeInput,
    hasFakeCaret,
    handleCharChange,
    handleKeyDown,
    setActiveInput,
    getToken
  } = useOtp();
  
  const verifyMfaCode = async () => {
    const token = getToken();
    if (token.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }
    
    setIsVerifying(true);
    try {
      // Adding an empty string for password and false for remember since we're just verifying the token
      await api.auth.verifyMfa(email, '', token, false);
      toast.success('MFA verified successfully');
      onSuccess();
    } catch (error) {
      console.error('Error verifying MFA token:', error);
      toast.error('Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Automatically verify when 6 digits are entered
  useEffect(() => {
    if (otpCode.every(digit => digit !== '') && !isVerifying) {
      verifyMfaCode();
    }
  }, [otpCode]);

  return (
    <div className="w-full space-y-4">
      <h2 className="text-lg font-medium text-center">
        Two-Factor Authentication
      </h2>
      <p className="text-sm text-muted-foreground text-center">
        Enter the 6-digit code from your authenticator app
      </p>
      
      <div className="flex gap-2 justify-center my-6">
        {otpCode.map((char, i) => (
          <OTPDigitInput
            key={i}
            index={i}
            isActive={activeInput === i}
            char={char}
            hasFakeCaret={hasFakeCaret}
            onCharChange={handleCharChange}
            onKeyDown={handleKeyDown}
            onFocus={(index) => setActiveInput(index)}
          />
        ))}
      </div>
      
      <div className="flex justify-between">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button 
          onClick={verifyMfaCode} 
          disabled={isVerifying || getToken().length !== 6}
          className={!onCancel ? 'w-full' : ''}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </Button>
      </div>
    </div>
  );
};

export default MfaVerification;
