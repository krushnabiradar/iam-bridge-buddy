
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { 
  Shield, 
  Key, 
  UserPlus, 
  Lock, 
  Activity, 
  BarChart3,
  User
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format the last login time or use a placeholder if not available
  const formatLastLogin = () => {
    if (user?.lastLogin) {
      try {
        const lastLoginDate = new Date(user.lastLogin);
        return format(lastLoginDate, 'PPpp'); // Format: Jan 1, 2021, 12:00 PM
      } catch (error) {
        console.error('Error formatting last login date:', error);
        return 'Recently';
      }
    }
    return 'Recently';
  };

  const featureCards = [
    {
      title: 'User Management',
      description: 'Add, remove, and manage user accounts',
      icon: <UserPlus className="h-6 w-6 text-blue-500" />,
    },
    {
      title: 'Role-based Access',
      description: 'Control permissions with flexible roles',
      icon: <Shield className="h-6 w-6 text-indigo-500" />,
    },
    {
      title: 'API Keys',
      description: 'Generate and manage secure API keys',
      icon: <Key className="h-6 w-6 text-violet-500" />,
    },
    {
      title: 'Security Logs',
      description: 'Monitor authentication activity',
      icon: <Lock className="h-6 w-6 text-red-500" />,
    },
    {
      title: 'Usage Analytics',
      description: 'Track user activity and engagement',
      icon: <Activity className="h-6 w-6 text-green-500" />,
    },
    {
      title: 'Reports',
      description: 'Generate detailed reports on access patterns',
      icon: <BarChart3 className="h-6 w-6 text-orange-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <NavBar />
      <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle className="text-2xl">Welcome, {user?.name?.split(' ')[0]}</CardTitle>
                <CardDescription>
                  Manage your identity and access control settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h3 className="font-medium">Last Login</h3>
                    <p className="text-sm text-muted-foreground">{formatLastLogin()}</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h3 className="font-medium">Account Status</h3>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-xl">
                    {user?.name ? getInitials(user.name) : <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-medium text-lg">{user?.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
                <div className="w-full bg-muted/50 rounded-full h-1.5 mb-1">
                  <div className="bg-primary h-1.5 rounded-full w-[85%]"></div>
                </div>
                <p className="text-xs text-muted-foreground">Profile completion: 85%</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-6">IAM Features</h2>
        
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
                <p className="text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
