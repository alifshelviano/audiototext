'use client';

import { useState, useEffect, useRef } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="bg-gray-100">
      <Sidebar isOpen={sidebarOpen} isDesktop={isDesktop} toggleSidebar={toggleSidebar} />
      
      <div 
        className={cn(
          "flex flex-col h-screen",
          // On desktop, push the content to the right when the sidebar is open
          isDesktop && sidebarOpen ? "ml-64" : "ml-0",
          "transition-all duration-300 ease-in-out"
        )}
      >
        <Header toggleSidebar={toggleSidebar} mainContentRef={mainContentRef} />
        <main ref={mainContentRef} className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
