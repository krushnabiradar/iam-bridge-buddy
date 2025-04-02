
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNotifications } from '@/context/NotificationContext';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const NotificationPreferences: React.FC = () => {
  const { preferences, isPreferencesLoading, updatePreferences } = useNotifications();

  if (isPreferencesLoading) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Loading your preferences...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Unable to load your notification preferences.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleToggleEmail = (key: keyof typeof preferences.email, value: boolean) => {
    updatePreferences({
      email: {
        [key]: value
      }
    });
  };

  const handleToggleInApp = (key: keyof typeof preferences.inApp, value: boolean) => {
    updatePreferences({
      inApp: {
        [key]: value
      }
    });
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Notification Preferences</h1>
      
      <div className="mb-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            Customize how you receive notifications. Toggle options below to enable or disable specific notification types.
          </AlertDescription>
        </Alert>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Configure which notifications you want to receive via email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">Security Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  Receive emails about suspicious activities and security updates
                </p>
              </div>
              <Switch 
                checked={preferences.email.securityAlerts}
                onCheckedChange={(checked) => handleToggleEmail('securityAlerts', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">Account Updates</h4>
                <p className="text-sm text-muted-foreground">
                  Receive emails about account activity and changes
                </p>
              </div>
              <Switch 
                checked={preferences.email.accountUpdates}
                onCheckedChange={(checked) => handleToggleEmail('accountUpdates', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">Role Changes</h4>
                <p className="text-sm text-muted-foreground">
                  Receive emails when your role or permissions change
                </p>
              </div>
              <Switch 
                checked={preferences.email.roleChanges}
                onCheckedChange={(checked) => handleToggleEmail('roleChanges', checked)}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>In-App Notifications</CardTitle>
            <CardDescription>
              Configure which notifications you want to see within the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">Security Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  Get notified about suspicious activities and security updates
                </p>
              </div>
              <Switch 
                checked={preferences.inApp.securityAlerts}
                onCheckedChange={(checked) => handleToggleInApp('securityAlerts', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">Account Updates</h4>
                <p className="text-sm text-muted-foreground">
                  Get notified about account activity and changes
                </p>
              </div>
              <Switch 
                checked={preferences.inApp.accountUpdates}
                onCheckedChange={(checked) => handleToggleInApp('accountUpdates', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">Role Changes</h4>
                <p className="text-sm text-muted-foreground">
                  Get notified when your role or permissions change
                </p>
              </div>
              <Switch 
                checked={preferences.inApp.roleChanges}
                onCheckedChange={(checked) => handleToggleInApp('roleChanges', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationPreferences;
