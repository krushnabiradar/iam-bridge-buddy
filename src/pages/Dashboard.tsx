
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { User, Shield, KeyRound, Activity, Bell } from 'lucide-react';

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
                  Identity and Access Management Dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h3 className="font-medium">Last Login</h3>
                    <p className="text-sm text-muted-foreground">{formatLastLogin()}</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h3 className="font-medium">Account Type</h3>
                    <p className="text-sm text-muted-foreground capitalize">{user?.role || 'User'}</p>
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
        
        {/* IAM Features */}
        <h2 className="text-2xl font-bold mb-6">Identity & Access Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 text-primary mr-2" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your personal information and account details
              </p>
              <Button className="w-full" variant="outline" onClick={() => navigate('/profile')}>
                Manage Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 text-green-500 mr-2" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Review and update your security settings
              </p>
              <Button className="w-full" variant="outline" onClick={() => navigate('/profile')}>
                Security Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <KeyRound className="h-5 w-5 text-amber-500 mr-2" />
                API Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Generate and manage API keys and tokens
              </p>
              <Button className="w-full" variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 text-blue-500 mr-2" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Review login history and account activity
              </p>
              <Button className="w-full" variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
