
import React from 'react';
import { useAuthorization } from '@/hooks/useAuthorization';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const RolePermissionInfo: React.FC = () => {
  const { user, getUserPermissions } = useAuthorization();
  const permissions = getUserPermissions();
  
  if (!user) return null;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Role & Permissions</CardTitle>
        <CardDescription>
          Your current role and associated permissions in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Role</h3>
            <Badge variant="outline" className="capitalize text-primary">
              {user.role}
            </Badge>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Permissions ({permissions.length})</h3>
            <div className="flex flex-wrap gap-2">
              {permissions.map((permission) => (
                <Badge 
                  key={permission} 
                  variant="secondary"
                  className="text-xs"
                >
                  {permission}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
