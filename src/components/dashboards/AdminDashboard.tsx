
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield, UserPlus, Key, Lock, Activity, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const featureCards = [
    {
      title: 'User Management',
      description: 'Add, remove, and manage user accounts',
      icon: <UserPlus className="h-6 w-6 text-blue-500" />,
      action: () => navigate('/admin/users')
    },
    {
      title: 'Role-based Access',
      description: 'Control permissions with flexible roles',
      icon: <Shield className="h-6 w-6 text-indigo-500" />,
      action: () => navigate('/admin/roles')
    },
    {
      title: 'API Keys',
      description: 'Generate and manage secure API keys',
      icon: <Key className="h-6 w-6 text-violet-500" />,
      action: () => navigate('/admin/api-keys')
    },
    {
      title: 'Security Logs',
      description: 'Monitor authentication activity',
      icon: <Lock className="h-6 w-6 text-red-500" />,
      action: () => navigate('/admin/security-logs')
    },
    {
      title: 'Usage Analytics',
      description: 'Track user activity and engagement',
      icon: <Activity className="h-6 w-6 text-green-500" />,
      action: () => navigate('/admin/analytics')
    },
    {
      title: 'Reports',
      description: 'Generate detailed reports on access patterns',
      icon: <BarChart3 className="h-6 w-6 text-orange-500" />,
      action: () => navigate('/admin/reports')
    },
  ];

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Admin Features</h2>
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
                Manage
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default AdminDashboard;
