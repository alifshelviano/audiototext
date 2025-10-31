'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, List, Globe, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  isDesktop: boolean;
  toggleSidebar?: () => void;
}

export function Sidebar({ isOpen, isDesktop, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'History', href: '/history', icon: List },
    { name: 'Public Meetings', href: '/public-meetings', icon: Globe },
  ];

  const content = (
    <div className="flex flex-col flex-1">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="LISN Logo" className="h-8 w-auto" />
          <h1 className="font-bold text-2xl text-black">LISN</h1>
        </Link>
        {!isDesktop && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-4 space-y-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white text-black shadow-lg transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        {content}
      </aside>
    );
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white text-black shadow-lg transition-all duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "w-64 md:hidden"
        )}
      >
        {content}
      </div>
    </> 
  );
}
