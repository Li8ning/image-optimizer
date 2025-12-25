import * as React from 'react';
import { Header } from './Header';
import { cn } from '../lib/cn';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main
        className={cn(
          'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}
