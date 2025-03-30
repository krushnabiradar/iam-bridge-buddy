
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User, FileText, Calendar, MessageSquare, Award, Clock } from 'lucide-react';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  
  const featureCards = [
    {
      title: 'My Profile',
      description: 'View and update your personal information',
      icon: <User className="h-6 w-6 text-blue-500" />,
      action: () => navigate('/profile')
    },
    {
      title: 'Documents',
      description: 'Access your employment documents',
      icon: <FileText className="h-6 w-6 text-green-500" />,
      action: () => navigate('/employee/documents')
    },
    {
      title: 'Leave Requests',
      description: 'Request time off and check balances',
      icon: <Calendar className="h-6 w-6 text-violet-500" />,
      action: () => navigate('/employee/leave')
    },
    {
      title: 'Messages',
      description: 'View company announcements and messages',
      icon: <MessageSquare className="h-6 w-6 text-indigo-500" />,
      action: () => navigate('/employee/messages')
    },
    {
      title: 'Performance',
      description: 'Review your goals and feedback',
      icon: <Award className="h-6 w-6 text-orange-500" />,
      action: () => navigate('/employee/performance')
    },
    {
      title: 'Time Tracking',
      description: 'Log your work hours and activities',
      icon: <Clock className="h-6 w-6 text-red-500" />,
      action: () => navigate('/employee/timesheet')
    },
  ];

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Employee Self-Service</h2>
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
                Access
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default EmployeeDashboard;
