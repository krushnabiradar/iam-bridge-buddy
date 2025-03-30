
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Shield, Key, Lock, HelpCircle } from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();
  
  const featureCards = [
    {
      title: 'My Profile',
      description: 'View and update your account information',
      icon: <User className="h-6 w-6 text-blue-500" />,
      action: () => navigate('/profile')
    },
    {
      title: 'Account Settings',
      description: 'Manage your account preferences',
      icon: <Settings className="h-6 w-6 text-green-500" />,
      action: () => navigate('/settings')
    },
    {
      title: 'Security',
      description: 'Update password and security settings',
      icon: <Shield className="h-6 w-6 text-indigo-500" />,
      action: () => navigate('/security')
    },
    {
      title: 'API Keys',
      description: 'Manage your API access tokens',
      icon: <Key className="h-6 w-6 text-violet-500" />,
      action: () => navigate('/api-keys')
    },
    {
      title: 'Login Activity',
      description: 'View recent login sessions',
      icon: <Lock className="h-6 w-6 text-orange-500" />,
      action: () => navigate('/login-activity')
    },
    {
      title: 'Help & Support',
      description: 'Get assistance with your account',
      icon: <HelpCircle className="h-6 w-6 text-red-500" />,
      action: () => navigate('/support')
    },
  ];

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Account Management</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureCards.map((card, index) => (
          <Card 
            key={index} 
            className="glass-card overflow-hidden hover-lift"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
                {card.icon}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{card.description}</p>
              <Button variant="outline" className="w-full" onClick={card.action}>
                View
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default UserDashboard;
