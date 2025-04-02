
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Copy, Terminal, Smartphone } from 'lucide-react';
import { api } from '@/lib/api';
import OTPDigitInput from '@/components/ui/otp-input';
import { useOtp } from '@/hooks/use-otp';

interface MfaSetupProps {
  onSetupComplete?: () => void;
  onCancel?: () => void;
}

const MfaSetup: React.FC<MfaSetupProps> = ({ onSetupComplete, onCancel }) => {
  const [step, setStep] = useState<'generate' | 'verify'>('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [activeTab, setActiveTab] = useState<'app' | 'manual'>('app');
  
  const {
    otpCode,
    activeInput,
    hasFakeCaret,
    handleCharChange,
    handleKeyDown,
    setActiveInput,
    getToken
  } = useOtp();
  
  useEffect(() => {
    generateQrCode();
  }, []);
  
  const generateQrCode = async () => {
    setIsLoading(true);
    try {
      const response = await api.auth.generateMfaSecret();
      setQrCodeUrl(response.qrCodeUrl);
      setSecret(response.secretKey);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate MFA setup. Please try again.');
      setIsLoading(false);
    }
  };
  
  const verifyMfa = async () => {
    const token = getToken();
    if (token.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.auth.enableMfa(token);
      toast.success('MFA successfully enabled for your account');
      if (onSetupComplete) {
        onSetupComplete();
      }
    } catch (error) {
      console.error('Error verifying MFA token:', error);
      toast.error('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copySecretToClipboard = () => {
    navigator.clipboard.writeText(secret);
    toast.success('Secret key copied to clipboard');
  };
  
  const renderOtpInputs = () => {
    return (
      <div className="flex gap-2 justify-center my-4">
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
    );
  };
  
  if (isLoading && !qrCodeUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center text-muted-foreground">
          Generating your MFA setup...
        </p>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-md mx-auto">
      {step === 'generate' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-center">
            Set up Two-Factor Authentication
          </h2>
          <p className="text-muted-foreground text-center">
            Enhance your account security by setting up two-factor authentication with an authenticator app.
          </p>
          
          <Tabs value={activeTab} onValueChange={(t) => setActiveTab(t as 'app' | 'manual')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="app">
                <Smartphone className="h-4 w-4 mr-2" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="manual">
                <Terminal className="h-4 w-4 mr-2" />
                Manual Entry
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="app" className="pt-4">
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="bg-white p-3 rounded-lg">
                  {qrCodeUrl && <QRCodeSVG value={qrCodeUrl} size={200} />}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="pt-4">
              <div className="flex flex-col p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-4">
                  If you can't scan the QR code, enter this code manually in your authenticator app:
                </p>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg mb-2">
                  <code className="text-sm font-mono">{secret}</code>
                  <Button variant="ghost" size="icon" onClick={copySecretToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  In your authenticator app, select "Enter setup key" and enter the key above.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => setStep('verify')}>
              Continue
            </Button>
          </div>
        </div>
      )}
      
      {step === 'verify' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-center">
            Verify Two-Factor Authentication
          </h2>
          <p className="text-muted-foreground text-center">
            Enter the 6-digit verification code from your authenticator app to complete setup.
          </p>
          
          {renderOtpInputs()}
          
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep('generate')}>
              Back
            </Button>
            <Button 
              onClick={verifyMfa} 
              disabled={isLoading || getToken().length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Enable'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MfaSetup;
