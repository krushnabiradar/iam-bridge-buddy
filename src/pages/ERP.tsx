
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import ERPModules from '@/components/erp/ERPModules';
import NavBar from '@/components/NavBar';

const ERP = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or lacks permission
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    // Restrict access based on role
    if (user && !['admin', 'manager', 'employee'].includes(user.role || '')) {
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
        <h1 className="text-3xl font-bold mb-6">Enterprise Resource Planning</h1>
        <ERPModules />
      </main>
    </div>
  );
};

export default ERP;
