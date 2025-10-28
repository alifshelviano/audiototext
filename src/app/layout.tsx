'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from './AuthProvider';
import { SessionProvider } from './SessionProvider';
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { useState, useEffect } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Open sidebar by default on larger screens
    setSidebarOpen(window.innerWidth >= 768);
  }, []);

  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <SessionProvider>
          <AuthProvider>
            <div className="flex h-screen bg-gray-50 overflow-hidden">
              <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
              />
              <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                  <div className="py-8 px-4 sm:px-6 md:px-8">
                    {children}
                  </div>
                </main>
              </div>
            </div>
            <Toaster />
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
