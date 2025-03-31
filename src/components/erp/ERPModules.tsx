
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingCart, BarChart3, Briefcase, TrendingUp, Truck, Settings, FileSpreadsheet } from 'lucide-react';

const ERPModules = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Define all ERP modules
  const erpModules = [
    {
      id: 'hrms',
      name: 'Human Resources',
      icon: <Users className="h-10 w-10 text-blue-500" />,
      description: 'Manage employees, attendance, leaves, and payroll',
      route: '/hrms',
      roles: ['admin', 'hr', 'manager', 'employee']
    },
    {
      id: 'sales',
      name: 'Sales & CRM',
      icon: <TrendingUp className="h-10 w-10 text-green-500" />,
      description: 'Track leads, opportunities, and customer relationships',
      route: '/erp/sales',
      roles: ['admin', 'manager', 'sales']
    },
    {
      id: 'inventory',
      name: 'Inventory Management',
      icon: <ShoppingCart className="h-10 w-10 text-purple-500" />,
      description: 'Manage stock levels, items, and warehouses',
      route: '/erp/inventory',
      roles: ['admin', 'manager', 'inventory']
    },
    {
      id: 'finance',
      name: 'Finance & Accounting',
      icon: <FileSpreadsheet className="h-10 w-10 text-red-500" />,
      description: 'Handle invoices, expenses, and financial reporting',
      route: '/erp/finance',
      roles: ['admin', 'finance']
    },
    {
      id: 'procurement',
      name: 'Procurement',
      icon: <Truck className="h-10 w-10 text-orange-500" />,
      description: 'Manage vendors, purchase orders, and deliveries',
      route: '/erp/procurement',
      roles: ['admin', 'manager', 'procurement']
    },
    {
      id: 'projects',
      name: 'Project Management',
      icon: <Briefcase className="h-10 w-10 text-teal-500" />,
      description: 'Plan, execute, and track project activities',
      route: '/erp/projects',
      roles: ['admin', 'manager', 'employee']
    },
    {
      id: 'reports',
      name: 'Reports & Analytics',
      icon: <BarChart3 className="h-10 w-10 text-indigo-500" />,
      description: 'View business insights and generate reports',
      route: '/erp/reports',
      roles: ['admin', 'manager']
    },
    {
      id: 'settings',
      name: 'System Settings',
      icon: <Settings className="h-10 w-10 text-gray-500" />,
      description: 'Configure system preferences and user permissions',
      route: '/erp/settings',
      roles: ['admin']
    }
  ];

  // Filter modules based on user role
  const userRole = user?.role || '';
  const accessibleModules = erpModules.filter(module => 
    module.roles.includes(userRole) || userRole === 'admin'
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {accessibleModules.map(module => (
        <Card 
          key={module.id}
          className="hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{module.name}</CardTitle>
              <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                {module.icon}
              </div>
            </div>
            <CardDescription>{module.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate(module.route)}>
              Access Module
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ERPModules;
