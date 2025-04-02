
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface MfaVerificationProps {
  email: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

interface OTPDigitInputProps {
  index: number;
  isActive: boolean;
  char: string;
  hasFakeCaret: boolean;
  onCharChange: (index: number, char: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  onFocus: (index: number) => void;
}

const OTPDigitInput: React.FC<OTPDigitInputProps> = ({
  index,
  isActive,
  char,
  hasFakeCaret,
  onCharChange,
  onKeyDown,
  onFocus,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  return (
    <div 
      className={`relative w-10 h-14 flex items-center justify-center border-2 ${
        isActive ? 'border-primary' : 'border-input'
      } rounded-md bg-background`}
      onClick={() => onFocus(index)}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={1}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        value={char}
        onChange={(e) => {
          const val = e.target.value;
          if (/^[0-9]?$/.test(val)) {
            onCharChange(index, val);
          }
        }}
        onKeyDown={(e) => onKeyDown(e, index)}
        onFocus={() => onFocus(index)}
      />
      <div className="text-xl font-medium">
        {char}
        {hasFakeCaret && isActive && (
          <div className="absolute bottom-2.5 w-[1px] h-[60%] bg-primary animate-blink"></div>
        )}
      </div>
    </div>
  );
};

const MfaVerification: React.FC<MfaVerificationProps> = ({ 
  email, 
  onSuccess, 
  onCancel 
}) => {
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [activeInput, setActiveInput] = useState(0);
  const [hasFakeCaret, setHasFakeCaret] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // OTP input handlers
  const handleCharChange = (index: number, char: string) => {
    const newOtpCode = [...otpCode];
    newOtpCode[index] = char;
    setOtpCode(newOtpCode);
    
    // Auto-advance to next input if character was entered
    if (char && index < 5) {
      setActiveInput(index + 1);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace to clear current field and move to previous
    if (e.key === 'Backspace') {
      if (otpCode[index]) {
        const newOtpCode = [...otpCode];
        newOtpCode[index] = '';
        setOtpCode(newOtpCode);
      } else if (index > 0) {
        setActiveInput(index - 1);
      }
    }
    // Handle left arrow key
    else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveInput(index - 1);
    }
    // Handle right arrow key
    else if (e.key === 'ArrowRight' && index < 5) {
      setActiveInput(index + 1);
    }
    // Handle paste event
    else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const pastedDigits = text.trim().replace(/\D/g, '').substring(0, 6).split('');
        const newOtpCode = [...otpCode];
        
        pastedDigits.forEach((digit, i) => {
          if (i < 6) {
            newOtpCode[i] = digit;
          }
        });
        
        setOtpCode(newOtpCode);
        if (pastedDigits.length === 6) {
          // Focus on the last input after pasting a complete code
          setActiveInput(5);
        } else if (pastedDigits.length > 0) {
          // Focus on the next empty input
          setActiveInput(Math.min(pastedDigits.length, 5));
        }
      });
    }
  };
  
  const verifyMfaCode = async () => {
    const token = otpCode.join('');
    if (token.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }
    
    setIsVerifying(true);
    try {
      await api.mfa.verifyMfa(email, token);
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
          disabled={isVerifying || otpCode.join('').length !== 6}
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
