
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowLeft } from 'lucide-react';

const SalesModule = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    // Restrict access based on role
    if (user && !['admin', 'manager', 'sales'].includes(user.role || '')) {
      toast.error("You don't have permission to access this page");
      navigate('/erp');
    }
  }, [isAuthenticated, navigate, user]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto pt-20 py-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/erp')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to ERP
          </Button>
          <h1 className="text-3xl font-bold">Sales & CRM</h1>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
              Sales Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <TrendingUp className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-medium">Coming Soon</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                The Sales & CRM module is currently under development. Check back soon for features like lead management, opportunity tracking, and customer analytics.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SalesModule;
