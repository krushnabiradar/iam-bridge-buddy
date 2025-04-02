
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAuthorization } from '@/context/AuthorizationContext';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { 
  Shield, 
  Key, 
  UserPlus, 
  Lock, 
  Activity, 
  BarChart3,
  User,
  Users,
  UserCog,
  Settings,
  Bell,
  Calendar,
  Zap
} from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { userRoles, userPermissions } = useAuthorization();
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
      path: '/admin/users',
      requiredRole: 'admin'
    },
    {
      title: 'Role-based Access',
      description: 'Control permissions with flexible roles',
      icon: <Shield className="h-6 w-6 text-indigo-500" />,
      path: '/admin/roles',
      requiredRole: 'admin'
    },
    {
      title: 'API Keys',
      description: 'Generate and manage secure API keys',
      icon: <Key className="h-6 w-6 text-violet-500" />,
      path: '/dashboard/api-keys',
      requiredRole: 'admin'
    },
    {
      title: 'Security Logs',
      description: 'Monitor authentication activity',
      icon: <Lock className="h-6 w-6 text-red-500" />,
      path: '/dashboard/security-logs',
      requiredRole: 'admin'
    },
    {
      title: 'Usage Analytics',
      description: 'Track user activity and engagement',
      icon: <Activity className="h-6 w-6 text-green-500" />,
      path: '/dashboard/analytics',
      requiredRole: 'admin'
    },
    {
      title: 'Reports',
      description: 'Generate detailed reports on access patterns',
      icon: <BarChart3 className="h-6 w-6 text-orange-500" />,
      path: '/dashboard/reports',
      requiredRole: 'admin'
    },
  ];

  // Recent activity items (mock data)
  const recentActivity = [
    { id: 1, description: 'Password changed', time: '2 hours ago', icon: <Lock className="h-4 w-4 text-blue-500" /> },
    { id: 2, description: 'New login from Chrome/Windows', time: '1 day ago', icon: <Bell className="h-4 w-4 text-orange-500" /> },
    { id: 3, description: 'Profile updated', time: '3 days ago', icon: <User className="h-4 w-4 text-green-500" /> },
  ];

  // Upcoming events (mock data)
  const upcomingEvents = [
    { id: 1, title: 'Security audit', date: 'May 15, 2023', icon: <Shield className="h-4 w-4 text-indigo-500" /> },
    { id: 2, title: 'API key expiration', date: 'May 20, 2023', icon: <Key className="h-4 w-4 text-red-500" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10">
      <NavBar />
      <div className="pt-20 pb-12 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Welcome Section with improved styling */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground/90">
            Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your identity and access settings with ease
          </p>
        </div>

        {/* Main Dashboard Grid with improved layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="glass-card h-full overflow-hidden border-muted/40 shadow-sm">
              <CardHeader className="bg-primary/5 pb-2 border-b border-muted/20">
                <CardTitle className="text-xl flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary/70" />
                  Account Overview
                </CardTitle>
                <CardDescription>
                  Your identity and access information at a glance
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div className="bg-secondary/50 rounded-lg p-4 flex flex-col">
                    <span className="text-xs uppercase text-muted-foreground font-medium mb-1">Last Login</span>
                    <span className="text-sm font-medium">{formatLastLogin()}</span>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4 flex flex-col">
                    <span className="text-xs uppercase text-muted-foreground font-medium mb-1">Account Status</span>
                    <div className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      <span className="text-sm font-medium">Active</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-5">
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">Your Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {userRoles.length > 0 ? (
                      userRoles.map((role, index) => (
                        <Badge key={index} variant="outline" className="bg-secondary/50 px-3 py-1 flex items-center gap-1.5">
                          <Shield className="h-3 w-3 opacity-70" />
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No roles assigned</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">Recent Activity</h3>
                  <div className="space-y-3">
                    {recentActivity.map(item => (
                      <div key={item.id} className="flex items-start p-2 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="p-1.5 rounded-md bg-background mr-3">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.description}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="glass-card overflow-hidden border-muted/40 shadow-sm">
              <CardHeader className="bg-primary/5 pb-2 border-b border-muted/20">
                <CardTitle className="text-lg">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pt-6">
                <Avatar className="h-20 w-20 mb-4 border-2 border-muted shadow-lg">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-xl bg-primary/10">
                    {user?.name ? getInitials(user.name) : <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-medium text-lg mb-1">{user?.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
                <div className="w-full space-y-1 mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Profile completion</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full w-[85%]"></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pb-4 px-4">
                <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Profile
                </Button>
              </CardFooter>
            </Card>
            
            {/* Upcoming Events Card */}
            <Card className="glass-card border-muted/40 shadow-sm">
              <CardHeader className="bg-primary/5 pb-2 border-b border-muted/20">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="flex items-start p-2 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className="p-1.5 rounded-md bg-background mr-3">
                        {event.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Shield className="mr-2 h-5 w-5 text-primary/70" />
            IAM Features
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featureCards.map((card, index) => (
              <RoleGuard 
                key={index}
                role={card.requiredRole}
                fallback={null}
              >
                <Card 
                  className="overflow-hidden hover-lift cursor-pointer transition-all duration-200 border-muted/40 shadow-sm hover:shadow-md"
                  onClick={() => navigate(card.path)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
                      {card.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{card.description}</p>
                  </CardContent>
                </Card>
              </RoleGuard>
            ))}
          </div>
        </div>

        {/* Admin Controls Section */}
        <div className="mt-8">
          <RoleGuard role="admin">
            <Card className="glass-card border-muted/40 shadow-md bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Shield className="h-5 w-5 mr-2 text-primary/80" />
                  Admin Quick Controls
                </CardTitle>
                <CardDescription>
                  Shortcuts to administrative functions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 px-2 flex flex-col items-center justify-center gap-2 bg-background/80 hover:bg-background"
                    onClick={() => navigate('/admin/users')}
                  >
                    <Users className="h-6 w-6 text-blue-500" />
                    <span className="text-xs">Users</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 px-2 flex flex-col items-center justify-center gap-2 bg-background/80 hover:bg-background"
                    onClick={() => navigate('/admin/roles')}
                  >
                    <Shield className="h-6 w-6 text-indigo-500" />
                    <span className="text-xs">Roles</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 px-2 flex flex-col items-center justify-center gap-2 bg-background/80 hover:bg-background"
                    onClick={() => {}}
                  >
                    <Key className="h-6 w-6 text-violet-500" />
                    <span className="text-xs">API Keys</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 px-2 flex flex-col items-center justify-center gap-2 bg-background/80 hover:bg-background"
                    onClick={() => {}}
                  >
                    <UserCog className="h-6 w-6 text-green-500" />
                    <span className="text-xs">Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </RoleGuard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
