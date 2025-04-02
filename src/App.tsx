
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { AuthorizationProvider } from './context/AuthorizationContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'sonner';
import { Header } from './components/Header';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import Notifications from './pages/Notifications';
import NotificationPreferences from './pages/NotificationPreferences';
import UserManagement from './pages/admin/UserManagement';
import RoleManagement from './pages/admin/RoleManagement';
import NotFound from './pages/NotFound';
import { useAuth } from './context/AuthContext';

import './App.css';

// Create a client with better caching settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false, // Disable automatic refetching when window gets focus
    },
  },
});

// Protected route component to redirect authenticated users
const ProtectedIndex = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Index />;
};

// Protected route component to redirect unauthenticated users
const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return element;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter>
          <AuthProvider>
            <AuthorizationProvider>
              <NotificationProvider>
                <Toaster 
                  position="top-right" 
                  closeButton 
                  richColors 
                  toastOptions={{
                    duration: 4000,
                    className: 'toast-enhanced',
                  }}
                />
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <div className="flex-1">
                    <Routes>
                      <Route path="/" element={<ProtectedIndex />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
                      <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      
                      {/* Notification Routes */}
                      <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} />} />
                      <Route path="/notifications/preferences" element={<ProtectedRoute element={<NotificationPreferences />} />} />
                      
                      {/* Admin Routes */}
                      <Route path="/admin/users" element={<ProtectedRoute element={<UserManagement />} />} />
                      <Route path="/admin/roles" element={<ProtectedRoute element={<RoleManagement />} />} />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </div>
              </NotificationProvider>
            </AuthorizationProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
