
import React, { useEffect, useRef } from 'react';

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

export default OTPDigitInput;
