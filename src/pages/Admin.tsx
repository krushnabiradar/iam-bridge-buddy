
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthorization } from '@/hooks/useAuthorization';

const Admin = () => {
  const navigate = useNavigate();
  const { user, getUserPermissions } = useAuthorization();
  const permissions = getUserPermissions();
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              disabled={!permissions.includes('read:users')}
            >
              View All Users
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>Manage user roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full"
              disabled={!permissions.includes('assign:role')}
            >
              Manage Roles
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Organization Management</CardTitle>
            <CardDescription>Manage organizations and tenants</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full"
              disabled={!permissions.includes('create:organization')}
            >
              Create Organization
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
