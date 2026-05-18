'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">?</span>
          </div>
          <span className="font-bold text-foreground">ExamGhost</span>
        </Link>

        {/* Center navigation */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              isActive('/') && pathname === '/'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Home
          </Link>
          <Link
            href="/history"
            className={`text-sm font-medium transition-colors ${
              isActive('/history')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            History
          </Link>
          <Link
            href="/analytics"
            className={`text-sm font-medium transition-colors ${
              isActive('/analytics')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Dashboard
          </Link>
        </div>


      </div>
    </nav>
  );
}
