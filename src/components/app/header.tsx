import { BrainCircuit } from 'lucide-react';
import React from 'react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <a className="flex items-center gap-2 font-semibold" href="#">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">AudioScribe AI</span>
        </a>
      </div>
    </header>
  );
}
