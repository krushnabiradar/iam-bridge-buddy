
import { useState } from 'react';

export function useOtp(length: number = 6) {
  const [otpCode, setOtpCode] = useState<string[]>(Array(length).fill(''));
  const [activeInput, setActiveInput] = useState(0);
  const [hasFakeCaret, setHasFakeCaret] = useState(true);
  
  const handleCharChange = (index: number, char: string) => {
    const newOtpCode = [...otpCode];
    newOtpCode[index] = char;
    setOtpCode(newOtpCode);
    
    // Auto-advance to next input if character was entered
    if (char && index < length - 1) {
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
    else if (e.key === 'ArrowRight' && index < length - 1) {
      setActiveInput(index + 1);
    }
    // Handle paste event
    else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const pastedDigits = text.trim().replace(/\D/g, '').substring(0, length).split('');
        const newOtpCode = [...otpCode];
        
        pastedDigits.forEach((digit, i) => {
          if (i < length) {
            newOtpCode[i] = digit;
          }
        });
        
        setOtpCode(newOtpCode);
        if (pastedDigits.length === length) {
          // Focus on the last input after pasting a complete code
          setActiveInput(length - 1);
        } else if (pastedDigits.length > 0) {
          // Focus on the next empty input
          setActiveInput(Math.min(pastedDigits.length, length - 1));
        }
      });
    }
  };

  return {
    otpCode,
    setOtpCode,
    activeInput,
    setActiveInput,
    hasFakeCaret,
    setHasFakeCaret,
    handleCharChange,
    handleKeyDown,
    getToken: () => otpCode.join('')
  };
}
