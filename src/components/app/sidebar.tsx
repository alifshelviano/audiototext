'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar({className}: {className?: string}) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Meetings', href: '/history', icon: List },
  ];

  return (
    <div className={cn('w-64 bg-gray-900 text-white flex flex-col h-screen', className)}>
      <div className="p-4">
        <h2 className="text-xl font-headline text-sidebar-foreground">LISN AI</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="px-4 space-y-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t">
     
      </div>
    </div>
  );
}
