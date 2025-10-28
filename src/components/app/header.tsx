'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  Menu, 
} from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [notificationCount, setNotificationCount] = useState(3);
  const { user, logout } = useAuth();

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-blue-600 text-white">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left Section - Logo & Navigation */}
        <div className="flex items-center gap-2 md:gap-6">
          {/* Menu Toggle */}
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="text-white hover:bg-blue-700 hover:text-white">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            
            <div className="hidden md:flex flex-col">
              <h1 className="font-bold text-2xl text-white">
                
              </h1>
            </div>
          </Link>
        </div>

        {/* Right Section - User Menu & Actions */}
        <div className="flex items-center gap-3">
          {/* Online Status */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-800">Online</span>
            </div>
          )}

          {/* Notifications */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-blue-700 hover:text-white">
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

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <Avatar className="h-10 w-10 border-2 border-transparent hover:border-blue-200 transition-colors">
                  <AvatarImage src={user?.avatar} alt="Profile" />
                  <AvatarFallback className="bg-gray-700 text-white font-semibold">
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
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer gap-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="w-full cursor-pointer">
                      Sign In
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register" className="w-full cursor-pointer">
                      Create Account
                    </Link>
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
