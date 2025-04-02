
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";

interface MfaVerificationProps {
  email: string;
  password: string;
  onSuccess: (response: any) => void;
  onCancel: () => void;
  remember?: boolean;
}

const MfaVerification: React.FC<MfaVerificationProps> = ({
  email,
  password,
  onSuccess,
  onCancel,
  remember = false
}) => {
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.auth.verifyMfa(email, password, verificationCode, remember);
      onSuccess(response);
    } catch (error) {
      console.error('MFA verification failed:', error);
      toast({
        title: "Verification Failed",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the verification code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <InputOTP 
            maxLength={6}
            value={verificationCode}
            onChange={setVerificationCode}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} {...slot} />
                ))}
              </InputOTPGroup>
            )}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Open your authenticator app to view your verification code
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button 
          onClick={handleVerify}
          disabled={isLoading || verificationCode.length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MfaVerification;
