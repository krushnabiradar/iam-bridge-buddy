
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, CheckCircle, QrCode } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const MfaSetup = () => {
  const { user, updateUserData } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Fetch MFA status on component mount
  useEffect(() => {
    if (user?.id) {
      setMfaEnabled(user.mfaEnabled || false);
    }
  }, [user]);

  const handleGenerateSecret = async () => {
    setIsLoading(true);
    try {
      const response = await api.auth.generateMfaSecret();
      setQrCodeUrl(response.qrCodeUrl);
      setSecretKey(response.secretKey);
      setShowSetup(true);
    } catch (error) {
      console.error('Error generating MFA secret:', error);
      toast({
        title: "Error",
        description: "Failed to generate MFA setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.auth.enableMfa(verificationCode);
      setMfaEnabled(true);
      
      // Update user data with MFA status
      if (user) {
        updateUserData({
          ...user,
          mfaEnabled: true
        });
      }
      
      toast({
        title: "MFA Enabled",
        description: "Multi-factor authentication has been enabled for your account.",
      });
      setShowSetup(false);
    } catch (error) {
      console.error('Error enabling MFA:', error);
      toast({
        title: "Verification Failed",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    setIsLoading(true);
    try {
      await api.auth.disableMfa();
      setMfaEnabled(false);
      
      // Update user data with MFA status
      if (user) {
        updateUserData({
          ...user,
          mfaEnabled: false
        });
      }
      
      toast({
        title: "MFA Disabled",
        description: "Multi-factor authentication has been disabled for your account.",
      });
    } catch (error) {
      console.error('Error disabling MFA:', error);
      toast({
        title: "Error",
        description: "Failed to disable MFA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Multi-Factor Authentication</CardTitle>
        <CardDescription>
          Secure your account with an additional layer of protection by enabling two-factor authentication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showSetup ? (
          <div className="flex items-center justify-between py-4">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                {mfaEnabled 
                  ? "Your account is protected with 2FA" 
                  : "Add an extra layer of security to your account"}
              </p>
            </div>
            <Switch
              checked={mfaEnabled}
              disabled={isLoading}
              onCheckedChange={() => {
                if (mfaEnabled) {
                  handleDisableMfa();
                } else {
                  handleGenerateSecret();
                }
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Scan the QR code with your authenticator app or enter the secret key manually.
                Keep your recovery codes in a safe place.
              </AlertDescription>
            </Alert>
            
            {qrCodeUrl && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="border p-4 rounded-lg bg-white">
                  <img src={qrCodeUrl} alt="QR Code for MFA" className="w-48 h-48" />
                </div>
                
                <div className="w-full">
                  <p className="text-sm font-medium mb-1">Secret Key</p>
                  <div className="flex">
                    <code className="p-2 bg-muted rounded text-sm flex-1 font-mono overflow-x-auto">
                      {secretKey}
                    </code>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="ml-2"
                      onClick={() => {
                        navigator.clipboard.writeText(secretKey);
                        toast({
                          title: "Copied",
                          description: "Secret key copied to clipboard",
                        });
                      }}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Verification Code</p>
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
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          </div>
        )}
      </CardContent>
      
      {showSetup && (
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setShowSetup(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleVerifyAndEnable}
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Enable 2FA"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default MfaSetup;
