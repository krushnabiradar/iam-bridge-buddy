
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, FileCheck, MessageSquare, Calendar, BarChart, ClipboardList } from 'lucide-react';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  
  const featureCards = [
    {
      title: 'Team Members',
      description: 'View and manage your team',
      icon: <Users className="h-6 w-6 text-blue-500" />,
      action: () => navigate('/hrms')
    },
    {
      title: 'Approvals',
      description: 'Review pending requests and approvals',
      icon: <FileCheck className="h-6 w-6 text-green-500" />,
      action: () => navigate('/manager/approvals')
    },
    {
      title: 'Team Chat',
      description: 'Communicate with your team members',
      icon: <MessageSquare className="h-6 w-6 text-indigo-500" />,
      action: () => navigate('/manager/team-chat')
    },
    {
      title: 'Schedule',
      description: 'Manage team schedules and shifts',
      icon: <Calendar className="h-6 w-6 text-violet-500" />,
      action: () => navigate('/manager/schedule')
    },
    {
      title: 'Performance',
      description: 'Track team metrics and performance',
      icon: <BarChart className="h-6 w-6 text-orange-500" />,
      action: () => navigate('/manager/performance')
    },
    {
      title: 'Tasks',
      description: 'Assign and track team tasks',
      icon: <ClipboardList className="h-6 w-6 text-red-500" />,
      action: () => navigate('/manager/tasks')
    },
  ];

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Manager Dashboard</h2>
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

export default ManagerDashboard;
