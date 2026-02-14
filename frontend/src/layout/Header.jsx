import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, Search, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../utils/cn';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Generate breadcrumbs from path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    return {
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      path
    };
  });

  return (
    <header className="sticky top-0 z-20 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden md:flex items-center text-sm text-muted-foreground">
          <span className="cursor-pointer hover:text-foreground transition-colors" onClick={() => navigate('/')}>Dashboard</span>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span
                className={cn("cursor-pointer hover:text-foreground transition-colors", index === breadcrumbs.length - 1 && "font-medium text-foreground")}
                onClick={() => navigate(crumb.path)}
              >
                {crumb.name}
              </span>
            </React.Fragment>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 h-9 bg-muted/50 border-none focus-visible:ring-1"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
          </Button>

          {user && (
            <div className="flex items-center gap-2 pl-4 border-l">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium leading-none">{user.name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
