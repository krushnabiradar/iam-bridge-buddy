
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Briefcase, FileText, Calendar, Award } from 'lucide-react';

const HRDashboard = () => {
  const navigate = useNavigate();
  
  const featureCards = [
    {
      title: 'Employee Management',
      description: 'Manage employee records and information',
      icon: <Users className="h-6 w-6 text-blue-500" />,
      action: () => navigate('/hrms')
    },
    {
      title: 'Departments',
      description: 'Organize and manage department structure',
      icon: <Building2 className="h-6 w-6 text-indigo-500" />,
      action: () => navigate('/hrms?tab=departments')
    },
    {
      title: 'Positions',
      description: 'Define roles and job positions',
      icon: <Briefcase className="h-6 w-6 text-violet-500" />,
      action: () => navigate('/hrms?tab=positions')
    },
    {
      title: 'Documents',
      description: 'Manage employee documents and forms',
      icon: <FileText className="h-6 w-6 text-green-500" />,
      action: () => navigate('/hrms/documents')
    },
    {
      title: 'Leave Management',
      description: 'Track and approve time off requests',
      icon: <Calendar className="h-6 w-6 text-orange-500" />,
      action: () => navigate('/hrms/leave')
    },
    {
      title: 'Performance',
      description: 'Review employee performance and goals',
      icon: <Award className="h-6 w-6 text-red-500" />,
      action: () => navigate('/hrms/performance')
    },
  ];

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">HR Management</h2>
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

export default HRDashboard;
