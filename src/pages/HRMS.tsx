
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Users, Briefcase, Building2 } from 'lucide-react';
import NavBar from '@/components/NavBar';

const HRMS = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse tab from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'dashboard');

  // Update URL when tab changes
  useEffect(() => {
    const newParams = new URLSearchParams(location.search);
    newParams.set('tab', activeTab);
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  }, [activeTab, navigate, location.pathname]);

  // Redirect if not authenticated or lacks permission
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    // Restrict access based on role
    if (user && !['admin', 'hr', 'manager', 'employee'].includes(user.role || '')) {
      toast.error("You don't have permission to access this page");
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, user]);

  // Employees query - only for admin, HR, and managers
  const employeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.hrms.getEmployees(),
    enabled: isAuthenticated && (user?.role === 'admin' || user?.role === 'hr' || user?.role === 'manager'),
  });

  // Departments query
  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.hrms.getDepartments(),
    enabled: isAuthenticated,
  });

  // Positions query
  const positionsQuery = useQuery({
    queryKey: ['positions'],
    queryFn: () => api.hrms.getPositions(),
    enabled: isAuthenticated,
  });

  // Handle errors
  useEffect(() => {
    if (employeesQuery.error) {
      toast.error('Failed to load employees data');
    }
    if (departmentsQuery.error) {
      toast.error('Failed to load departments data');
    }
    if (positionsQuery.error) {
      toast.error('Failed to load positions data');
    }
  }, [employeesQuery.error, departmentsQuery.error, positionsQuery.error]);

  if (!isAuthenticated) {
    return null;
  }
  
  // Check if user has permission to add new items
  const canAddItems = user?.role === 'admin' || user?.role === 'hr';
  
  // Check if user can view all employees (admin, HR) or only their team (manager)
  const canViewAllEmployees = user?.role === 'admin' || user?.role === 'hr';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <NavBar />
      <div className="container mx-auto py-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">HRMS Dashboard</h1>
          <div className="flex gap-4">
            {canAddItems && (
              <>
                <Button onClick={() => navigate('/hrms/employees/new')}>
                  Add Employee
                </Button>
                <Button onClick={() => navigate('/hrms/departments/new')}>
                  Add Department
                </Button>
                <Button onClick={() => navigate('/hrms/positions/new')}>
                  Add Position
                </Button>
              </>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <CardDescription>Organization workforce</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-500 mr-3" />
                    <div className="text-2xl font-bold">
                      {employeesQuery.isLoading ? '...' : employeesQuery.data?.employees.length || 0}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab('employees')}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Departments</CardTitle>
                  <CardDescription>Organizational units</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Building2 className="h-8 w-8 text-green-500 mr-3" />
                    <div className="text-2xl font-bold">
                      {departmentsQuery.isLoading ? '...' : departmentsQuery.data?.departments.length || 0}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab('departments')}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Positions</CardTitle>
                  <CardDescription>Job roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Briefcase className="h-8 w-8 text-orange-500 mr-3" />
                    <div className="text-2xl font-bold">
                      {positionsQuery.isLoading ? '...' : positionsQuery.data?.positions.length || 0}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab('positions')}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest HR activities in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-6 text-muted-foreground">No recent activities to display</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employees</CardTitle>
                <CardDescription>
                  {canViewAllEmployees 
                    ? 'Manage all organization employees'
                    : 'Manage your team members'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {employeesQuery.isLoading ? (
                  <p className="text-center py-4">Loading employees...</p>
                ) : employeesQuery.data?.employees.length ? (
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="h-12 px-4 text-left align-middle font-medium">ID</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Department</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Position</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeesQuery.data.employees
                          // Filter employees for managers - only show their team
                          .filter(employee => {
                            if (canViewAllEmployees) return true;
                            // If manager, only show employees in their department
                            return user?.role === 'manager' && employee.department?._id === user.departmentId;
                          })
                          .map((employee: any) => (
                            <tr key={employee._id} className="border-b">
                              <td className="p-4 align-middle">{employee.employeeId}</td>
                              <td className="p-4 align-middle">{employee.userId?.name}</td>
                              <td className="p-4 align-middle">{employee.department?.name || '-'}</td>
                              <td className="p-4 align-middle">{employee.position?.title || '-'}</td>
                              <td className="p-4 align-middle capitalize">{employee.status}</td>
                              <td className="p-4 align-middle">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => navigate(`/hrms/employees/${employee._id}`)}
                                >
                                  View
                                </Button>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">No employees found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>Manage your organization's departments</CardDescription>
              </CardHeader>
              <CardContent>
                {departmentsQuery.isLoading ? (
                  <p className="text-center py-4">Loading departments...</p>
                ) : departmentsQuery.data?.departments.length ? (
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Manager</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentsQuery.data.departments.map((department: any) => (
                          <tr key={department._id} className="border-b">
                            <td className="p-4 align-middle">{department.name}</td>
                            <td className="p-4 align-middle">{department.description || '-'}</td>
                            <td className="p-4 align-middle">{department.manager?.employeeId || '-'}</td>
                            <td className="p-4 align-middle">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => navigate(`/hrms/departments/${department._id}`)}
                                disabled={!canAddItems}
                              >
                                {canAddItems ? 'Edit' : 'View'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">No departments found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="positions">
            <Card>
              <CardHeader>
                <CardTitle>Positions</CardTitle>
                <CardDescription>Manage your organization's positions</CardDescription>
              </CardHeader>
              <CardContent>
                {positionsQuery.isLoading ? (
                  <p className="text-center py-4">Loading positions...</p>
                ) : positionsQuery.data?.positions.length ? (
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="h-12 px-4 text-left align-middle font-medium">Title</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Department</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positionsQuery.data.positions.map((position: any) => (
                          <tr key={position._id} className="border-b">
                            <td className="p-4 align-middle">{position.title}</td>
                            <td className="p-4 align-middle">{position.department?.name || '-'}</td>
                            <td className="p-4 align-middle">{position.isActive ? 'Active' : 'Inactive'}</td>
                            <td className="p-4 align-middle">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => navigate(`/hrms/positions/${position._id}`)}
                                disabled={!canAddItems}
                              >
                                {canAddItems ? 'Edit' : 'View'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">No positions found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HRMS;
