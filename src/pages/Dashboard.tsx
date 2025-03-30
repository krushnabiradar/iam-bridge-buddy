
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { User } from 'lucide-react';

// Import role-specific dashboards
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import HRDashboard from '@/components/dashboards/HRDashboard';
import ManagerDashboard from '@/components/dashboards/ManagerDashboard';
import EmployeeDashboard from '@/components/dashboards/EmployeeDashboard';
import UserDashboard from '@/components/dashboards/UserDashboard';

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

  // Function to render the appropriate dashboard based on user role
  const renderRoleDashboard = () => {
    if (!user) return <UserDashboard />;
    
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'hr':
        return <HRDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      default:
        return <UserDashboard />;
    }
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
                  {user?.role === 'admin' ? 'Administrator Dashboard' : 
                   user?.role === 'hr' ? 'Human Resources Dashboard' :
                   user?.role === 'manager' ? 'Manager Dashboard' :
                   user?.role === 'employee' ? 'Employee Self-Service' :
                   'User Dashboard'}
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
        
        {/* Role-specific dashboard */}
        {renderRoleDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
