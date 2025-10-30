'use client';

import { useState, useEffect, RefObject } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAuth } from '@/app/AuthProvider';
import { 
  LogOut, 
  User, 
  Settings, 
  Bell, 
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';

// The props are now optional for pages that don't use the full dashboard layout
interface HeaderProps {
  toggleSidebar?: () => void;
  mainContentRef?: RefObject<HTMLDivElement>;
}

export function Header({ toggleSidebar, mainContentRef }: HeaderProps) {
  const [notificationCount, setNotificationCount] = useState(3);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const mainContent = mainContentRef?.current;

    if (mainContent) {
      const handleScroll = () => {
        setIsScrolled(mainContent.scrollTop > 0);
      };
      mainContent.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        mainContent.removeEventListener('scroll', handleScroll);
      };
    } else {
      // Fallback to window scroll for pages without mainContentRef
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 0);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [mainContentRef]);

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b text-white transition-colors duration-300',
        isScrolled ? 'bg-blue-600/80 backdrop-blur-sm' : 'bg-blue-600'
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* The sidebar toggle is only shown if the function is provided */}
          {toggleSidebar && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-white hover:text-gray-200">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="LISN Logo" className="h-8 w-auto" />
            <h1 className="font-bold text-2xl text-white">LISN</h1>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-800">Online</span>
            </div>
          )}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">New meeting scheduled</span>
                  </div>
                  <span className="text-sm text-muted-foreground mt-1">
                    Team sync meeting starts in 15 minutes
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Transcript ready</span>
                  </div>
                  <span className="text-sm text-muted-foreground mt-1">
                    Your meeting transcript has been processed
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-center cursor-pointer">
                  <span className="text-sm text-blue-600">View all notifications</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <Avatar className="h-10 w-10 border-2 border-transparent hover:border-blue-200 transition-colors">
                  <AvatarImage src={user?.avatar} alt="Profile" />
                  <AvatarFallback className="bg-gray-200 text-blue-600 font-semibold">
                    {user ? getUserInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem><User className="w-4 h-4 mr-2"/>Profile</DropdownMenuItem>
                  <DropdownMenuItem><Settings className="w-4 h-4 mr-2"/>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                    <LogOut className="w-4 h-4 mr-2"/>
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login">Sign In</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register">Create Account</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
