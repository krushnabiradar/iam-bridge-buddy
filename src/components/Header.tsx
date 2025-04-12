
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NavBar from './NavBar';
import { ThemeToggle } from './ThemeToggle';
import NotificationBell from './NotificationBell';
import { Shield } from 'lucide-react';

export function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link to="/" className="flex items-center gap-2 font-semibold mr-4 text-primary">
          <Shield className="h-6 w-6" />
          <span className="hidden sm:inline-block">IAM System</span>
        </Link>
        <NavBar className="mx-6" />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && <NotificationBell />}
          </div>
        </div>
      </div>
    </header>
  );
}
