"use client";

import { useState, useEffect, RefObject } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import { LogOut, User, Settings, Menu } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { NotificationDropdown } from "@/components/app/notifications/notifications-dropdown";

// The props are now optional for pages that don't use the full dashboard layout
interface HeaderProps {
  toggleSidebar?: () => void;
  mainContentRef?: RefObject<HTMLDivElement>;
}

export function Header({ toggleSidebar, mainContentRef }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const mainContent = mainContentRef?.current;

    const handleScroll = () => {
      if (mainContent) {
        setIsScrolled(mainContent.scrollTop > 10);
      } else {
        setIsScrolled(window.scrollY > 10);
      }
    };

    const scrollContainer = mainContent || window;
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [mainContentRef]);

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b text-white transition-colors duration-300",
        isScrolled
          ? "bg-cyan-600/80 backdrop-blur-sm border-transparent" // Scrolled: semi-transparent cyan
          : "bg-cyan-600 border-cyan-700" // Top: solid cyan
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {toggleSidebar && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-white hover:bg-white/10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="LISN Logo" className="h-8 w-auto" />
            <h1 className="font-bold text-2xl text-white">LISN</h1>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border bg-white/20 border-white/30">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-white">Online</span>
            </div>
          )}

          {/* NEW: Replaced the old Bell dropdown with NotificationDropdown */}
          {user && <NotificationDropdown />}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <Avatar className="h-10 w-10 border-2 border-white/50 hover:border-white transition-colors">
                  <AvatarImage src={user?.avatar} alt="Profile" />
                  <AvatarFallback className="font-semibold bg-white/20 text-white">{user ? getUserInitials(user.name) : "U"}</AvatarFallback>
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
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center w-full">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/login" className="flex items-center w-full">
                      Sign In
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/register" className="flex items-center w-full">
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
