
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { NavBar } from './NavBar';
import { ThemeToggle } from './ThemeToggle';
import NotificationBell from './NotificationBell';

export function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link to="/" className="flex items-center gap-2 font-semibold mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.688h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
            <circle cx="7.5" cy="11.5" r="1.5"></circle>
            <circle cx="12" cy="7.5" r="1.5"></circle>
            <circle cx="16.5" cy="11.5" r="1.5"></circle>
          </svg>
          <span className="hidden sm:inline-block">IAM System</span>
        </Link>
        <NavBar className="mx-6" />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && <NotificationBell />}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
