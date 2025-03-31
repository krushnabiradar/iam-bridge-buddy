
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import HRMSModules from '@/components/hrms/HRMSModules';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const HRMS = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
          <h1 className="text-3xl font-bold">HR Management System</h1>
        </div>
        <HRMSModules />
      </main>
    </div>
  );
};

export default HRMS;
