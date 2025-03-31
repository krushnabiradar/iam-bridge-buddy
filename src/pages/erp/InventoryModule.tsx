
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

const InventoryModule = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    // Restrict access based on role
    if (user && !['admin', 'manager', 'inventory'].includes(user.role || '')) {
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
          <h1 className="text-3xl font-bold">Inventory Management</h1>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-6 w-6 text-purple-500 mr-2" />
              Inventory Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ShoppingCart className="w-16 h-16 text-purple-500 mb-4" />
              <h3 className="text-xl font-medium">Coming Soon</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                The Inventory Management module is currently under development. Check back soon for features like stock tracking, warehouse management, and inventory reports.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default InventoryModule;
