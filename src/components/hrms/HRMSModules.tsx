
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Calendar, ClipboardCheck, DollarSign, UserPlus, BarChart, Bell } from 'lucide-react';
import EmployeeManagement from './EmployeeManagement';

const HRMSModules = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse module from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const moduleFromUrl = queryParams.get('module');
  const [activeModule, setActiveModule] = useState(moduleFromUrl || 'employees');

  // Update URL when module changes
  const handleModuleChange = (value: string) => {
    setActiveModule(value);
    const newParams = new URLSearchParams(location.search);
    newParams.set('module', value);
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  // Check if user has access to the module based on role
  const hasAccess = (module: string) => {
    const role = user?.role || '';
    
    switch (module) {
      case 'employees':
        return ['admin', 'hr', 'manager'].includes(role);
      case 'attendance':
      case 'leaves':
        return ['admin', 'hr', 'manager', 'employee'].includes(role);
      case 'payroll':
      case 'recruitment':
        return ['admin', 'hr'].includes(role);
      case 'performance':
        return ['admin', 'hr', 'manager'].includes(role);
      case 'notifications':
        return true; // All authenticated users can access notifications
      default:
        return false;
    }
  };

  // Filter modules based on user role
  const availableModules = [
    { id: 'employees', name: 'Employees', icon: <Users size={16} /> },
    { id: 'attendance', name: 'Attendance', icon: <Calendar size={16} /> },
    { id: 'leaves', name: 'Leave Management', icon: <ClipboardCheck size={16} /> },
    { id: 'payroll', name: 'Payroll', icon: <DollarSign size={16} /> },
    { id: 'recruitment', name: 'Recruitment', icon: <UserPlus size={16} /> },
    { id: 'performance', name: 'Performance', icon: <BarChart size={16} /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={16} /> },
  ].filter(module => hasAccess(module.id));

  return (
    <div className="container mx-auto py-6">
      <Tabs 
        value={activeModule} 
        onValueChange={handleModuleChange} 
        className="w-full"
      >
        <TabsList className="mb-6 flex flex-wrap">
          {availableModules.map((module) => (
            <TabsTrigger 
              key={module.id} 
              value={module.id}
              className="flex items-center gap-2"
            >
              {module.icon}
              {module.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="employees">
          <EmployeeManagement />
        </TabsContent>
        
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Tracking</CardTitle>
              <CardDescription>Track daily attendance and manage clock-in/clock-out records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Calendar className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-medium">Coming Soon</h3>
                <p className="text-muted-foreground mt-2">
                  The attendance tracking module is currently under development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="leaves">
          <Card>
            <CardHeader>
              <CardTitle>Leave Management</CardTitle>
              <CardDescription>Apply for leaves and manage leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ClipboardCheck className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-medium">Coming Soon</h3>
                <p className="text-muted-foreground mt-2">
                  The leave management module is currently under development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Management</CardTitle>
              <CardDescription>Manage salary processing and generate salary slips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <DollarSign className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-medium">Coming Soon</h3>
                <p className="text-muted-foreground mt-2">
                  The payroll management module is currently under development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recruitment">
          <Card>
            <CardHeader>
              <CardTitle>Recruitment</CardTitle>
              <CardDescription>Manage job postings and candidate applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <UserPlus className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-medium">Coming Soon</h3>
                <p className="text-muted-foreground mt-2">
                  The recruitment module is currently under development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Management</CardTitle>
              <CardDescription>Manage performance reviews and KPI tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <BarChart className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-medium">Coming Soon</h3>
                <p className="text-muted-foreground mt-2">
                  The performance management module is currently under development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>View company announcements and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Bell className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-medium">Coming Soon</h3>
                <p className="text-muted-foreground mt-2">
                  The notifications module is currently under development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRMSModules;
